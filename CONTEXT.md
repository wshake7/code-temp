# Trellis Admin

后台管理（java-admin + 双前端 + mock）共享语言。本文件只记领域术语，不写实现细节。

## Language

**Admin API**：
后台统一 HTTP 契约面：路径以 `/api` 为前缀（无版本段），响应体为 `code` / `msg` / `data`。
_Avoid_: `/api/v1`、mock 旧字段 `message` / `error`

**Page Result**：
分页成功时 `data` 为 `{ items, total }`。
_Avoid_: `list` / `records` 作为分页列表字段名

**Access Token**：
登录成功后下发的会话凭证字段名；前端后续请求携带该 token。
_Avoid_: 仅写 `token` 作为登录响应对外字段（内部实现可用别名）

**System Module**：
本波正式落地的后台能力：鉴权、用户、角色、菜单、API 资源、字典、国际化、登录日志、API 日志，以及动态菜单路由。
_Avoid_: 部门（已无表）、Temporal 任务调度（本波不做）、demo/test 类接口

**Soft Delete**：
核心资源删除通过 `deleted_at` 毫秒时间戳标记；`0` 表示未删除。
_Avoid_: 核心资源物理 DELETE 作为默认语义

**Root User**：
初始化唯一超级用户；拥有 Casbin 通配策略，保证首登与运维可用。
_Avoid_: 多套默认管理员账号作为 seed 基线

**Role API Binding**：
角色与 API 资源的授权关系；变更时同步反映到访问控制策略。
_Avoid_: 仅改绑定表却不更新可执行策略

**Casbin Policy**：
按主体（用户）+ 路径 + HTTP 方法 的 ACL 策略；初始化为 Root 通配，业务变更时按用户展开同步。
_Avoid_: 未升级的 role 级 `g` 继承模型（本波不采用）

**ALTCHA Challenge**：
登录前人机校验挑战；服务端用官方 Java 库校验 payload。
_Avoid_: 仅前端假校验、跳过服务端验证

**Config Properties**：
java-admin 配置统一用类型安全的 Properties 类（`@ConfigurationProperties` 按前缀聚合）注入，例如 `AltchaProperties`、`CasbinProperties`、`FlywayMigratorProperties`。
_Avoid_: 业务或配置代码中直接使用 `@Value` 散落绑定配置键

**API Response VO**：
Controller 接口成功体 `Result` / `ObjectResult` 的 `data` 优先使用强类型 VO（`com.wshake.api.vo`），字段名与对外 JSON 契约对齐；批量结果、绑定结果、公钥等小对象也建专用 VO，不手写 `Map.of` / `LinkedHashMap` 拼装。
_Avoid_: `Result<Map<…>>` 作为业务接口返回类型（除非键集合本身动态、无法稳定建模，如动态路由 `meta` 自由形态；Service/Repository 内部聚合 Map 不在此限）

**MapStruct Plus Mapping**：
java-admin 各层对象映射统一用 mapstruct-plus：字段一一对应的类型转换（如 Request↔Command、Entity↔View、View↔VO、Batch/Result 等）在源或目标类型上声明 `@AutoMapper`，通过 `Converter.convert` 转换；路径参数（如 `id`）与 enrich 字段（如 `typeCode` / `roleNames`）等无法从源对象映射的，由调用方 convert 后再重建；Entity→View 目标为 **record** 时，null→`""`/`0` 等契约默认优先用 **record 紧凑构造器**规范化（勿在 record 上用 `ReverseAutoMapping.defaultValue`，会生成不可编译的 update 方法）；JSON 字符串↔`Map` 等类型不兼容字段（如 Task `retryPolicy`）保留手写映射 + `TaskJsonSupport`。
_Avoid_: 对同名字段列表手写 `new Xxx(…get…)` / 逐字段 setter 拷贝；对 **presence 语义**（如字段是否在 JSON 中出现、`ParentIdChange` / `MetadataChange`）做朴素 AutoMapper 而丢失「省略 vs 显式 null」语义
