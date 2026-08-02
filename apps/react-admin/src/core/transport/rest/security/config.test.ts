import { describe, expect, it } from 'vitest';

import { loadSecurityClientConfig } from './config';

describe('loadSecurityClientConfig', () => {
  it('默认全开', () => {
    const cfg = loadSecurityClientConfig({});
    expect(cfg).toEqual({
      timestampEnabled: true,
      encryptEnabled: true,
      nonceEnabled: true,
      signEnabled: true,
      languageEnabled: true,
    });
  });

  it('可单独关闭 Encrypt / Language', () => {
    const cfg = loadSecurityClientConfig({
      VITE_SECURITY_ENCRYPT_ENABLED: 'false',
      VITE_SECURITY_LANGUAGE_ENABLED: '0',
    });
    expect(cfg.encryptEnabled).toBe(false);
    expect(cfg.languageEnabled).toBe(false);
    expect(cfg.timestampEnabled).toBe(true);
    expect(cfg.nonceEnabled).toBe(true);
    expect(cfg.signEnabled).toBe(true);
  });

  it('可关闭 Timestamp / Nonce / Sign', () => {
    const cfg = loadSecurityClientConfig({
      VITE_SECURITY_TIMESTAMP_ENABLED: 'off',
      VITE_SECURITY_NONCE_ENABLED: 'no',
      VITE_SECURITY_SIGN_ENABLED: 'FALSE',
    });
    expect(cfg.timestampEnabled).toBe(false);
    expect(cfg.nonceEnabled).toBe(false);
    expect(cfg.signEnabled).toBe(false);
    expect(cfg.encryptEnabled).toBe(true);
  });
});
