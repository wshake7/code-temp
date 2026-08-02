# 03 — Mock：与 Java 同协议的安全中间件与公钥

**What to build:** `backend-mock-template` 在安全开关打开时与 Java 使用同一套头协议：公钥、Timestamp、Encrypt（强制）、Nonce、Sign（Encrypt 关时）、Language；关闭开关后明文可用，保证 dev 全开时代理到 mock 可联调。

**Blocked by:** 01 — Java：配置开关 + ResultCode + 公钥 + Timestamp + Encrypt 强制链路

**Status:** done

- [x] 提供公钥接口，形状与 Java `Result` + `publicKey` 对齐
- [x] Encrypt 开：解密请求、加密响应、缺密钥拒绝；白名单与登录策略对齐 01
- [x] Timestamp / Nonce / Sign / Language 行为与开关语义对齐 spec（可内存实现 Nonce）
- [x] 环境变量或 mock 配置可单独开关各项，默认全开
- [x] 至少一条辅 seam 验证：加密请求成功路径 + 关 Encrypt 明文路径

## Comments

- Spec: `.scratch/request-security-middleware/spec.md`
- 实现可用 Node WebCrypto / 固定开发密钥对，但协议字段须与 Java 一致
