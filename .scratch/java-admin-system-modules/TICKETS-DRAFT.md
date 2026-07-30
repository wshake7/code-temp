# Tickets 拆分草案（待批准）

Parent: `.scratch/java-admin-system-modules/SPEC.md`

## 依赖图

```text
01 Foundation (schema/seed/casbin/helpers)
        │
        ▼
02 Auth + 三端契约基线 (ALTCHA/login/info/codes + mock/react/vue auth)
        │
        ├─► 03 User
        ├─► 04 Role (+ menus/apis 绑定 + Casbin 展开同步)
        ├─► 05 Menu (+ menu/all + menu-api 绑定)
        ├─► 06 API 资源
        ├─► 07 Dict
        ├─► 08 I18n
        └─► 09 Logs (login-log 列表补齐 + api-log 写入与列表)
```

03–09 在 02 完成后可并行（独立 vertical slices）。

---

### 01 — Schema v10 + Root seed + Casbin 通配

- **Blocked by:** None
- **What it delivers:** java-admin 库表与 v10 一致；唯一 Root 用户可登录前置数据就绪；casbin_rule 含 Root 通配；简化 SysUser 实体迁移完成；软删/审计约定落地到实体层基线。

### 02 — Auth + ALTCHA + 三端契约基线

- **Blocked by:** 01
- **What it delivers:** `/api/auth/*`、challenge、login(accessToken)、logout、info、codes；登录写 login_log；路径无 v1；react-admin / vue / mock 的 auth+request 识别 `code/msg/data` 与 accessToken，可连 java-admin 完成首登。

### 03 — 用户管理

- **Blocked by:** 02
- **What it delivers:** 用户分页/CRUD/软删/启停/改密/角色分配端到端；三端 user API 对齐；user-role 变更触发 Casbin 用户策略重算。

### 04 — 角色管理与授权绑定

- **Blocked by:** 02
- **What it delivers:** 角色 CRUD/软删、角色-菜单/角色-API 绑定；绑定变更同步 Casbin；三端 role API 对齐。

### 05 — 菜单管理与动态路由

- **Blocked by:** 02
- **What it delivers:** 菜单树 CRUD/软删、menu-api 绑定、`/api/menu/all`（或约定路径）供前端动态路由；三端 menu API 对齐。

### 06 — API 资源管理

- **Blocked by:** 02
- **What it delivers:** API 资源分页/CRUD/软删/分组/batch（及 mock 等价 sync 能力）；三端 api 管理对齐。

### 07 — 字典管理

- **Blocked by:** 02
- **What it delivers:** dict-type / dict-data CRUD 与 by-type 查询（含 platform/tag_type）；三端字典对齐。

### 08 — 国际化管理

- **Blocked by:** 02
- **What it delivers:** locale/translation 管理、按 key 聚合与 batch upsert 等 mock 等价能力；三端 i18n 对齐。

### 09 — 审计日志（登录列表 + API 日志）

- **Blocked by:** 02
- **What it delivers:** login-log 列表查询；请求链路写入 api_log + 列表查询；三端日志页可联调。（登录写入可在 02 已做，本票补列表与 api_log 完整闭环。）
