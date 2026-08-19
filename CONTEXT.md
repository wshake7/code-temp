# Trellis Admin

后台管理产品（`java-admin` + 双前端 + mock）的共享领域语言。  
本文件只记**本项目特有**的术语与禁词，不含实现决策（实现决策见 `docs/adr/`）。

**当前产品面**：鉴权、用户、角色、菜单、API 资源、字典、国际化、登录日志、API 日志、动态菜单路由、访问黑名单（Blacklist）、任务配置与执行、平台时钟。  
**当前不做**：部门、数据权限运行时、素材库、支付/提现（方式 / 套餐 / 账单）、demo/test 类接口；Blacklist 的 DEVICE 运行时拦截与 CIDR。

## Language

### API 契约

**Admin API**：
后台统一 HTTP 契约面：路径以 `/api` 为前缀（无版本段），响应体为 `code` / `msg` / `data`。  
_Avoid_: `/api/v1`；mock 旧字段 `message` / `error`

**Page Result**：
分页成功时 `data` 的形状：`{ items, total }`。  
_Avoid_: `list` / `records` 作为分页列表字段名

**Access Token**：
登录成功后下发的会话凭证字段名；后续请求携带该 token。  
_Avoid_: 登录响应对外字段仅写 `token`（内部别名可保留）

### 身份与访问

**Root User**：
初始化唯一超级用户；持有 Casbin 通配策略，保证首登与运维可用。  
_Avoid_: 多套默认管理员作为 seed 基线

**API Resource**：
可被授权的后端接口资源（路径 + HTTP 方法等），是角色授权的目标。  
_Avoid_: 仅用菜单节点代替接口级授权

**Role API Binding**：
角色与 API Resource 的授权关系；变更须同步到可执行的访问控制策略。  
_Avoid_: 只改绑定表、不更新策略

**Role Menu Binding**：
角色与 Menu 的授权关系；决定动态菜单路由里谁能看见哪些入口。  
_Avoid_: 与 Role API Binding 混称；用菜单授权代替接口授权

**Menu API Binding**：
菜单与 API Resource 的结构化快捷绑定，方便从入口找到接口；不是授权关系。  
_Avoid_: 当作 Casbin 策略来源或角色授权

**Casbin Policy**：
按「主体（用户）+ 路径 + HTTP 方法」生效的 ACL 策略；业务变更时按用户展开同步。  
_Avoid_: 未升级的 role 级 `g` 继承模型（当前不采用）

**ALTCHA Challenge**：
登录前人机校验挑战；服务端校验 payload 后才允许登录。  
_Avoid_: 仅前端假校验、跳过服务端验证

### 资源生命周期

**Soft Delete**：
核心资源删除以 `deleted_at` 毫秒时间戳标记；`0` 表示未删除。  
_Avoid_: 核心资源默认物理 DELETE

**is_enabled**：
资源启停标志，与 Soft Delete 独立：禁用 ≠ 删除。  
_Avoid_: 用 `deleted_at` 表达「临时停用」

**Account Expires At**：
用户账号的可选过期时刻；为空表示永不过期。到点后账号不可再登录，已登录会话亦应被拒绝并结束；与 `is_enabled`、Soft Delete、Blacklist 正交（过期 ≠ 禁用/删除/拉黑）。  
_Avoid_: 用 `is_enabled=0` 表达「到期」；与会话 token 超时混称

### 时钟

**Physical Instant**：
同一个物理时刻（Instant / 毫秒时间戳），用于跨区比较与 Soft Delete。  
_Avoid_: 用无时区墙钟字符串比较跨区先后

**Platform Timezone**：
平台墙钟，固定 `Asia/Shanghai`；审计字段、日历 cron、无 offset 入参都按它解释。  
_Avoid_: 用服务器或浏览器本地时区解释业务墙钟

**Display Timezone**：
人看的数字所用的 IANA 时区；只改展示，不落库、不改 cron。  
_Avoid_: 把用户展示时区写入任务配置或当平台墙钟

### 系统能力

**User**：
后台操作者账号（登录名、凭证、启停、软删、可选账号过期等）。  
_Avoid_: 用「员工 / 成员」指代同一概念

**Role**：
可挂在用户上的权限集合；可有父子层级。  
_Avoid_: 把菜单树直接当角色模型

**Menu**：
后台导航与页面入口树；驱动动态菜单路由。  
_Avoid_: 部门树、权限点树与菜单混称

**Dict**：
字典类型 + 字典项，供前端下拉与展示取值。  
_Avoid_: 业务表内硬编码枚举文案作为唯一来源

**i18n Locale / Message**：
可配置的语言与文案资源，供前端与接口文案解析。  
_Avoid_: 仅前端本地 JSON、与后端文案体系脱节（当前以可管理文案为准）

**Login Log / API Log**：
登录行为与 API 访问的审计记录。  
_Avoid_: 用应用日志文件代替可查询的审计实体

**Blacklist**：
访问黑名单条目：按 IP / SYS_USER / DEVICE 多态 target，配合 scope（LOGIN / API / ALL）与时间窗限制访问；与用户 `is_enabled`、Casbin 正交。  
_Avoid_: 用「禁用用户」或 Casbin deny 代替临时/多维访问限制；当前运行时不查 DEVICE；不要把 target 写成 `USER`

**Access Blocked**：
因 Blacklist 命中被拒绝时的专用结果（错误码 + 固定文案）；`reason` 仅服务端可见。  
_Avoid_: 与 `AUTH_FORBIDDEN`（无权限）或凭证错误混用；不要把内部 `reason` 回传客户端

**Task Config**：
可调度任务的配置（编码、工作流类型、队列、可选 cron、重试/超时、启停）。启用且 cron 非空才进入日历调度；也可手动触发一次执行。  
_Avoid_: Quartz / XXL-Job /「定时器」作为本产品名；把执行记录当配置

**Task Execution**：
一次任务运行的应用层镜像（状态、起止时刻、输入/结果摘要）；一条 Task Config 对应多条执行。  
_Avoid_: 把调度引擎控制台当唯一执行史；把配置行当成一次运行

## 相关文档

| 文档                                            | 用途                                             |
| ----------------------------------------------- | ------------------------------------------------ |
| `docs/adr/`                                     | 实现与架构决策（读相关 ADR，勿把决策写回本文件） |
| `docs/adr/0001-typed-http-boundary.md`          | Controller DTO 入 / VO 出                        |
| `docs/adr/0002-mapstruct-plus-layer-mapping.md` | 层间 mapstruct-plus                              |
| `docs/adr/0003-configuration-properties.md`     | `@ConfigurationProperties`                       |
| `docs/adr/0004-platform-timezone.md`            | 三层时钟（物理时刻 / 平台墙钟 / 展示时区）       |
| `docs/adr/0005-okhttp-outbound-client.md`       | 出站 HTTP 用共享 OkHttpClient                    |
| `docs/adr/0006-temporal-task-mirror.md`         | Temporal 调度 + 执行记录应用层镜像               |
| `backend/db/docs/db-conventions.md`             | 表/字段/软删/审计等 DB 约定                      |
| `backend/db/docs/tables.md`                     | 表字段速查                                       |
| `backend/db/docs/er.md`                         | ER 关系                                          |
| `docs/agents/domain.md`                         | agent 如何消费本文件与 ADR                       |
