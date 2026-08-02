# @vben/backend-mock

## Description

Vben Admin 数据 mock 服务，没有对接任何的数据库，所有数据都是模拟的，用于前端开发时提供数据支持。线上环境不再提供 mock 集成，可自行部署服务或者对接真实数据，由于 `mock.js` 等工具有一些限制，比如上传文件不行、无法模拟复杂的逻辑等，所以这里使用了真实的后端服务来实现。唯一麻烦的是本地需要同时启动后端服务和前端服务，但是这样可以更好的模拟真实环境。该服务不需要手动启动，已经集成在 vite 插件内，随应用一起启用。

## Auth（sa-token 风格单 token）

- 登录 `POST /api/auth/login` 只返回 `accessToken`（opaque UUID 会话）
- 请求头：`Authorization: Bearer <token>`
- 服务端内存会话表：每次合法校验会**滑动续期**（后端自行续期，无 `/auth/refresh`）
- 登出 `POST /api/auth/logout` 作废当前 Bearer 会话

环境变量（可选，开发默认见 `.env.development`，`pnpm start` / nitro dev 自动加载）：

| 变量                              | 默认                                  | 说明                                            |
| --------------------------------- | ------------------------------------- | ----------------------------------------------- |
| `AUTH_TOKEN_TIMEOUT_SECONDS`      | `2592000`（30 天）                    | 会话超时；每次请求重置                          |
| `AUTH_IS_CONCURRENT`              | `true`                                | 是否允许多端登录                                |
| `AUTH_IS_SHARE`                   | `false`                               | 同账号是否共享同一 token                        |
| `AUTH_JAVA_INTROSPECT_URL`        | `http://localhost:4080/api/user/info` | hybrid：向 java 内省 Sa-Token；设为空字符串关闭 |
| `AUTH_JAVA_USER_FALLBACK`         | `root`                                | java 用户名在 mock 无同名用户时回落的 mock 用户 |
| `AUTH_JAVA_INTROSPECT_TIMEOUT_MS` | `3000`                                | 内省 HTTP 超时（毫秒）                          |

修改 `.env.development` 后需重启 mock。进程重启后会话清空（mock 可接受）。

## 请求安全协议（与 Java 对齐）

mock 实现与 java-admin 同一套头协议，便于 dev 全开时代理到 mock 联调：

| 能力      | 环境变量                                                      | 默认                 |
| --------- | ------------------------------------------------------------- | -------------------- |
| Timestamp | `SECURITY_TIMESTAMP_ENABLED` / `SECURITY_TIMESTAMP_EXPIRE_MS` | 开 / 300000          |
| Encrypt   | `SECURITY_ENCRYPT_ENABLED`                                    | 开                   |
| Nonce     | `SECURITY_NONCE_ENABLED` / `SECURITY_NONCE_EXPIRE_MS`         | 开 / 0（= 2×时间窗） |
| Sign      | `SECURITY_SIGN_ENABLED`（仅 Encrypt 关时生效）                | 开                   |
| Language  | `SECURITY_LANGUAGE_ENABLED`                                   | 开                   |

- 公钥：`GET /api/encrypt/public/key` → `{ code, msg, data: { publicKey } }`（SPKI base64）
- 白名单（免强制加密）：`/api/encrypt/public/key`、`/api/altcha/**`、文档与健康检查；**不含** `/api/auth/login`
- Nonce 为进程内内存实现；进程重启后清空
- 可选固定密钥：`SECURITY_RSA_PUBLIC_KEY` / `SECURITY_RSA_PRIVATE_KEY`

```bash
pnpm -C apps/backend-mock-template test
```

## Hybrid（mock + java 交叉）

前端 Vite 代理常见分流：

- `/api/auth/*`、`/api/user/*`、`/api/altcha/*` → **java-admin:4080**
- 其余 `/api/*`（含 `/api/menu/all`）→ **backend-mock:4000**

此时登录 token 由 java Sa-Token 签发，mock 内存会话里没有该 token，会直接 401。

解决方式：middleware `2.java-auth-bridge` 在业务 handler 前调用 java `GET /api/user/info` 内省；成功后把 token 登记为 mock 本地会话，并按 **username → mock 用户**（无同名则 `AUTH_JAVA_USER_FALLBACK`）做 RBAC，供 `/menu/all`、`/auth/codes` 等使用。

要求本地 **java 与 mock 同时启动**。java 未起时内省失败，mock 鉴权接口仍 401。

## Running the app

```bash
# development
$ pnpm run start

# production mode
$ pnpm run build
```
