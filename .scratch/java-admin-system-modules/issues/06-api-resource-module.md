# 06 — API 资源管理

**What to build:** 管理员可维护 API 资源（方法、路径、权限码、分组等），支持列表/全量/分组/batch 及 mock 等价的 sync 能力，供角色与菜单绑定引用。三端 API 管理对齐。

**Blocked by:** 02 — Auth + ALTCHA + 三端契约基线

**Status:** ready-for-agent

- [x] API 资源分页/CRUD/软删；method+path / permission_code 唯一性符合软删约定
- [x] groups、all、batch 行为与前端消费一致
- [x] sync（或文档化的等价能力）可用且幂等合理
- [x] 三端 api 管理 API 对齐
- [x] HTTP 测试覆盖主路径
