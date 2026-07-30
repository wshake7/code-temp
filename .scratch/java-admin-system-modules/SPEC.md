# Spec: java-admin 系统模块正式实现

**Status:** ready-for-agent  
**Feature slug:** `java-admin-system-modules`  
**Source:** `/develop-grill` Research + Grill（2026-07-30）

## Problem Statement

管理后台目前依赖 `backend-mock-template` 的内存 mock 支撑用户、角色、菜单、API、字典、国际化与日志等能力。`java-admin` 仅有登录骨架与简化 `sys_user` 表，无法作为生产或联调真实后端。前端与 mock 契约也与 Java 侧 `Result` / 路径不一致，切换成本高。

## Solution

以 `backend/db` schema v10 为真相源，在 `java-admin` 实现本波约定的 System Module HTTP API；统一契约为 `/api` 前缀 + `Result{code,msg,data}`；同步改造 react-admin、vue web-antdv-next 与 mock，使三端认同一套契约。权限用现有 jCasbin ACL，seed 唯一 Root 用户 + 通配 policy，角色 API 绑定变更时同步展开策略。登录接入 ALTCHA（altcha-lib-java）。

## User Stories

1. As an 管理员, I want 用账号密码 + ALTCHA 登录, so that 获得 accessToken 并进入后台。
2. As an 管理员, I want 登出并失效会话, so that 他人无法复用 token。
3. As an 管理员, I want 查看当前用户信息与权限码, so that 前端能渲染菜单与按钮。
4. As an 管理员, I want 获取动态菜单路由, so that 侧栏与路由按授权展示。
5. As an 管理员, I want 分页查询/创建/更新/软删用户并分配角色, so that 管理账号生命周期。
6. As an 管理员, I want 重置用户密码与启停用户, so that 处理安全与停用场景。
7. As an 管理员, I want 管理角色（CRUD、树/父子）并绑定菜单与 API, so that 控制可见与可调用范围。
8. As an 管理员, I want 管理菜单树（DIR/MENU/BUTTON）并绑定 API, so that 导航与按钮权限一致。
9. As an 管理员, I want 管理 API 资源（CRUD、分组、同步清单类能力按 mock 等价）, so that 权限点可维护。
10. As an 管理员, I want 管理字典类型与字典数据（含 platform/tag_type）, so that 前后端枚举可配置。
11. As an 管理员, I want 管理语言与翻译（含按 key 聚合、导入导出类能力按 mock 等价）, so that 多语言文案可运维。
12. As an 管理员, I want 查询登录日志与 API 日志, so that 审计登录与调用。
13. As a 开发者, I want mock 与 Java 使用同一路径与响应形状, so that 本地可无 Java 开发且不双维护契约。
14. As a 前端, I want request 层识别 code/msg/data 与 accessToken, so that 指向 java-admin 即可联调。
15. As a Root 用户, I want 初始化后具备通配策略, so that 首登不会被 Casbin 全部 403。
16. As an 安全策略, I want 角色 API 或用户角色变更后 enforce 结果立即一致, so that 授权不漂移。

## Implementation Decisions

