import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SECURITY_HEADERS } from './headers';
import {
  createSecurityRequestInterceptor,
  createSecurityResponseInterceptor,
  type SecurityAxiosConfig,
} from './interceptors';
import { clearCachedPublicKey } from './public-key';

function makeConfig(partial: Partial<InternalAxiosRequestConfig> = {}): SecurityAxiosConfig {
  return {
    headers: new AxiosHeaders(),
    method: 'POST',
    url: '/auth/login',
    baseURL: '/api',
    data: { username: 'root' },
    ...partial,
  } as SecurityAxiosConfig;
}

describe('security request interceptor', () => {
  beforeEach(() => {
    clearCachedPublicKey();
    vi.restoreAllMocks();
  });

  it('Language 开：注入 X-Language', async () => {
    const interceptor = createSecurityRequestInterceptor({
      getConfig: () => ({
        timestampEnabled: false,
        encryptEnabled: false,
        nonceEnabled: false,
        signEnabled: false,
        languageEnabled: true,
      }),
      getLocale: () => 'zh-CN',
    });

    const config = await interceptor(makeConfig());
    expect(config.headers.get(SECURITY_HEADERS.LANGUAGE)).toBe('zh-CN');
  });

  it('Language 关：不注入 X-Language', async () => {
    const interceptor = createSecurityRequestInterceptor({
      getConfig: () => ({
        timestampEnabled: false,
        encryptEnabled: false,
        nonceEnabled: false,
        signEnabled: false,
        languageEnabled: false,
      }),
      getLocale: () => 'zh-CN',
    });

    const config = await interceptor(makeConfig());
    expect(config.headers.get(SECURITY_HEADERS.LANGUAGE)).toBeUndefined();
  });

  it('Encrypt 关且 Sign 关：业务 body 仍为明文', async () => {
    const interceptor = createSecurityRequestInterceptor({
      getConfig: () => ({
        timestampEnabled: true,
        encryptEnabled: false,
        nonceEnabled: true,
        signEnabled: false,
        languageEnabled: false,
      }),
      now: () => 123,
      nonce: () => 'plain-id',
    });

    const body = { username: 'root' };
    const config = await interceptor(makeConfig({ data: body }));
    expect(config.data).toEqual(body);
    expect(config.headers.get(SECURITY_HEADERS.REQUEST_ENCRYPTED_KEY)).toBeUndefined();
    expect(config.headers.get(SECURITY_HEADERS.REQUEST_TIMESTAMP)).toBe('123');
    expect(config.headers.get(SECURITY_HEADERS.REQUEST_ID)).toBe('plain-id');
  });

  it('白名单路径不加密 body', async () => {
    const interceptor = createSecurityRequestInterceptor({
      getConfig: () => ({
        timestampEnabled: true,
        encryptEnabled: true,
        nonceEnabled: true,
        signEnabled: true,
        languageEnabled: false,
      }),
      now: () => 1,
      nonce: () => 'w',
    });

    const config = await interceptor(
      makeConfig({
        url: '/encrypt/public/key',
        method: 'GET',
        data: undefined,
      }),
    );
    expect(config.headers.get(SECURITY_HEADERS.REQUEST_ENCRYPTED_KEY)).toBeUndefined();
    expect(config.headers.get(SECURITY_HEADERS.REQUEST_TIMESTAMP)).toBe('1');
  });
});

describe('security response interceptor', () => {
  it('非加密响应原样返回（text 时尝试 JSON）', async () => {
    const interceptor = createSecurityResponseInterceptor();
    const response = {
      data: '{"code":0,"data":{"ok":true}}',
      headers: {},
      config: { _securityEncrypted: true } as SecurityAxiosConfig,
      status: 200,
      statusText: 'OK',
    } as AxiosResponse;

    const out = await interceptor(response);
    expect(out.data).toEqual({ code: 0, data: { ok: true } });
  });

  it('X-Response-Is-Encrypt 时用会话 AES 解密后再解析 JSON', async () => {
    const { generateAesKey } = await import('./crypto');
    const { key } = await generateAesKey();
    const plain = JSON.stringify({ code: 0, msg: 'ok', data: { id: 1 } });
    // 响应 combined = base64(ciphertext + tag + iv)，AAD 为空
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
    const combinedB64 = btoa(String.fromCodePoint(...combined));

    const interceptor = createSecurityResponseInterceptor();
    const response = {
      data: combinedB64,
      headers: { 'x-response-is-encrypt': 'true' },
      config: { _aesKey: key } as SecurityAxiosConfig,
      status: 200,
      statusText: 'OK',
    } as AxiosResponse;

    const out = await interceptor(response);
    expect(out.data).toEqual({ code: 0, msg: 'ok', data: { id: 1 } });
  });

  it('标记加密但无 aesKey 时抛错', async () => {
    const interceptor = createSecurityResponseInterceptor();
    const response = {
      data: 'cipher',
      headers: { 'x-response-is-encrypt': 'true' },
      config: {} as SecurityAxiosConfig,
      status: 200,
      statusText: 'OK',
    } as AxiosResponse;

    await expect(interceptor(response)).rejects.toThrow(/缺少会话密钥/);
  });
});
