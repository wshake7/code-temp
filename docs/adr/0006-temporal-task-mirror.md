# 任务调度用 Temporal，执行记录是应用层镜像

任务配置以库表为源：写路径在落库后同步到 Temporal Schedule（启用且 cron 非空则 upsert，否则 pause）。手动触发走 Temporal 启动一次运行。Temporal 是必要依赖，没有 no-op / 本地假调度回退。

**执行史**：`temporal_task_execution` 是应用层镜像（状态与输入/结果摘要），不是 Temporal 自带存储。镜像由系统侧 tick 对未终态行 `describe`、并按 Visibility 回补 Schedule 触发的 run。业务代码读镜像表，不把 Temporal 控制台当唯一查询面。

**登记**：`workflowType` / `taskQueue` 必须命中关闭清单；镜像 tick 等系统 Workflow 不进入任务配置可选列表。

**不做**：Quartz / XXL-Job / Spring `@Scheduled` 作为产品调度器；按任务单独配时区（日历 cron 固定平台墙钟，见 ADR-0004）。
