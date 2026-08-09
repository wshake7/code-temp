# Spec: 访问黑名单（sys_blacklist）四端交付

**Status:** ready-for-agent  
**Feature slug:** `sys-blacklist`  
**Date:** 2026-08-10  
**Upstream:** schema v11 + Grill 共同理解（handoff + develop-grill）

---

## Problem Statement

运营与安全人员需要按 **IP / 用户 / 设备** 限制后台访问（登录与/或 API），并支持时间窗与启停；管理员需要在后台维护黑名单。  
表结构 `sys_blacklist` 已就绪，但尚无运行时拦截、管理 API、mock 与双前端页面，无法验收「加黑 → 被拦 → 可管理」。

## Solution

交付 **Blacklist** 管理能力与 **Access Blocked** 运行时拦截：

1. 管理员可对黑名单做完整 CRUD / batch / 启停 / 软删（Java + mock + Vue + React）。
2. 统一 Servlet Filter：按场景查 IP；已登录请求用 session（Sa-Token）查 USER。
3. 登录路径：Filter 查 IP；用户解析成功后、发 token 前在鉴权服务再查 USER。
4. 命中返回专用错误码与固定文案；封禁原因不对客户端暴露。
5. Flyway 将表与菜单/API seed 写入现有 V1/V2（不新增 V3）；mock 同步 CRUD 与拦截。

## User Stories

1. As an 管理员, I want 分页查看黑名单, so that 我能审计当前限制策略。
2. As an 管理员, I want 按 target 类型/值、scope、启停状态筛选列表, so that 快速定位条目。
3. As an 管理员, I want 查看单条黑名单详情, so that 核对时间窗与原因备注。
4. As an 管理员, I want 新增 IP 黑名单, so that 限制某地址登录或 API。
5. As an 管理员, I want 新增 USER 黑名单（用户 id 字符串）, so that 限制某账号访问。
6. As an 管理员, I want 新增 DEVICE 黑名单条目, so that 为后续设备拦截预留数据（本波运行时可不生效）。
7. As an 管理员, I want 选择 scope（LOGIN / API / ALL）, so that 区分仅登录、仅 API 或全部。
8. As an 管理员, I want 设置 starts_at 与可选 expires_at, so that 支持临时封禁与永久封禁。
9. As an 管理员, I want 填写 reason 与 remark, so that 对外原因与内部备注分离。
10. As an 管理员, I want 编辑未删条目, so that 调整时间窗或说明而无需重建。
11. As an 管理员, I want 启停单条黑名单, so that 临时失效而不软删。
12. As an 管理员, I want 软删黑名单, so that 停用历史可审计且可避开弱唯一冲突策略。
13. As an 管理员, I want 批量 enable / disable / delete, so that 批量运维。
14. As an 管理员, I want 创建时相同时间窗被拒绝, so that 避免完全重复活跃行。
15. As an 管理员, I want 允许时间窗重叠（命中 OR）, so that 可叠加多条策略；可选得到重叠提示。
16. As an 未登录访客, I want 命中 IP 的 LOGIN 黑名单时无法登录, so that 登录面被保护。
17. As an 登录中的用户, I want 账号在 USER 黑名单且 scope 覆盖 LOGIN 时登录被拒, so that 即使用对密码也无法建会话。
18. As an 已登录用户, I want 命中 IP 或 USER 的 API 黑名单时接口被拒, so that API 面被保护。
19. As an 被拦截的客户端, I want 收到 Access Blocked 专用错误码与固定文案, so that 与「无权限 / 凭证错误」可区分且不泄露内部 reason。
20. As an 运维, I want reason 写入服务端日志, so that 可排查而不暴露给前端。
21. As an 开发者, I want mock 提供相同 CRUD 与拦截语义, so that 无 Java 时也能联调前后端。
22. As an 管理员, I want Vue 管理页维护黑名单, so that 在 Vben 端完成日常操作。
23. As an 管理员, I want React 管理页维护黑名单, so that 在 React 端完成日常操作。
24. As an 管理员, I want 系统菜单与 API 资源登记黑名单权限码, so that 非 root 角色可授权。
25. As a Root User, I want 默认仍可访问管理 API（通配策略）, so that 首登与初始化不受阻。
26. As an 开发者, I want Flyway V1 含表、V2 含菜单与 API seed, so that 新环境一次迁移齐套且不新增 V3。
27. As an 安全策略制定者, I want Blacklist 与用户 is_enabled、Casbin 正交, so that 职责清晰、可叠加。
28. As an 管理员, I want DEVICE 类型可配置但本波运行时不拦截设备, so that 数据先落、运行时后接。

## Implementation Decisions

### 领域与契约

