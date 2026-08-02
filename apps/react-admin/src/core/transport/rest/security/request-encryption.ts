/**
 * 请求安全协议：构建加密/签名请求配置（纯函数 seam，便于单测）。
 */

import { buildAad } from './crypto';
import type { aesEncrypt, generateAesKey, rsaEncrypt } from './crypto';
import { SECURITY_HEADERS, SIGN_DATA_AAD_KEY } from './headers';

export interface SecurityEncryptRequestConfig {
  data?: unknown;
  headers?: Record<string, unknown>;
  method?: string;
  params?: Record<string, unknown> | string | URLSearchParams;
}

export interface SecurityEncryptedRequestConfig {
  aesKey?: CryptoKey;
  data?: unknown;
  headers: Record<string, unknown>;
}

export interface SecurityEncryptionDeps {
  aesEncrypt: typeof aesEncrypt;
  ensurePublicKey: () => Promise<string>;
  generateAesKey: typeof generateAesKey;
  getPublicCryptoKey: () => Promise<CryptoKey | undefined>;
  now?: () => number;
  nonce?: () => string;
  rsaEncrypt: typeof rsaEncrypt;
}

export interface SecurityHeaderFlags {
  timestampEnabled: boolean;
  nonceEnabled: boolean;
  /** 已有 X-Request-ID 时复用，避免覆盖外层拦截器 */
  existingRequestId?: string;
  existingTimestamp?: string;
}

function normalizeParams(
  params: Record<string, unknown> | string | URLSearchParams | undefined,
): Record<string, string> {
  if (!params) return {};

  if (typeof params === 'string') {
    return Object.fromEntries(new URLSearchParams(params));
  }

  if (params instanceof URLSearchParams) {
    return Object.fromEntries(params.entries());
  }

  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = String(v);
  }
  return out;
}

function resolveIdentity(
  headers: Record<string, unknown>,
  flags: SecurityHeaderFlags,
  deps: Pick<SecurityEncryptionDeps, 'now' | 'nonce'>,
): { timestamp?: string; requestId?: string } {
  const timestamp =
    flags.existingTimestamp ??
    (headers[SECURITY_HEADERS.REQUEST_TIMESTAMP] != null
      ? String(headers[SECURITY_HEADERS.REQUEST_TIMESTAMP])
      : undefined) ??
    (flags.timestampEnabled ? String(deps.now?.() ?? Date.now()) : undefined);

  const requestId =
    flags.existingRequestId ??
    (headers[SECURITY_HEADERS.REQUEST_ID] != null
      ? String(headers[SECURITY_HEADERS.REQUEST_ID])
      : undefined) ??
    (flags.nonceEnabled
      ? (deps.nonce?.() ?? Math.random().toString(36).slice(2, 18))
      : undefined);

  return { timestamp, requestId };
}

function applyIdentityHeaders(
  headers: Record<string, unknown>,
  identity: { timestamp?: string; requestId?: string },
): void {
  if (identity.timestamp != null && identity.timestamp !== '') {
    headers[SECURITY_HEADERS.REQUEST_TIMESTAMP] = identity.timestamp;
  }
  if (identity.requestId != null && identity.requestId !== '') {
    headers[SECURITY_HEADERS.REQUEST_ID] = identity.requestId;
  }
}

function buildRequestAad(
  identity: { timestamp?: string; requestId?: string },
  params: Record<string, string>,
): string {
  return buildAad({
    [SECURITY_HEADERS.REQUEST_ID]: identity.requestId,
    [SECURITY_HEADERS.REQUEST_TIMESTAMP]: identity.timestamp,
    ...params,
  });
}

function buildSignAad(
  identity: { timestamp?: string; requestId?: string },
  params: Record<string, string>,
  rawBody: string,
): string {
  return buildAad({
    [SECURITY_HEADERS.REQUEST_ID]: identity.requestId,
    [SECURITY_HEADERS.REQUEST_TIMESTAMP]: identity.timestamp,
    ...params,
    [SIGN_DATA_AAD_KEY]: rawBody.length > 0 ? rawBody : undefined,
  });
}

function bodyToSignString(data: unknown): string {
  if (data === undefined || data === null) return '';
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
}

/**
 * Encrypt 路径：RSA 包 AES key + AES-GCM 加密 body；GET 空 body 仍带签名 MAC。
 */
