import { describe, expect, it } from 'vitest';

import { isSecurityWhitelisted, resolveRequestPath } from './path-matcher';

describe('isSecurityWhitelisted', () => {
  it('公钥与 altcha 在白名单', () => {
    expect(isSecurityWhitelisted('/api/encrypt/public/key')).toBe(true);
    expect(isSecurityWhitelisted('/encrypt/public/key')).toBe(true);
    expect(isSecurityWhitelisted('/api/altcha/challenge')).toBe(true);
    expect(isSecurityWhitelisted('/altcha/challenge')).toBe(true);
  });

  it('登录不在白名单（Encrypt 强制）', () => {
    expect(isSecurityWhitelisted('/api/auth/login')).toBe(false);
    expect(isSecurityWhitelisted('/auth/login')).toBe(false);
  });
});

describe('resolveRequestPath', () => {
  it('解析相对路径', () => {
    expect(resolveRequestPath('/auth/login', '/api')).toBe('/auth/login');
    expect(resolveRequestPath('encrypt/public/key', '/api')).toBe('/api/encrypt/public/key');
  });
});
