# 03 — 用户管理

**What to build:** 管理员可分页查询、创建、更新、软删用户，启停账号、重置密码，并分配角色；用户-角色变更后该用户 Casbin 策略与授权一致。三端用户管理页/API 对齐。

**Blocked by:** 02 — Auth + ALTCHA + 三端契约基线

**Status:** done

- [x] 用户列表分页 `{items,total}`，支持约定筛选字段
- [x] 创建/更新/软删；密码 BCrypt 存储且不回显
- [x] 启停与重置密码接口行为正确
- [x] 角色分配读写 sys_user_role，并触发该用户 Casbin 策略重算
- [x] react-admin / vue / mock 用户 API 对齐
- [x] HTTP 测试覆盖主路径与鉴权失败
