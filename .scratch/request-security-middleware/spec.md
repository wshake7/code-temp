# Spec: 请求安全中间件（Timestamp / Encrypt / Nonce / Sign / Language）

**Status:** ready-for-agent  
**Feature slug:** `request-security-middleware`  
**Source:** `/develop-grill` Research + Grill（2026-08-03）  
**Reference:** harness-template Go `fiberc/middleware`（`security.go` / `language.go`）及已有 Java 移植

## Problem Statement

管理后台请求目前主要依赖登录态与 Casbin，缺少与 Go admin 对齐的**请求时间窗、传输层加解密、防重放、签名校验与语言头**能力。本地联调默认明文，生产若临时开启安全能力，四端（Java / mock / Vue / React）无法一致开关与互通。

## Solution

在 Java、mock、Vue、React 实现同一套请求安全协议：`X-Request-Timestamp`、`X-Request-ID`、`X-Request-Encrypted-Key`、`X-Request-Signature`、`X-Language`（及响应 `X-Response-Is-Encrypt`）。  
安全能力由**后端配置 + 前端 env 同步**控制，且 **Timestamp / Encrypt / Nonce / Sign / Language 可独立开关**；dev 默认全开，与生产行为一致。Encrypt 开启时除白名单外**强制加密**。

## User Stories

1. As a 后端服务, I want 在配置开启 Timestamp 时拒绝过期请求, so that 降低重放时间窗风险。  
2. As a 后端服务, I want 在配置开启 Encrypt 时解密请求并加密响应, so that 传输层敏感数据不以明文出现。  
3. As a 调用方, I want 在 Encrypt 开启但缺少加密头时被明确拒绝, so that 不能静默绕过加密。  
4. As a 调用方, I want 从公钥接口获取 RSA 公钥, so that 客户端可加密 AES 会话密钥。  
5. As a 后端服务, I want 在配置开启 Nonce 时拒绝重复 X-Request-ID, so that 同一 nonce 不能在有效期内重放。  
6. As a 后端服务, I want 在 Encrypt 关闭且 Sign 开启时校验请求签名, so that 明文模式下仍可做完整性校验。  
7. As a 后端服务, I want 在 Language 开启时从 X-Language（回退 Accept-Language）解析语言, so that 请求上下文具备 locale。  
8. As a 已登录用户, I want 语言与个人 languageCode 不一致时被异步写回用户表, so that 偏好可收敛且不阻塞接口。  
9. As a 前端开发者, I want 用 env 单独开关各安全能力, so that 与后端配置对齐并可随时切换。  
10. As a 前端应用, I want 在 Encrypt 开启时自动加解密请求/响应, so that 业务代码无感。  
11. As a 前端应用, I want 始终（Language 开时）发送 X-Language, so that 与 Go 头约定一致。  
12. As a 使用 mock 的开发者, I want mock 实现同协议加解密与校验, so that dev 全开时代理到 mock 仍可联调。  
13. As a 运维/开发, I want 关闭任意子开关后对应校验立即失效, so that 可渐进降级或排障。  
14. As a API 客户端, I want 安全失败返回 Result 1xxx 业务码, so that 与现有错误体系一致。  
15. As a 系统, I want 公钥、ALTCHA、文档与健康检查路径免强制加密, so that 启动与挑战流程可完成。  
16. As a 登录用户, I want 登录接口在 Encrypt 开启时仍走加密, so that 凭证不以明文 JSON 暴露。

## Implementation Decisions

