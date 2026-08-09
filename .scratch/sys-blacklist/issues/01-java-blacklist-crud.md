# 01 — Java 黑名单管理 API + Flyway V1/V2

**What to build:** 管理员可通过 Admin API 完整维护 Blacklist（分页/筛选/详情/创建/更新/启停/软删/batch）；新环境执行现有 V1/V2 即可得到表结构与菜单、API 资源 seed。不实现运行时拦截（见 02）。

**Blocked by:** None — can start immediately

**Status:** done

- [x] Flyway `V1` 含 `sys_blacklist` 表；`V2` 含菜单 `/system/blacklist` 与 `system:blacklist:*` 的 `sys_api`（及必要绑定）；**不**新增 V3
- [x] 权威 `backend/db` 文档/schema 与迁移一致（若有 prod 镜像则同步）
- [x] 管理 API：`/api/system/blacklist` list/all/detail/create/update/soft-delete/batch 行为对齐字典模块契约
- [x] 同时间窗活跃重复拒绝；时间窗重叠允许创建
- [x] 分层与 DTO→VO 约定符合现有 ADR；`CONTEXT.md` 增补 Blacklist 术语
- [x] 测试 seam S3（及支撑 S1 所需的查询能力）覆盖主要业务结果

## Spec

`.scratch/sys-blacklist/spec.md`

## Comments
