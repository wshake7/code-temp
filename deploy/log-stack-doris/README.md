# Vector + Doris + Grafana 日志栈（log-stack-doris）

两套 compose：**中心机**跑 Doris + Grafana，**业务机**单独跑 Vector。

同目录还有一套更轻的 [log-stack-victorialogs](../log-stack-victorialogs/)（Vector + VictoriaLogs）。

**Doris/Grafana 只适合开发 / 演示。** 官方明确 Docker 单副本不适合生产，容器销毁会丢数据。

## 架构

```
[业务服务器]                         [中心机]
日志文件 → Vector (remap) ──Stream Load──► Doris FE/BE
                                              │
                                              ▼
                                      Grafana (MySQL :9030)
```

依据：

- [Doris Vector 集成](https://doris.apache.org/zh-CN/docs/4.x/connection-integration/data-integration/vector/)
- [Vector Doris Sink](https://vector.dev/docs/reference/configuration/sinks/doris)（文档已有；`timberio/vector:0.49` 发行包尚未合入，本栈用 Stream Load HTTP 等价实现）
- [Doris 日志存储与分析](https://doris.apache.org/zh-CN/docs/4.x/observability/log)
- [Doris Docker 快速入门](https://doris.apache.org/docs/4.x/getting-started/quick-start)

## 环境要求

- Docker Desktop（Linux 容器）。本机是 Windows 时不要用 host 网络。
- 建议给 Docker **至少 8 GB 内存**。Windows Docker Desktop 上 FE 已关闭 JDK 容器感知（cgroup NPE）并把堆降到 2g。compose 默认 `mem_limit`：FE 3g / BE 4g（BE 进程预算 3G）/ Grafana 256m。
- 官方 `apache/doris` 镜像要求 CPU 支持 **AVX2**。
- 首次拉 FE/BE 镜像体积较大。

## 启动

### 1. 中心机（Doris + Grafana）

在 `deploy/log-stack-doris`：

```powershell
copy .env.example .env
docker compose --env-file .env up -d
pwsh -File .\scripts\smoke.ps1
```

首次 FE/BE 就绪大约 1–3 分钟。`doris-init` 会等 BE Alive 后再建表。

### 2. 业务机（仅 Vector）

把 `vector/` 目录拷到业务机。在 `vector/`：

```powershell
copy .env.example .env
# 把 DORIS_BE_HOST 改成中心机 IP，LOG_HOST_DIR 改成业务日志目录
docker compose --env-file .env up -d
```

本机联调（和 Doris 同一台 Docker）：

```powershell
cd vector
docker compose --env-file .env.example --profile demo up -d
```

`DORIS_BE_HOST=host.docker.internal` 会打到本机映射出来的 BE `:8040`。

## 入口

| 服务          | 地址                  | 说明                                                     |
| ------------- | --------------------- | -------------------------------------------------------- |
| Grafana       | http://127.0.0.1:4300 | 默认 `admin` / `admin`，看板在 **Logs / Doris 日志检索** |
| Doris FE HTTP | http://127.0.0.1:8030 | Stream Load / Web                                        |
| Doris MySQL   | `127.0.0.1:9030`      | `root`，默认空密码                                       |
| BE HTTP       | http://127.0.0.1:8040 | Stream Load / 状态；业务机需放行此端口                   |
| Vector API    | http://业务机:8686    | 可选，排查用                                             |

手工查日志：

```sql
mysql -uroot -P9030 -h127.0.0.1
SELECT COUNT(*) FROM log_db.doris_log;
SELECT * FROM log_db.doris_log ORDER BY log_time DESC LIMIT 10;
SELECT * FROM log_db.doris_log WHERE message MATCH_ANY 'error' ORDER BY log_time DESC LIMIT 10;
```

## 采集什么

业务机默认采集宿主机 `LOG_HOST_DIR`（映射为容器内 `/var/log/app/*.log`）。生产改 `.env` 里的 `LOG_HOST_DIR`，例如 `/var/log/myapp`。不要默认挂整个磁盘。

`--profile demo` 会在同一目录写演示日志（含少量 ERROR 堆栈，用于多行合并）。

## 改配置

| 文件                                  | 用途                        |
| ------------------------------------- | --------------------------- |
| `.env` / `.env.example`               | 中心机镜像、端口、账号      |
| `vector/.env` / `vector/.env.example` | 业务机 Doris 地址、采集目录 |
| `doris/init/01-log-schema.sql`        | 库表、倒排索引、动态分区    |
| `vector/vector.yaml`                  | 采集、解析、Stream Load     |
| `vector/docker-compose.yml`           | 业务机编排                  |
| `grafana/dashboards/logs.json`        | 看板                        |

```powershell
# 中心机
docker compose --env-file .env up -d --force-recreate grafana
# 业务机
cd vector
docker compose --env-file .env up -d --force-recreate vector
```

## 停止

```powershell
# 中心机
docker compose --env-file .env down
# 业务机
cd vector
docker compose --env-file .env down
```

清中心机数据卷（日志表会清空）：

```powershell
docker compose --env-file .env down -v
```

## 常见问题

1. **BE 一直不 Alive**：宿主机内存不够，或 CPU 无 AVX2。看 `docker compose logs be`。
2. **想用原生 `type: doris`**：等官方 Vector 发行包合入后再改 `vector.yaml`；或换 [Doris 社区预编译 Vector](https://doris.apache.org/zh-CN/docs/4.x/connection-integration/data-integration/vector/)。当前默认 HTTP Stream Load，且直连 BE `:8040`（FE 会 307，Vector HTTP sink 不跟随 PUT 重定向）。
3. **表不存在**：`doris-init` 失败。先 `docker compose logs doris-init`，再 `docker compose run --rm doris-init`。
4. **Grafana 数据源红**：FE 尚未就绪或密码与 `.env` 不一致。默认空密码。
5. **端口冲突**：改 `.env` 里的 `FE_*` / `GRAFANA_PORT`。本栈默认占用 8030/9030/9010/8040/9050/4300，避开 java-admin 的 4336/4379/4080。
