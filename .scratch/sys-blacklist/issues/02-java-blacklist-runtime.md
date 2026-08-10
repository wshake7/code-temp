# 02 — Java 运行时 Access Blocked 拦截

**What to build:** 命中 Blacklist 的请求被拒绝并返回 **Access Blocked**（专用错误码 + 固定文案，不回传 reason）。LOGIN 场景拦 IP，并在用户解析后、发 token 前拦 USER；已登录 API 拦 IP 与 session 中的 USER。DEVICE 本波不运行时拦截。

**Blocked by:** 01 — Java 黑名单管理 API + Flyway V1/V2

**Status:** done

- [x] 统一 Servlet Filter：按场景（LOGIN / API）查 IP；已登录从 Sa-Token 取 userId 查 USER
- [x] 登录链路：Filter 不解析 body；鉴权服务在发 token 前查 USER（scope 覆盖 LOGIN）
- [x] 命中语义对齐 DB 约定 §18.3（时间窗、scope IN (场景, ALL)、软删/禁用、多行 OR）
- [x] 响应为 Access Blocked；reason 仅服务端日志
- [x] 与 Casbin / is_enabled 正交；测试 seam S1 + S2 覆盖关键路径

## Spec

`.scratch/sys-blacklist/spec.md`

## Comments
