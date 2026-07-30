# 02 — Auth + ALTCHA + 三端契约基线

**What to build:** 管理员可完成 ALTCHA 挑战、登录拿到 accessToken、查看当前用户信息与权限码、登出；登录尝试写入登录日志。路径统一 `/api`（无 v1），响应 `code/msg/data`。react-admin、vue web-antdv-next、mock 的 auth 与 request 基线对齐同一契约，可连 java-admin 首登。

**Blocked by:** 01 — Schema v10 + Root seed + Casbin 通配

**Status:** done

- [x] `/api/auth/login|logout|info|codes` 与 ALTCHA challenge 可用；登录 data 含 accessToken 与用户摘要
- [x] 使用 altcha-lib-java 校验；失败拒绝登录
- [x] 登录成功/失败写 sys_login_log
- [x] Sa-Token + Casbin 对受保护路径生效；Root 通配不被 403
- [x] 三端 request/auth 适配 code/msg/data 与 accessToken；mock 路径/形状对齐
- [x] HTTP 与 AuthService 级测试覆盖主成功/失败路径
