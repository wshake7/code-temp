# 04 — React：env 分开关 + 加解密拦截器 + X-Language

**What to build:** react-admin 请求层按 `VITE_SECURITY_*` 与后端同步：Encrypt 开时自动完成 RSA/AES 协议与响应解密；Timestamp/Request-ID 注入；Language 开发送 `X-Language`；关开关时与现网明文行为兼容。

**Blocked by:** 01 — Java：配置开关 + ResultCode + 公钥 + Timestamp + Encrypt 强制链路

**Status:** ready-for-agent

- [ ] 存在分项 env 开关（Timestamp / Encrypt / Nonce 相关头 / Sign 模式 / Language），默认全开
- [ ] Encrypt 开：拉取公钥、加密请求体、带齐加密头；响应 `X-Response-Is-Encrypt` 时解密后再解析 `code/msg/data`
- [ ] 公钥与白名单路径不加密或按协议只带时间戳/ID
- [ ] Language 开：请求头含 `X-Language`（locale）
- [ ] Encrypt 关时业务请求明文仍可用
- [ ] 前端 request 客户端单测或等价验证覆盖开/关主路径

## Comments

- Spec: `.scratch/request-security-middleware/spec.md`
- 参考 harness-template admin-react / vue request-encryption 与 AES-GCM+RSA-OAEP 实现
