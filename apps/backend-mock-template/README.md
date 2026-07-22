# @vben/backend-mock

## Description

Vben Admin 数据 mock 服务，没有对接任何的数据库，所有数据都是模拟的，用于前端开发时提供数据支持。线上环境不再提供 mock 集成，可自行部署服务或者对接真实数据，由于 `mock.js` 等工具有一些限制，比如上传文件不行、无法模拟复杂的逻辑等，所以这里使用了真实的后端服务来实现。唯一麻烦的是本地需要同时启动后端服务和前端服务，但是这样可以更好的模拟真实环境。该服务不需要手动启动，已经集成在 vite 插件内，随应用一起启用。

## Auth（sa-token 风格单 token）

- 登录 `POST /api/auth/login` 只返回 `accessToken`（opaque UUID 会话）
- 请求头：`Authorization: Bearer <token>`
- 服务端内存会话表：每次合法校验会**滑动续期**（后端自行续期，无 `/auth/refresh`）
- 登出 `POST /api/auth/logout` 作废当前 Bearer 会话

环境变量（可选，开发默认见 `.env.development`，`pnpm start` / nitro dev 自动加载）：

| 变量 | 默认 | 说明 |
|------|------|------|
| `AUTH_TOKEN_TIMEOUT_SECONDS` | `2592000`（30 天） | 会话超时；每次请求重置 |
| `AUTH_IS_CONCURRENT` | `true` | 是否允许多端登录 |
| `AUTH_IS_SHARE` | `false` | 同账号是否共享同一 token |

修改 `.env.development` 后需重启 mock。进程重启后会话清空（mock 可接受）。

## Running the app

```bash
# development
$ pnpm run start

# production mode
$ pnpm run build
```
