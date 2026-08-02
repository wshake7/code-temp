/**
 * 请求安全拦截器：按 VITE_SECURITY_* 注入头、加解密请求/响应。
 */

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { getSecurityClientConfig, type SecurityClientConfig } from './config';
import { aesDecrypt, aesEncrypt, generateAesKey, rsaEncrypt } from './crypto';
import { SECURITY_HEADERS } from './headers';
import {
  isMultipartContentType,
  isSecurityWhitelisted,
  isSsePath,
  resolveRequestPath,
} from './path-matcher';
import { ensurePublicKey, getPublicCryptoKey } from './public-key';
import {
  applySecurityIdentityHeaders,
  createEncryptedRequestConfig,
  createSignedRequestConfig,
} from './request-encryption';

/** 挂在 axios config 上，供响应解密使用（按请求隔离，避免并发竞态）。 */
export type SecurityAxiosConfig = InternalAxiosRequestConfig & {
  _aesKey?: CryptoKey | null;
  _securityEncrypted?: boolean;
  meta?: { skipEncrypt?: boolean };
};

function headerGet(headers: InternalAxiosRequestConfig['headers'], name: string): string | undefined {
  if (!headers) return undefined;
  if (typeof headers.get === 'function') {
    const v = headers.get(name);
    return v == null ? undefined : String(v);
  }
  const rec = headers as unknown as Record<string, unknown>;
  const v = rec[name] ?? rec[name.toLowerCase()];
  return v == null ? undefined : String(v);
}

function headerSet(headers: InternalAxiosRequestConfig['headers'], name: string, value: string): void {
  if (!headers) return;
  if (typeof headers.set === 'function') {
    headers.set(name, value);
    return;
  }
  (headers as unknown as Record<string, unknown>)[name] = value;
}

function headersToRecord(headers: InternalAxiosRequestConfig['headers']): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!headers) return out;
  if (typeof headers.forEach === 'function') {
    headers.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  return { ...(headers as unknown as Record<string, unknown>) };
}

function applyRecordToHeaders(
  headers: InternalAxiosRequestConfig['headers'],
  record: Record<string, unknown>,
): void {
  for (const [k, v] of Object.entries(record)) {
    if (v === undefined || v === null) continue;
    headerSet(headers, k, String(v));
  }
}

function parseMaybeJson(data: unknown): unknown {
  if (typeof data !== 'string') return data;
  const trimmed = data.trim();
  if (!trimmed) return data;
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return data;
  try {
    return JSON.parse(trimmed);
  } catch {
    return data;
  }
}

export interface SecurityInterceptorOptions {
  getConfig?: () => SecurityClientConfig;
  getLocale?: () => string | undefined;
  baseURL?: string;
  now?: () => number;
  nonce?: () => string;
}

/**
 * 请求拦截：Language / Timestamp / Nonce 头 + Encrypt 或 Sign。
 */
