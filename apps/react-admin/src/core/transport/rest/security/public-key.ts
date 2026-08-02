/**
 * RSA 公钥缓存（与 GET /api/encrypt/public/key 对齐）。
 */

import { importRsaPublicKey } from './crypto';

let cachedPublicKeyBase64 = '';
let cachedPublicCryptoKey: CryptoKey | null = null;

export function getCachedPublicKey(): string {
  return cachedPublicKeyBase64;
}

export function setCachedPublicKey(publicKey: string): void {
  if (publicKey !== cachedPublicKeyBase64) {
    cachedPublicKeyBase64 = publicKey;
    cachedPublicCryptoKey = null;
  }
}

export function clearCachedPublicKey(): void {
  cachedPublicKeyBase64 = '';
  cachedPublicCryptoKey = null;
}

export async function getPublicCryptoKey(): Promise<CryptoKey | undefined> {
  if (cachedPublicCryptoKey) return cachedPublicCryptoKey;
  if (!cachedPublicKeyBase64) return undefined;
  try {
    cachedPublicCryptoKey = await importRsaPublicKey(cachedPublicKeyBase64);
    return cachedPublicCryptoKey;
  } catch {
    return undefined;
  }
}

/**
 * 确保本地有公钥；缺失时用裸 fetch 拉取，避免走加密拦截器递归。
 * @param baseURL 如 `/api`
 */
export async function ensurePublicKey(baseURL: string): Promise<string> {
  if (cachedPublicKeyBase64) return cachedPublicKeyBase64;

  const base = (baseURL || '/api').replace(/\/$/, '');
  const url = `${base}/encrypt/public/key`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) return '';
    const res = (await response.json()) as {
      data?: { publicKey?: string };
    };
    const publicKey = res?.data?.publicKey || '';
    if (publicKey) {
      setCachedPublicKey(publicKey);
    }
    return publicKey;
  } catch {
    return '';
  }
}