1. **能力集合**：Timestamp + Encrypt + Nonce + Sign + Language；对齐 Go middleware 语义，适配 code-temp 分层与 Result 契约。  
2. **开关模型**：后端 `app.security.*.enabled`（或等价 yml/env）+ 前端 `VITE_SECURITY_*` 同步；**每项独立**；无运行时管理 API。  
3. **默认值**：dev 与 prod 示例均为**全开**。  
4. **Timestamp**：读取 `X-Request-Timestamp`（可兼容旧 `X-Timestamp`）；有头才校验；窗口默认 5 分钟。  
5. **Encrypt**：ON 时强制要求 `X-Request-Encrypted-Key`（白名单除外）；RSA-OAEP-SHA256 解 AES key；AES-GCM 解密 body（AAD = 排序后的 Request-ID + Timestamp + query）；响应体加密并设 `X-Response-Is-Encrypt: true`。  
6. **白名单（免强制加密）**：`/api/encrypt/public/key`、`/api/altcha/**`、API 文档与健康检查；**不含** `/api/auth/login`。  
7. **密钥**：全局 RSA 密钥对，Redis cache-aside + 进程内 volatile 缓存；提供 `GET /api/encrypt/public/key` → `Result{ data: { publicKey } }`。  
8. **Nonce**：以 `X-Request-ID` 为 nonce，Redis SET+EX；TTL 对齐过期策略（建议 ≥ 时间窗）。  
9. **Sign 与 Encrypt 协作**：Encrypt 开时由 Encrypt 路径完成 body/AAD 校验；**Sign 仅在 Encrypt 关且 Sign 开时**对请求做独立签名校验。  
10. **Language**：优先 `X-Language`，回退 `Accept-Language`；写入 request attribute（及可选 MDC）；已登录且与 `sys_user.language_code` 不同则**异步更新**；Language 开关独立。  
11. **错误码**：扩展 `ResultCode` 1xxx（例如请求过期、请求错误、密钥/签名失败、Nonce 冲突）；不沿用 Go 的 2/3/5。  
12. **响应契约**：HTTP 仍可为 200，body 为 `code/msg/data`；与现有全局错误处理一致。  
13. **Filter/拦截器顺序（概念）**：Timestamp → Nonce → Encrypt 或 Sign → 认证/授权；Language 可在拦截器链中尽早设置上下文。  
14. **前端**：React / Vue request 层在 Encrypt 开时走与 harness 一致的 AES-GCM + RSA 协议；注入 Timestamp、Request-ID、Encrypted-Key、Signature；响应若标记加密则解密后再走 code 解析；Language 开时写 `X-Language`。  
15. **Mock**：与 Java 同协议（公钥、加解密、timestamp/nonce/sign、独立开关）；dev 全开时可替换 Java 联调。  
16. **multipart / SSE**：跳过 body 加解密缓冲，避免破坏上传与流式。  
17. **配置热更**：以应用配置/env 为准；Nacos 若已接入可映射同名字段，但不额外做管理 API。

## Testing Decisions

1. **主 seam：HTTP 安全协议（Java）** — 覆盖 Timestamp、Encrypt 强制/白名单、Nonce 重放、Sign（Encrypt 关）、Language 上下文、各开关 OFF；断言 Result code/msg 与关键头。  
2. **辅 seam：Mock 协议对等** — 公钥、加密请求/响应、关开关明文至少可验证。  
3. **辅 seam：前端 request 客户端** — 开关 ON/OFF 头与加解密行为；`X-Language` 注入。  
4. **好测试**：只断言外部可观察行为（请求/响应头与 body、Redis nonce 可观察效果），不绑私有方法结构。  
5. **Prior art**：harness `SecurityFilterTests` / `CryptoServiceTests`；本仓库 `AuthControllerTest`、`ResultFormatTest`。  
6. **不做主策略**：全量浏览器 E2E、对每个 filter 私有 helper 的白盒测试。

## Out of Scope

- 运行时管理员 API 动态开关  
- 每会话独立 RSA 密钥对  
- 修改统一响应为非 `Result` 或改用 HTTP 4xx 作为主错误通道  
- 重做 Sa-Token / Casbin 鉴权模型  
- 同步阻塞写库更新 languageCode  
- 将 Go Nonce 以外的其它中间件（api_log、trace 完整体系）一并迁移  

## Further Notes

- 参考实现：harness-template `backend/go/admin/internal/fiberc/middleware/security.go`、`language.go`；Java 侧 `TimestampFilter` / `EncryptFilter` / `CryptoService`；前端 `request-encryption` / `@vp` encryption helpers。  
- code-temp 当前前端仅 `Accept-Language` + `X-Request-ID`，无传输加密；Java 无对应 filter。  
- 实现 ticket 应垂直切片（可 demo），并声明 blocking edges；每个 ticket 在 fresh session 中 `/implement`。  
- 术语：Request Security、Encrypt Middleware、Nonce、AAD、Language Header、Security Toggle。
