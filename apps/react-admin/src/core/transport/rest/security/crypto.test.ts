import { describe, expect, it } from 'vitest';

import { aesDecrypt, aesEncrypt, generateAesKey, importRsaPublicKey, rsaEncrypt } from './crypto';

describe('security crypto protocol', () => {
  it('AES-GCM 请求 ciphertext/TagIv 与响应 combined 可解密', async () => {
    const { key } = await generateAesKey();
    const aad = 'X-Request-ID=n1&X-Request-Timestamp=1';
    const body = { username: 'root' };

    const enc = await aesEncrypt(key, aad, body);
    expect(enc.Ciphertext.length).toBeGreaterThan(0);
    expect(enc.TagIv.length).toBeGreaterThan(0);

    // 响应 AAD 为空
    const plain = JSON.stringify({ code: 0, data: true });
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const sealed = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: encoder.encode(''), tagLength: 128 },
        key,
        encoder.encode(plain),
      ),
    );
    const combined = new Uint8Array(sealed.length + iv.length);
    combined.set(sealed, 0);
    combined.set(iv, sealed.length);
    const b64 = btoa(String.fromCodePoint(...combined));
    const decrypted = await aesDecrypt(b64, key, '');
    expect(JSON.parse(decrypted)).toEqual({ code: 0, data: true });
  });

  it('RSA-OAEP-SHA256 可加密 AES key 字符串', async () => {
    const pair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    );
    const spki = await crypto.subtle.exportKey('spki', pair.publicKey);
    const publicKeyB64 = btoa(String.fromCodePoint(...new Uint8Array(spki)));
    const imported = await importRsaPublicKey(publicKeyB64);
    const { keyBase64 } = await generateAesKey();
    const encrypted = await rsaEncrypt(keyBase64, imported);
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      pair.privateKey,
      Uint8Array.from(atob(encrypted), (c) => c.codePointAt(0) ?? 0),
    );
    expect(new TextDecoder().decode(decrypted)).toBe(keyBase64);
  });
});