1. **API 契约**：路径前缀 `/api`（无 `v1`）。统一响应 `code` / `msg` / `data`；成功 `code=0`。分页 `data = { items, total }`。登录 `data` 含 `accessToken` 与用户摘要（id、username、nickname/realName、roles 等，与前端适配后的 types 一致）。
2. **模块范围（System Module）**：auth（含 ALTCHA challenge）、user info、menu all、user、role、menu、api、dict-type、dict-data、i18n-locale、i18n-translation、login-log、api-log。
3. **Out 模块见下文**；本 spec 不实现 task、dept、timezone、upload、demo。
4. **Schema**：Flyway 迁入全量 `backend/db/schema.sql` 语义（v10）；废弃简化 `sys_user` 字段（password/status/create_time），改为 password_hash、is_enabled、deleted_at、审计字段等。实体与 Easy-Query 对齐 snake_case 列。
5. **Seed**：精简为 **一条 Root 用户 + 对应角色**；`casbin_rule` 为该用户写 **通配 policy**（path/method 通配，保证首登可用）。字典/菜单/API 等业务 seed 可复用或裁剪 `schema_data.sql`，但用户/角色不以 mock 三账号为基线。
6. **软删**：核心资源 DELETE = 写 `deleted_at` 毫秒时间戳；列表默认 `deleted_at = 0`。关联表（user_role、role_api、role_menu、menu_api）解绑/重绑为 **硬删行再插入**（符合 db-conventions）。
7. **Casbin**：保持现有 ACL model（sub/obj/act + keyMatch2）；**不**升级 role 继承 g。写 `sys_role_api` 或 `sys_user_role` 时，按受影响用户 **展开/替换** p 策略（用户 id + API path + method）。Root 通配策略保留或与展开逻辑兼容，避免把自己锁死。
8. **鉴权栈**：Sa-Token 登录态 + CasbinInterceptor；登录与 challenge 等公开路径排除。Token 请求头沿用 satoken / Bearer 既有配置。
9. **密码**：BCrypt 存 `password_hash`；禁止回显 hash。
10. **ALTCHA**：服务端 challenge 接口 + 登录校验，使用 altcha-org 官方 Java 库。
11. **日志**：登录成功/失败写 `sys_login_log`；API 访问写 `api_log`（可复用/扩展现有 RequestLogAspect 思路，字段对齐 schema）。
12. **前端**：react-admin 与 vue web-antdv-next 的 request、auth、system API 适配新契约；baseURL 可指向 java-admin。
13. **Mock**：路径改为 `/api/...`（与 Nitro 路由约定一致），响应改为 `code/msg/data`，分页与登录字段对齐；去掉与本波冲突的旧 message/error 形状。
14. **路径形态**：在保持 `/api` 前缀前提下，**优先与现有前端 rest 路径语义一致**（如 `/api/system/user/list`），仅将外层契约改为 Java Result，以降低前端 diff；若某资源 REST 化更清晰，可在对应 ticket 内局部调整并同步三端。
15. **分层**：api（Controller/DTO/VO）→ service（业务）→ repository（Easy-Query）；common 错误码与 Result 复用。
16. **OpenAPI/Knife4j**：新 Controller 补注解，与 Auth 现有风格一致。

## Testing Decisions

1. **主 seam：HTTP API** — 覆盖登录/鉴权失败、分页、创建更新软删、角色菜单 API 绑定、字典与 i18n 主路径、日志列表；断言 `code/msg/data` 与关键字段。
2. **辅 seam：Service 单测** — AuthService（凭证、禁用、ALTCHA 失败）、Casbin 同步（绑定变更后 enforce）。
3. **好测试**：只断言外部行为（状态码、body 契约、DB 可观察结果、enforce 结果），不绑私有方法结构。
4. **Prior art**：`AuthServiceTest`、`ResultFormatTest`、`GlobalExceptionHandlerTest`。
5. **不做**：全量浏览器 E2E、Temporal 集成、对每个 handler 的纯 mock 仓储测试作为主策略。

## Out of Scope

- temporal_task_config / temporal_task_execution 及 Temporal Worker
- 部门（dept / sys_dept）
- timezone、upload、demo/bigint、test、table 列表
- sys_data_permission 管理 API 与 ABAC 引擎完整实现
- 日志归档表运维流水线
- 多租户 / 多端 SSO
- 将 mock 物理删除（仅契约对齐，可继续本地开发）

## Further Notes

- 现有 Flyway V1/V2 与 v10 全量 schema 冲突时，采用 **替换/重建迁移链**（dev 可 clean 重建；prod 策略在实现 ticket 中写清，默认本仓库以 dev 友好为主）。
- Casbin 空表 deny-by-default：seed 与同步逻辑是 blocker，必须先于业务模块联调。
- 术语见根目录 `CONTEXT.md`（Admin API、Page Result、Access Token、Root User、Soft Delete、Casbin Policy 等）。
