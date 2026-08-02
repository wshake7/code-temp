# 02 — Java：Nonce + Sign + Language 解析与异步写 languageCode

**What to build:** 在 01 的配置与加密底座上补齐 Nonce 防重放、Sign（仅 Encrypt 关闭时）独立验签、Language 头解析与已登录用户 languageCode 异步落库；各能力仍可单独开关。

**Blocked by:** 01 — Java：配置开关 + ResultCode + 公钥 + Timestamp + Encrypt 强制链路

**Status:** ready-for-agent

- [ ] Nonce 开：同一 `X-Request-ID` 在有效期内第二次请求失败；Nonce 关时不校验
- [ ] Encrypt 关且 Sign 开：非法/缺失签名失败；合法签名通过；Encrypt 开时不重复走独立 Sign 路径
- [ ] Language 开：优先 `X-Language`，回退 `Accept-Language`，写入 request 上下文；关则不处理
- [ ] 已登录且 header 语言与用户 `languageCode` 不同时异步更新，相同则跳过；不阻塞请求线程
- [ ] 对应 Result 1xxx / 既有错误风格一致
- [ ] HTTP 测试覆盖 Nonce 重放、Sign 模式、Language 上下文（写库可用 spy/异步等待或可观察仓储）

## Comments

- Spec: `.scratch/request-security-middleware/spec.md`
- Sign 与 Encrypt 协作规则见 Grill：Encrypt 优先
