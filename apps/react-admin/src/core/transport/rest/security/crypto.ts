/**
 * 请求安全加解密：RSA-OAEP-SHA256 + AES-256-GCM（Web Crypto）。
 * 协议与 Java CryptoService / mock crypto 一致。
 */

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCodePoint(bytes[i] ?? 0);
  }
  return globalThis.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = globalThis.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.codePointAt(i) ?? 0;
  }
  return bytes.buffer;
}

/** 按 key 排序后 `key=value` 用 `&` 连接；空值跳过。 */
export function buildAad(params: Record<string, string | number | undefined | null>): string {
  const keys = Object.keys(params)
    .filter((k) => {
      const v = params[k];
      return v !== '' && v !== undefined && v !== null;
    })
    .sort();
  return keys.map((k) => `${k}=${String(params[k])}`).join('&');
}

export async function generateAesKey(): Promise<{ key: CryptoKey; keyBase64: string }> {
  const key = await globalThis.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
  const keyRaw = await globalThis.crypto.subtle.exportKey('raw', key);
  return {
    key,
    keyBase64: arrayBufferToBase64(keyRaw),
  };
}

export interface AesEncryptResult {
  Ciphertext: string;
  TagIv: string;
}

/**
 * AES-GCM 加密。
 * - 有 data：JSON.stringify 后加密，ciphertext base64 放 body
 * - 无 data：空明文（用于 GET 或独立 Sign 的 MAC）
 * - TagIv = base64(tag + iv)
 */
export async function aesEncrypt(
  key: CryptoKey,
  aad: string,
  data?: unknown,
): Promise<AesEncryptResult> {
  const encoder = new TextEncoder();
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));

  let plainBytes: Uint8Array;
  if (data === undefined || data === null) {
    plainBytes = new Uint8Array();
  } else if (typeof data === 'string') {
    plainBytes = encoder.encode(data);
  } else {
    plainBytes = encoder.encode(JSON.stringify(data));
  }

  const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: encoder.encode(aad),
      tagLength: 128,
    },
    key,
    plainBytes,
  );

  const encrypted = new Uint8Array(encryptedBuffer);
  const tagLength = 16;
  if (encrypted.length < tagLength) {
    throw new Error('encrypted data too short');
  }

  const ciphertext = encrypted.slice(0, encrypted.length - tagLength);
  const tag = encrypted.slice(encrypted.length - tagLength);
  const tagIv = new Uint8Array(tag.length + iv.length);
  tagIv.set(tag, 0);
  tagIv.set(iv, tag.length);

  return {
    Ciphertext: arrayBufferToBase64(ciphertext),
    TagIv: arrayBufferToBase64(tagIv),
  };
}

/** 解密响应 combined：base64(ciphertext + tag + iv)，响应 AAD 为空串。 */
export async function aesDecrypt(
  combinedBase64: string,
  key: CryptoKey,
  aad: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = new Uint8Array(base64ToArrayBuffer(combinedBase64));
  const ivLength = 12;
  const tagLength = 16;

  if (data.length < ivLength + tagLength) {
    throw new Error('invalid encrypted data length');
  }

  const iv = data.slice(data.length - ivLength);
  const sealed = data.slice(0, data.length - ivLength);

  const decrypted = await globalThis.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: encoder.encode(aad),
      tagLength: 128,
    },
    key,
    sealed,
  );

  return new TextDecoder().decode(decrypted);
}

export async function rsaEncrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    key,
    encoder.encode(data),
  );
  return arrayBufferToBase64(encrypted);
}

/** 将 SPKI base64（无 PEM 头）导入为 RSA-OAEP CryptoKey。 */
export async function importRsaPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const trimmed = publicKeyBase64.trim();
  let der: ArrayBuffer;
  if (trimmed.includes('BEGIN')) {
    const b64 = trimmed
      .replace(/-----BEGIN [^-]+-----/g, '')
      .replace(/-----END [^-]+-----/g, '')
      .replace(/\s+/g, '');
    der = base64ToArrayBuffer(b64);
  } else {
    der = base64ToArrayBuffer(trimmed.replace(/\s/g, ''));
  }

  return globalThis.crypto.subtle.importKey(
    'spki',
    der,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );
}
