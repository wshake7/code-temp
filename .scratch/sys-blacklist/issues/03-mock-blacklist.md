# 03 — Mock 黑名单 CRUD + 拦截

**What to build:** 使用 mock 后端即可维护黑名单数据，并在 LOGIN/API 上得到与 Java 一致的 Access Blocked 拦截体验（IP + session USER；DEVICE 不运行时生效）。菜单/API 清单与 seed 对齐，便于双前端联调。

**Blocked by:** 01 — Java 黑名单管理 API + Flyway V1/V2；02 — Java 运行时 Access Blocked 拦截

**Status:** ready-for-agent

- [ ] mock 路由提供与 `/api/system/blacklist` 对齐的 CRUD/batch 与分页形状
- [ ] middleware 拦截语义对齐 02（LOGIN IP、API IP+session USER、固定 Access Blocked）
- [ ] 菜单与 API 资源清单包含黑名单权限，路径 `/system/blacklist`
- [ ] 测试 seam S4 覆盖 CRUD 形状与至少一条拦截路径

## Spec

`.scratch/sys-blacklist/spec.md`

## Comments
