import { describe, expect, it, vi } from 'vitest';

import { SECURITY_HEADERS, SIGN_DATA_AAD_KEY } from './headers';
import {
  applySecurityIdentityHeaders,
  createEncryptedRequestConfig,
  createSignedRequestConfig,
} from './request-encryption';

describe('createEncryptedRequestConfig', () => {
  it('Encrypt 开：GET 带加密头，空 payload 签名，不改 data', async () => {
    const aesKey = {} as CryptoKey;
    const publicCryptoKey = {} as CryptoKey;
    const encryptedKey = 'encrypted-key';
    const tagIv = 'tag-iv';
    const encrypt = vi.fn().mockResolvedValue({
      Ciphertext: '',
      TagIv: tagIv,
    });

    const result = await createEncryptedRequestConfig(
      {
        headers: {},
        method: 'GET',
        params: { parentID: 0 },
      },
      {
        aesEncrypt: encrypt,
        ensurePublicKey: vi.fn().mockResolvedValue('public-key'),
        generateAesKey: vi.fn().mockResolvedValue({
          key: aesKey,
          keyBase64: 'aes-key',
        }),
        getPublicCryptoKey: vi.fn().mockResolvedValue(publicCryptoKey),
        now: () => 1000,
        nonce: () => 'nonce-1',
        rsaEncrypt: vi.fn().mockResolvedValue(encryptedKey),
      },
    );

    expect(result.headers[SECURITY_HEADERS.REQUEST_ENCRYPTED_KEY]).toBe(encryptedKey);
    expect(result.headers[SECURITY_HEADERS.REQUEST_SIGNATURE]).toBe(tagIv);
    expect(result.headers[SECURITY_HEADERS.REQUEST_TIMESTAMP]).toBe('1000');
    expect(result.headers[SECURITY_HEADERS.REQUEST_ID]).toBe('nonce-1');
    expect(result.data).toBeUndefined();
    expect(result.aesKey).toBe(aesKey);
    expect(encrypt).toHaveBeenCalledWith(
      aesKey,
      'X-Request-ID=nonce-1&X-Request-Timestamp=1000&parentID=0',
      undefined,
    );
  });

  it('Encrypt 开：POST 加密 body 为 ciphertext', async () => {
    const aesKey = {} as CryptoKey;
    const encrypt = vi.fn().mockResolvedValue({
      Ciphertext: 'cipher-body',
      TagIv: 'tag-iv-2',
    });

    const result = await createEncryptedRequestConfig(
      {
        data: { username: 'root' },
        headers: {},
        method: 'POST',
      },
      {
        aesEncrypt: encrypt,
        ensurePublicKey: vi.fn().mockResolvedValue('pk'),
        generateAesKey: vi.fn().mockResolvedValue({ key: aesKey, keyBase64: 'k' }),
        getPublicCryptoKey: vi.fn().mockResolvedValue({} as CryptoKey),
        now: () => 2000,
        nonce: () => 'n2',
        rsaEncrypt: vi.fn().mockResolvedValue('ek'),
      },
    );

    expect(result.data).toBe('cipher-body');
    expect(result.headers[SECURITY_HEADERS.REQUEST_SIGNATURE]).toBe('tag-iv-2');
    expect(encrypt).toHaveBeenCalledWith(
      aesKey,
      'X-Request-ID=n2&X-Request-Timestamp=2000',
      { username: 'root' },
    );
  });

  it('公钥缺失时回退明文（仅身份头）', async () => {
    const result = await createEncryptedRequestConfig(
      {
        data: { a: 1 },
        headers: {},
        method: 'POST',
      },
      {
        aesEncrypt: vi.fn(),
        ensurePublicKey: vi.fn().mockResolvedValue(''),
        generateAesKey: vi.fn(),
        getPublicCryptoKey: vi.fn(),
        now: () => 1,
        nonce: () => 'id',
        rsaEncrypt: vi.fn(),
      },
    );

    expect(result.data).toEqual({ a: 1 });
    expect(result.headers[SECURITY_HEADERS.REQUEST_ENCRYPTED_KEY]).toBeUndefined();
    expect(result.headers[SECURITY_HEADERS.REQUEST_ID]).toBe('id');
  });
});

describe('createSignedRequestConfig', () => {
  it('Sign 模式：body 明文，AAD 含 signData', async () => {
    const aesKey = {} as CryptoKey;
    const encrypt = vi.fn().mockResolvedValue({
      Ciphertext: '',
      TagIv: 'sign-tag',
    });

    const body = { username: 'root', password: 'x' };
    const result = await createSignedRequestConfig(
      {
        data: body,
        headers: {},
        method: 'POST',
      },
      {
        aesEncrypt: encrypt,
        ensurePublicKey: vi.fn().mockResolvedValue('pk'),
        generateAesKey: vi.fn().mockResolvedValue({ key: aesKey, keyBase64: 'k' }),
        getPublicCryptoKey: vi.fn().mockResolvedValue({} as CryptoKey),
        now: () => 3000,
        nonce: () => 'sign-n',
        rsaEncrypt: vi.fn().mockResolvedValue('sign-ek'),
      },
    );

    expect(result.data).toEqual(body);
    expect(result.headers[SECURITY_HEADERS.REQUEST_ENCRYPTED_KEY]).toBe('sign-ek');
    expect(result.headers[SECURITY_HEADERS.REQUEST_SIGNATURE]).toBe('sign-tag');
    // buildAad 按 key 字典序：X-Request-ID / X-Request-Timestamp / signData
    const expectedAad = [
      'X-Request-ID=sign-n',
      'X-Request-Timestamp=3000',
      `${SIGN_DATA_AAD_KEY}=${JSON.stringify(body)}`,
    ].join('&');
    expect(encrypt).toHaveBeenCalledWith(aesKey, expectedAad, undefined);
  });
});

describe('applySecurityIdentityHeaders', () => {
  it('按开关注入 Timestamp / Request-ID', () => {
    const headers = applySecurityIdentityHeaders(
      {},
      { timestampEnabled: true, nonceEnabled: true },
      { now: () => 42, nonce: () => 'rid' },
    );
    expect(headers[SECURITY_HEADERS.REQUEST_TIMESTAMP]).toBe('42');
    expect(headers[SECURITY_HEADERS.REQUEST_ID]).toBe('rid');
  });

  it('开关关闭时不注入', () => {
    const headers = applySecurityIdentityHeaders(
      {},
      { timestampEnabled: false, nonceEnabled: false },
      { now: () => 42, nonce: () => 'rid' },
    );
    expect(headers[SECURITY_HEADERS.REQUEST_TIMESTAMP]).toBeUndefined();
    expect(headers[SECURITY_HEADERS.REQUEST_ID]).toBeUndefined();
  });
});
