# 04 — Vue 黑名单管理页

**What to build:** 管理员在 Vue（web-antdv-next）系统菜单中打开黑名单页，完成列表筛选、创建/编辑、启停、软删与 batch，对接 `/api/system/blacklist`（可先接 mock）。

**Blocked by:** 01 — Java 黑名单管理 API + Flyway V1/V2；03 — Mock 黑名单 CRUD + 拦截

**Status:** ready-for-agent

- [ ] 路由与菜单 path `/system/blacklist`、组件路径与 seed/mock 一致
- [ ] API 封装 + 列表/表单字段覆盖 target 类型与值、scope、时间窗、reason、remark、启停
- [ ] 支持 create/update/软删/batch（交互对齐字典等 system CRUD）
- [ ] 中英文案齐全；手工验收 seam S5（对照字典页）

## Spec

`.scratch/sys-blacklist/spec.md`

## Comments
