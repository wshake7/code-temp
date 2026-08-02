/**
 * 前端请求安全开关：与后端 `app.security.*` / mock `SECURITY_*` 同步。
 * 每项独立；未设置时默认全开。
 *
 * | 变量 | 默认 | 含义 |
 * |---|---|---|
 * | VITE_SECURITY_TIMESTAMP_ENABLED | true | 注入 X-Request-Timestamp |
 * | VITE_SECURITY_ENCRYPT_ENABLED | true | RSA/AES 请求加密 + 响应解密 |
 * | VITE_SECURITY_NONCE_ENABLED | true | 注入 X-Request-ID（nonce） |
 * | VITE_SECURITY_SIGN_ENABLED | true | Encrypt 关时独立签名 |
 * | VITE_SECURITY_LANGUAGE_ENABLED | true | 注入 X-Language |
 */

export interface SecurityClientConfig {
  timestampEnabled: boolean;
  encryptEnabled: boolean;
  nonceEnabled: boolean;
  signEnabled: boolean;
  languageEnabled: boolean;
}

function envBool(raw: string | boolean | undefined, defaultValue: boolean): boolean {
  if (raw === undefined || raw === '') return defaultValue;
  if (typeof raw === 'boolean') return raw;
  return !['0', 'false', 'FALSE', 'off', 'OFF', 'no', 'NO'].includes(raw);
}

/** 从 Vite env（或测试注入的 partial）解析安全开关。 */
export function loadSecurityClientConfig(
  env: Record<string, string | boolean | undefined> = import.meta.env as Record<
    string,
    string | boolean | undefined
  >,
): SecurityClientConfig {
  return {
    timestampEnabled: envBool(env.VITE_SECURITY_TIMESTAMP_ENABLED, true),
    encryptEnabled: envBool(env.VITE_SECURITY_ENCRYPT_ENABLED, true),
    nonceEnabled: envBool(env.VITE_SECURITY_NONCE_ENABLED, true),
    signEnabled: envBool(env.VITE_SECURITY_SIGN_ENABLED, true),
    languageEnabled: envBool(env.VITE_SECURITY_LANGUAGE_ENABLED, true),
  };
}

let cachedConfig: SecurityClientConfig | null = null;

/** 进程级默认配置（读 env）；测试可 `resetSecurityClientConfigCache`。 */
export function getSecurityClientConfig(): SecurityClientConfig {
  if (!cachedConfig) {
    cachedConfig = loadSecurityClientConfig();
  }
  return cachedConfig;
}

/** 测试或运行时覆盖（慎用）。 */
export function setSecurityClientConfig(config: SecurityClientConfig | null): void {
  cachedConfig = config;
}

export function resetSecurityClientConfigCache(): void {
  cachedConfig = null;
}
