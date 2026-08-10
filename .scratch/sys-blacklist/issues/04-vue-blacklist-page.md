# 04 — Vue 黑名单管理页

**What to build:** 管理员在 Vue（web-antdv-next）系统菜单中打开黑名单页，完成列表筛选、创建/编辑、启停、软删与 batch，对接 `/api/system/blacklist`（可先接 mock）。

**Blocked by:** 01 — Java 黑名单管理 API + Flyway V1/V2；03 — Mock 黑名单 CRUD + 拦截

**Status:** resolved

- [x] 路由与菜单 path `/system/blacklist`、组件路径与 seed/mock 一致
- [x] API 封装 + 列表/表单字段覆盖 target 类型与值、scope、时间窗、reason、remark、启停
- [x] 支持 create/update/软删/batch（交互对齐字典等 system CRUD）
- [x] 中英文案齐全；手工验收 seam S5（对照字典页）

## Spec

`.scratch/sys-blacklist/spec.md`

## Comments

### Answer (2026-08-10)

Vue（web-antdv-next）黑名单管理页已交付：

- **路由**：`SystemBlacklist` / `path: blacklist` → 全路径 `/system/blacklist`，组件 `views/system/blacklist/index.vue`（对齐 seed `component: /system/blacklist/index`）
- **API**：`src/api/system/blacklist/{types,index,hooks}.ts` → `/system/blacklist/list|all|{id}|POST|PUT|DELETE|batch`
- **页面**：筛选（targetType/value/scope/status）、抽屉表单（类型/值/scope/时间窗/reason/remark/启停）、单条启停与软删、批量 enable|disable|delete
- **i18n**：`system.blacklist.*` 中英齐全
- **时间提交**：`YYYY-MM-DDTHH:mm:ss` 本地墙钟，对齐 React / Java `LocalDateTime`
- **提交**：子模块 `apps/vue-vben-admin` commits `1285265fc` + `afa0b6223` + `9eb595575`

S5 手工验收：对照字典页操作路径（列表→筛选→新建/编辑→启停→软删→batch）。