export async function createEncryptedRequestConfig(
  config: SecurityEncryptRequestConfig,
  deps: SecurityEncryptionDeps,
  flags: SecurityHeaderFlags = { timestampEnabled: true, nonceEnabled: true },
): Promise<SecurityEncryptedRequestConfig> {
  const headers: Record<string, unknown> = { ...(config.headers ?? {}) };
  const identity = resolveIdentity(headers, flags, deps);
  applyIdentityHeaders(headers, identity);

  // Encrypt/Sign AAD 需要 Request-ID；若 nonce 关仍强制补一个
  if (!headers[SECURITY_HEADERS.REQUEST_ID]) {
    const id = deps.nonce?.() ?? Math.random().toString(36).slice(2, 18);
    headers[SECURITY_HEADERS.REQUEST_ID] = id;
    identity.requestId = id;
  }
  if (flags.timestampEnabled && !headers[SECURITY_HEADERS.REQUEST_TIMESTAMP]) {
    const ts = String(deps.now?.() ?? Date.now());
    headers[SECURITY_HEADERS.REQUEST_TIMESTAMP] = ts;
    identity.timestamp = ts;
  }

  const publicKey = await deps.ensurePublicKey();
  if (!publicKey) {
    return { data: config.data, headers };
  }

  const publicCryptoKey = await deps.getPublicCryptoKey();
  if (!publicCryptoKey) {
    return { data: config.data, headers };
  }

  const { key, keyBase64 } = await deps.generateAesKey();
  headers[SECURITY_HEADERS.REQUEST_ENCRYPTED_KEY] = await deps.rsaEncrypt(
    keyBase64,
    publicCryptoKey,
  );

  const params = normalizeParams(config.params);
  const aad = buildRequestAad(identity, params);
  const isGet = config.method?.toUpperCase() === 'GET';
  const aesData = await deps.aesEncrypt(key, aad, isGet ? undefined : config.data);
  headers[SECURITY_HEADERS.REQUEST_SIGNATURE] = aesData.TagIv;

  return {
    aesKey: key,
    data: isGet || aesData.Ciphertext === '' ? config.data : aesData.Ciphertext,
    headers,
  };
}

/**
 * Sign 独立路径（Encrypt 关且 Sign 开）：body 明文，签名为 AES-GCM(空 ciphertext) 的 TagIv。
 */
export async function createSignedRequestConfig(
  config: SecurityEncryptRequestConfig,
  deps: SecurityEncryptionDeps,
  flags: SecurityHeaderFlags = { timestampEnabled: true, nonceEnabled: true },
): Promise<SecurityEncryptedRequestConfig> {
  const headers: Record<string, unknown> = { ...(config.headers ?? {}) };
  const identity = resolveIdentity(headers, flags, deps);
  applyIdentityHeaders(headers, identity);

  if (!headers[SECURITY_HEADERS.REQUEST_ID]) {
    const id = deps.nonce?.() ?? Math.random().toString(36).slice(2, 18);
    headers[SECURITY_HEADERS.REQUEST_ID] = id;
    identity.requestId = id;
  }
  if (flags.timestampEnabled && !headers[SECURITY_HEADERS.REQUEST_TIMESTAMP]) {
    const ts = String(deps.now?.() ?? Date.now());
    headers[SECURITY_HEADERS.REQUEST_TIMESTAMP] = ts;
    identity.timestamp = ts;
  }

  const publicKey = await deps.ensurePublicKey();
  if (!publicKey) {
    return { data: config.data, headers };
  }

  const publicCryptoKey = await deps.getPublicCryptoKey();
  if (!publicCryptoKey) {
    return { data: config.data, headers };
  }

  const { key, keyBase64 } = await deps.generateAesKey();
  headers[SECURITY_HEADERS.REQUEST_ENCRYPTED_KEY] = await deps.rsaEncrypt(
    keyBase64,
    publicCryptoKey,
  );

  const params = normalizeParams(config.params);
  const rawBody = bodyToSignString(config.data);
  const aad = buildSignAad(identity, params, rawBody);
  const aesData = await deps.aesEncrypt(key, aad, undefined);
  headers[SECURITY_HEADERS.REQUEST_SIGNATURE] = aesData.TagIv;

  return {
    aesKey: key,
    data: config.data,
    headers,
  };
}

/** 仅注入时间戳 / Request-ID（白名单或关加密时）。 */
export function applySecurityIdentityHeaders(
  headers: Record<string, unknown>,
  flags: SecurityHeaderFlags,
  deps: Pick<SecurityEncryptionDeps, 'now' | 'nonce'> = {},
): Record<string, unknown> {
  const next = { ...headers };
  const identity = resolveIdentity(next, flags, deps);
  applyIdentityHeaders(next, identity);
  return next;
}
