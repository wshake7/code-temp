# Qdrant 单节点（qdrant）

单容器 Qdrant，适合本机开发 / 演示。数据落在 Docker 卷里；`down -v` 会清空向量。

同目录还有一套更重的 [Milvus Standalone](../milvus/)（etcd + MinIO + standalone）。

**本栈不是生产集群。** 官方生产更推荐 [Qdrant Cloud](https://qdrant.tech/documentation/cloud/) 或 Kubernetes Operator；Docker Compose 需要自己补备份、TLS、多节点。

## 架构

```
[业务进程] ──REST :6333 / gRPC :6334──► Qdrant
                                           │
                                           ▼
                                    Dashboard /dashboard
```

依据：

- [Local Quickstart](https://qdrant.tech/documentation/quickstart/)
- [Installation / Docker Compose](https://qdrant.tech/documentation/installation/#docker-compose)
- [Security / API Key](https://qdrant.tech/documentation/security/)

自建默认无鉴权。本栈用环境变量 `QDRANT__SERVICE__API_KEY` 打开 admin key，请求头是 `api-key: <值>`。

## 环境要求

- Docker Desktop（Linux 容器）。本机是 Windows 时不要用 host 网络。
- 演示大约 **1 GB** 内存即可。compose 默认 `mem_limit=1g`。
- 与 `log-stack-*`、`milvus` 可同时跑：默认端口 `6333` / `6334`。

## 启动

在 `deploy/qdrant`：

```powershell
copy .env.example .env
# 改 QDRANT_API_KEY，生产不要用默认 changeme
docker compose --env-file .env up -d
pwsh -File .\scripts\smoke.ps1
```

一般数秒就绪。

## 入口

| 服务        | 地址                            | 说明                                      |
| ----------- | ------------------------------- | ----------------------------------------- |
| Dashboard   | http://127.0.0.1:6333/dashboard | 内置 Web UI                               |
| REST / 健康 | http://127.0.0.1:6333           | `/readyz`、`/collections`，要带 `api-key` |
| gRPC        | `127.0.0.1:6334`                | 部分官方客户端默认走 gRPC                 |

冒烟：

```powershell
curl.exe -H "api-key: changeme" http://127.0.0.1:6333/readyz
curl.exe -H "api-key: changeme" http://127.0.0.1:6333/collections
```

建一个 4 维演示集合（与官方 Quickstart 一致）：

```powershell
curl.exe -X PUT http://127.0.0.1:6333/collections/test_collection `
  -H "api-key: changeme" -H "Content-Type: application/json" `
  -d "{\"vectors\":{\"size\":4,\"distance\":\"Dot\"}}"
```

## 改配置

| 文件                    | 用途                      |
| ----------------------- | ------------------------- |
| `.env` / `.env.example` | 镜像、端口、API Key、内存 |
| `docker-compose.yml`    | 编排、数据卷、健康检查    |

```powershell
docker compose --env-file .env up -d --force-recreate qdrant
```

## 停止

```powershell
docker compose --env-file .env down
```

清数据卷（集合会清空）：

```powershell
docker compose --env-file .env down -v
```

## 常见问题

1. **401**：请求没带 `api-key`，或和 `.env` 里的 `QDRANT_API_KEY` 不一致。
2. **Dashboard 打不开**：容器还没起来。先 `curl.exe http://127.0.0.1:6333/readyz`，再看 `docker compose logs qdrant`。
3. **端口冲突**：改 `.env` 里的 `QDRANT_HTTP_PORT` / `QDRANT_GRPC_PORT`。
4. **生产暴露公网**：官方要求再配 [TLS](https://qdrant.tech/documentation/security/#tls)，并把宿主机端口绑到 `127.0.0.1` 或内网。
5. **时区**：默认 `Asia/Shanghai`。
