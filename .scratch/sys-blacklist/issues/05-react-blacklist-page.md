# 05 — React 黑名单管理页

**What to build:** 管理员在 React Admin 系统模块中打开黑名单页，完成列表筛选、创建/编辑、启停、软删与 batch，对接同一 Admin API 契约。

**Blocked by:** 01 — Java 黑名单管理 API + Flyway V1/V2；03 — Mock 黑名单 CRUD + 拦截

**Status:** done

- [x] 路由注册于 system 模块；path 与权限码与 seed 对齐
- [x] API rest/hooks + 页面能力与 Vue 票对等（非像素级，契约与字段对等）
- [x] 中英文案齐全；手工验收 seam S5（代码侧已齐，浏览器手验由人工）

## Spec

`.scratch/sys-blacklist/spec.md`

## Comments

### 2026-08-10 implement

- React：`/system/blacklist` 路由 + pageMap 组件路径 `/system/blacklist/index` 对齐 seed
- API：`rest/blacklist` + `hooks/blacklist` 覆盖 list/all/detail/create/update/delete/batch
- 页面：筛选（targetType/value、scope、status）、表单（时间窗/reason/remark/启停）、单条启停/软删、batch
- i18n：`blacklist` 模块 zh-CN/en-US + routes 键 `system.blacklist.title`
