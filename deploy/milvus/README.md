# Milvus Standalone（milvus）

官方三容器 Standalone：**etcd + MinIO + milvus-standalone**。适合本机开发 / 演示。数据落在 Docker 卷里；`down -v` 会清空向量。

同目录还有一套更轻的 [Qdrant 单节点](../qdrant/)。

**Standalone 只适合开发 / 演示。** 生产用 [Kubernetes Operator / 集群模式](https://milvus.io/docs/install_cluster-milvusoperator.md)。容器销毁且没挂卷会丢数据。

## 架构

```
[业务进程] ──gRPC :19530──► milvus-standalone
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
                 etcd :2379            MinIO :9000
           （元数据，不映射宿主机）   （对象存储；控制台 :19001）
                    │
                    ▼
           WebUI :9091/webui/
```

依据：

- [Run Milvus with Docker Compose](https://milvus.io/docs/install_standalone-docker-compose.md)
- [官方 standalone compose](https://raw.githubusercontent.com/milvus-io/milvus/master/deployments/docker/standalone/docker-compose.yml)
- [Quickstart / 客户端 URI](https://milvus.io/docs/quickstart.md)

官方下载地址也提供 `v3.0-beta` 的 yml。本栈钉 **`milvusdb/milvus:v3.0.0`**（与仓库 master compose 一致）。

相对官方 yml 的改动（只为在本仓库 Windows Docker Desktop 上更好用）：

- 数据用 named volume，不用 `./volumes` 绑定到 NTFS（etcd 在 Windows 绑定盘上容易挂）。
- MinIO 宿主机端口改成 `19000` / `19001`，避开常见 `9000`。
- 加了 `mem_limit`、时区、`depends_on: service_healthy`。

## 环境要求

- Docker Desktop（Linux 容器）。本机是 Windows 时不要用 host 网络。
- 建议给 Docker **至少 4 GB** 内存。compose 默认 standalone `2g`、etcd / MinIO 各 `256m`。内存吃紧就先关 Doris 栈。
- 首次拉 `milvusdb/milvus` 镜像体积较大。
- 首次就绪大约 **1–2 分钟**（healthcheck `start_period=90s`）。

## 启动

在 `deploy/milvus`：

```powershell
copy .env.example .env
docker compose --env-file .env up -d
pwsh -File .\scripts\smoke.ps1
```

## 入口

| 服务          | 地址                          | 说明                             |
| ------------- | ----------------------------- | -------------------------------- |
| WebUI         | http://127.0.0.1:9091/webui/  | 官方内置观察界面                 |
| healthz       | http://127.0.0.1:9091/healthz | 健康检查                         |
| gRPC / 客户端 | `http://127.0.0.1:19530`      | pymilvus `MilvusClient(uri=...)` |
| MinIO API     | http://127.0.0.1:19000        | 一般不用直接打                   |
| MinIO Console | http://127.0.0.1:19001        | 默认 `minioadmin` / `minioadmin` |

客户端（与官方 Quickstart 一致）：

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="http://localhost:19530", token="root:Milvus")
```

冒烟：

```powershell
curl.exe http://127.0.0.1:9091/healthz
```

## 改配置

| 文件                    | 用途                         |
| ----------------------- | ---------------------------- |
| `.env` / `.env.example` | 镜像、端口、MinIO 账号、内存 |
| `docker-compose.yml`    | 编排、健康检查、数据卷       |

覆盖默认 `milvus.yaml` 用官方方式：进容器改 `/milvus/configs/user.yaml` 后 `docker restart`。见 [官方说明](https://milvus.io/docs/install_standalone-docker-compose.md)。

```powershell
docker compose --env-file .env up -d --force-recreate standalone
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

1. **healthz 一直失败**：镜像还在拉，或内存不够。`docker compose ps` 看 etcd / minio 是否 healthy，再 `docker compose logs standalone`。
2. **Windows 上 etcd 起不来**：不要改回官方的 `./volumes` 绑定盘。本栈用 named volume 就是为了躲 NTFS。
3. **MinIO 9000 被占用**：本栈默认宿主机已是 `19000` / `19001`。若仍冲突，改 `.env` 的 `MINIO_*_PORT`。
4. **客户端连不上**：URI 用 `http://127.0.0.1:19530`，不是 9091。默认未开鉴权时 `token="root:Milvus"` 也可传。
5. **和 Doris 栈一起跑**：本栈默认不占 8030/9030/8040。内存建议只留一套重栈。
6. **时区**：默认 `Asia/Shanghai`。
