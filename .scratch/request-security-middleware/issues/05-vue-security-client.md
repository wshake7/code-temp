# 05 — Vue：env 分开关 + 加解密拦截器 + X-Language

**What to build:** vue-vben-admin（web-antdv-next）请求层按 `VITE_SECURITY_*` 与后端同步：Encrypt 开时自动 RSA/AES 加解密；Language 开发送 `X-Language`；关开关时明文兼容，行为与 React ticket 对齐。

**Blocked by:** 01 — Java：配置开关 + ResultCode + 公钥 + Timestamp + Encrypt 强制链路

**Status:** ready-for-agent

- [ ] 分项 env 开关与 React 语义一致，默认全开
- [ ] Encrypt 开：公钥、加密请求、解密响应、业务 `code/msg/data` 解析仍正确
- [ ] 白名单/公钥路径不破坏登录前引导
- [ ] Language 开：`X-Language` 注入
- [ ] Encrypt 关：明文可用
- [ ] request 层辅 seam 测试或等价验证

## Comments

- Spec: `.scratch/request-security-middleware/spec.md`
- 落点：`apps/vue-vben-admin/apps/web-antdv-next` 的 request 客户端
