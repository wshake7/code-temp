# 04 — 角色管理与授权绑定

**What to build:** 管理员可管理角色（含父子/排序等 schema 能力），为角色绑定菜单与 API；绑定变更后相关用户的 Casbin 策略立即一致。三端角色管理对齐。

**Blocked by:** 02 — Auth + ALTCHA + 三端契约基线

**Status:** done

- [x] 角色分页/CRUD/软删与列表附加信息（如 userCount/parentName，按前端需要）
- [x] 角色-菜单、角色-API 查询与全量替换绑定
- [x] 绑定或用户角色交叉影响时 Casbin p 策略按用户展开同步
- [x] 内置 Root 角色保护策略合理（不可误删导致锁死）
- [x] 三端 role API 对齐
- [x] HTTP + Casbin 同步测试覆盖主路径
