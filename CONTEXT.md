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