- **Blacklist**：多态 target（`IP` | `USER` | `DEVICE`）+ `scope`（`LOGIN` | `API` | `ALL`）+ 时间窗 + 启停 + 软删；对齐 DB 约定 §18。
- **USER** 的 `target_value` 为 `sys_user.id` 十进制字符串（软引用）。
- **Access Blocked**：新增 `ResultCode`（鉴权段，建议 `ACCESS_BLOCKED`，如 2005）+ 固定文案；不把 `reason` 放进响应 body。
- 管理 API：`/api/system/blacklist` — list / all / `{id}` / POST / PUT / DELETE / batch；权限码 `system:blacklist:list|create|update|delete|batch`。
- 菜单 path：`/system/blacklist`；双前端页面挂在 system 模块，风格对齐字典等 CRUD。
- 分页成功：`data = { items, total }`；对外 camelCase VO。

### 运行时

- **统一 Servlet Filter**（LOGIN 与 API 均经过）：
  - 解析客户端 IP；按请求场景传入 `LOGIN` 或 `API`；命中 SQL/语义见 §18.3。
  - 已登录：从 Sa-Token session 取 userId，再查 `USER`。
  - **DEVICE 本波运行时不查**。
- **LOGIN + USER**：Filter 不解析登录 body；在鉴权服务于用户解析成功后、写入 token **前**查 USER（scope 覆盖 LOGIN）。
- 建议顺序：黑名单 → Sa-Token 鉴权 → Casbin；Filter 挂点需保证公开登录路径仍可做 IP 检查。
- 本波命中判定 **直查 DB**，不加缓存。

### 管理写路径

- 同 `(target_type, target_value, scope, starts_at, expires_at)` 活跃重复：应用层拒绝（补 MySQL NULL unique 漏洞）。
- 时间窗重叠：**允许**；可选 overlaps 查询或创建时 soft warning，不强制拒绝。
- batch：`enable` | `disable` | `delete`（语义对齐字典 batch）。
- 分层对齐现有系统模块：entity / repository / service / controller；DTO 入、VO 出；mapstruct-plus 层间映射。

### 迁移与 seed

- **不新增 V3**；将 `sys_blacklist` 写入 Flyway **`V1__schema.sql`**，菜单与 `sys_api`（及必要 menu_api）写入 **`V2__schema_seed.sql`**；同步权威 `backend/db/schema.sql` 已有定义与 prod 镜像路径若存在则一并一致。
- mock：内存数据 + 路由 + middleware 拦截；菜单/API 清单与 seed 对齐。

### 前端

- Vue（web-antdv-next）与 React 均交付：API 封装、列表筛选、表单（类型/值/scope/时间窗/reason/remark/启停）、batch、路由与 i18n。
- 动态菜单 component 与 mock/seed path 对齐。

### 领域文档

- 实现时在根 `CONTEXT.md` 增补 **Blacklist**、**Access Blocked** 术语（本波实体范围扩展）。

## Testing Decisions

- **只测外部行为**：命中与否、HTTP/Result 形状、CRUD 业务结果；不绑私有方法实现细节。
- **S1 命中判定**：共用查询/服务 — 时间窗边界、scope、软删/禁用、多行 OR、USER 有无。
- **S2 HTTP + 登录**：Filter 与登录链路 — Access Blocked、固定文案、不回传 reason；LOGIN IP、API IP+session USER、登录 USER。
- **S3 管理 Admin API**：list/create/update/软删/batch；同窗拒绝；重叠可建。
- **S4 Mock**：CRUD 响应形状 + middleware 拦截。
- **S5 前端**：以对照字典页的手工验收为主。
- **先验**：`DictTypeControllerTest`、`AuthServiceTest`、`SecurityFilterTest`、mock `tests/*`。

## Out of Scope

- DEVICE 运行时拦截与 deviceId header 约定落地
- CIDR / IP 段匹配
- 命中结果缓存（Redis 等）
- 新增 Flyway V3 及「仅增量迁移、不改 V1/V2」策略
- 与数据权限、部门的联动
- 修改表多态模型或分表
- 将 `reason` 暴露给客户端
- 全站 E2E 浏览器套件（本波非必须）

## Further Notes

- Handoff 已交付表结构；本 spec 覆盖运行时 + 管理四端。
- 本地无 MySQL 时以单测与 mock 验收为主；有库时可验证 V1/V2。
- 已部署环境若曾执行旧 V1/V2：原地改迁移文件**不**自动升级旧库——本决策假设可重建或人工对齐（Grill 已接受）。
- 实现编排：按 tickets 的 blocking 边分 **fresh session** `/implement`；不要同一 session 连续多 ticket。

## Grill 决策索引

| 项 | 结论 |
|----|------|
| 范围 | 全栈 CRUD + 运行时 + 四端 |
| 拦截形态 | 统一 Servlet Filter |
| 维度 | IP + session USER；DEVICE 仅配置 |
| LOGIN USER | AuthService 发 token 前 |
| 错误 | ACCESS_BLOCKED，不回 reason |
| CRUD | 完整 + batch；重叠允许 |
| 路径 | `/api/system/blacklist` |
| Seed | 改 V1/V2，无 V3 |
| Mock 拦截 | 有 |
