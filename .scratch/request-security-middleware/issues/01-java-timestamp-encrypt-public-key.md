# 01 — Java：配置开关 + ResultCode + 公钥 + Timestamp + Encrypt 强制链路

**What to build:** 后端具备可独立开关的 Timestamp 与 Encrypt：客户端可拉取 RSA 公钥，Encrypt 开启时除白名单外强制加密通信（含登录），Timestamp 开启时拒绝过期请求；关闭对应开关后行为降级为明文/不校验时间窗。错误进入 Result 1xxx 段。

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] 存在安全配置模型：Timestamp / Encrypt（及为后续预留的 Nonce/Sign/Language 开关位）可独立 enabled，dev 默认全开
- [ ] `GET /api/encrypt/public/key` 返回 `Result` 且含 `publicKey`；密钥对 Redis cache-aside + 进程缓存
- [ ] Timestamp 开：过期 `X-Request-Timestamp` 被拒；合法时间窗通过；无头不拦（或与约定一致）
- [ ] Encrypt 开：缺 `X-Request-Encrypted-Key` 被拒（白名单除外）；合法加密请求 body 可被业务读取；响应加密且带 `X-Response-Is-Encrypt`
- [ ] 白名单 `/api/encrypt/public/key`、`/api/altcha/**`、文档与健康检查可明文
- [ ] `/api/auth/login` 在 Encrypt 开时仍要求加密
- [ ] ResultCode 扩展 1xxx 覆盖过期、请求错误、密钥/解密失败等
- [ ] HTTP 主 seam 测试覆盖上述开/关与强制加密路径

## Comments

- Spec: `.scratch/request-security-middleware/spec.md`
- 参考 harness-template Go security middleware 与 Java EncryptFilter/TimestampFilter