export function createSecurityRequestInterceptor(options: SecurityInterceptorOptions = {}) {
  return async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const secConfig = options.getConfig?.() ?? getSecurityClientConfig();
    const secCfg = config as SecurityAxiosConfig;
    const baseURL = options.baseURL ?? String(config.baseURL ?? '');
    const path = resolveRequestPath(config.url, baseURL);

    // Language
    if (secConfig.languageEnabled && options.getLocale) {
      const locale = options.getLocale();
      if (locale) {
        headerSet(config.headers, SECURITY_HEADERS.LANGUAGE, locale);
      }
    }

    const contentType =
      headerGet(config.headers, 'Content-Type') ?? headerGet(config.headers, 'content-type');
    const skipBodyCrypto =
      secCfg.meta?.skipEncrypt === true ||
      isSecurityWhitelisted(path) ||
      isMultipartContentType(contentType) ||
      isSsePath(path);

    const existingRequestId = headerGet(config.headers, SECURITY_HEADERS.REQUEST_ID);
    const existingTimestamp = headerGet(config.headers, SECURITY_HEADERS.REQUEST_TIMESTAMP);

    // 白名单 / 跳过 body 加密：仅按开关注入时间戳与 ID
    if (skipBodyCrypto || (!secConfig.encryptEnabled && !secConfig.signEnabled)) {
      const identityHeaders = applySecurityIdentityHeaders(
        headersToRecord(config.headers),
        {
          timestampEnabled: secConfig.timestampEnabled,
          nonceEnabled: secConfig.nonceEnabled,
          existingRequestId,
          existingTimestamp,
        },
        { now: options.now, nonce: options.nonce },
      );
      applyRecordToHeaders(config.headers, identityHeaders);
      return config;
    }

    const deps = {
      aesEncrypt,
      ensurePublicKey: () => ensurePublicKey(baseURL || '/api'),
      generateAesKey,
      getPublicCryptoKey,
      rsaEncrypt,
      now: options.now,
      nonce: options.nonce,
    };

    const flags = {
      timestampEnabled: secConfig.timestampEnabled,
      // Encrypt/Sign 需要 ID；nonce 关时仍会在 create* 内强制补
      nonceEnabled: secConfig.nonceEnabled || secConfig.encryptEnabled || secConfig.signEnabled,
      existingRequestId,
      existingTimestamp,
    };

    let requestData = config.data;
    if (typeof requestData === 'string') {
      try {
        requestData = JSON.parse(requestData);
      } catch {
        // keep string
      }
    }

    const encrypted =
      secConfig.encryptEnabled
        ? await createEncryptedRequestConfig(
            {
              data: requestData,
              headers: headersToRecord(config.headers),
              method: config.method,
              params: config.params as Record<string, unknown> | undefined,
            },
            deps,
            flags,
          )
        : await createSignedRequestConfig(
            {
              data: requestData,
              headers: headersToRecord(config.headers),
              method: config.method,
              params: config.params as Record<string, unknown> | undefined,
            },
            deps,
            flags,
          );

    applyRecordToHeaders(config.headers, encrypted.headers);
    secCfg._aesKey = encrypted.aesKey ?? null;

    // 仅在真正拿到加密会话（Encrypted-Key + aesKey）后改写 body / responseType；
    // 公钥失败回落明文时不得禁用 JSON transform，否则对象 body 会损坏。
    const encryptedKey = encrypted.headers[SECURITY_HEADERS.REQUEST_ENCRYPTED_KEY];
    const sessionReady = Boolean(encryptedKey && encrypted.aesKey);

    if (secConfig.encryptEnabled && sessionReady) {
      secCfg._securityEncrypted = true;
      if (config.method?.toUpperCase() !== 'GET') {
        config.data = encrypted.data;
        // 防止 axios 再次 JSON.stringify base64 字符串
        config.transformRequest = [(data: unknown) => data];
      }
      // 加密响应为 base64 文本，避免 axios 误解析
      config.responseType = 'text';
      headerSet(config.headers, 'Content-Type', 'application/json;charset=utf-8');
    }

    return config;
  };
}

/**
 * 响应拦截：若 `X-Response-Is-Encrypt: true` 则用请求侧 AES key 解密后再解析 JSON。
 * 必须注册在业务 `code/msg/data` 解析之前。
 */
export function createSecurityResponseInterceptor() {
  return async (response: AxiosResponse): Promise<AxiosResponse> => {
    const cfg = response.config as SecurityAxiosConfig;
    const isEncrypted =
      String(response.headers?.[SECURITY_HEADERS.RESPONSE_IS_ENCRYPT.toLowerCase()] ?? '') ===
        'true' ||
      String(response.headers?.[SECURITY_HEADERS.RESPONSE_IS_ENCRYPT] ?? '') === 'true';

    const aesKey = cfg._aesKey ?? null;

    if (isEncrypted) {
      if (!aesKey) {
        throw Object.assign(new Error('响应已加密但缺少会话密钥，无法解密'), {
          __handledBySecurityInterceptor: true,
        });
      }
      try {
        const encryptedText =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const decryptedText = await aesDecrypt(encryptedText, aesKey, '');
        response.data = JSON.parse(decryptedText);
      } catch (error) {
        console.error('[security] 响应解密失败:', error);
        throw Object.assign(new Error('响应解密失败'), {
          cause: error,
          __handledBySecurityInterceptor: true,
        });
      }
      return response;
    }

    // encrypt 路径把 responseType 设为 text：明文错误/白名单旁路时尝试 JSON 还原
    if (cfg._securityEncrypted && typeof response.data === 'string') {
      response.data = parseMaybeJson(response.data);
    }

    return response;
  };
}
