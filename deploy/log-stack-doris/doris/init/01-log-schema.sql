-- 官方日志表示例（单副本 / 动态分区 / 倒排索引）
-- 参考：https://doris.apache.org/zh-CN/docs/4.x/connection-integration/data-integration/vector/

CREATE DATABASE IF NOT EXISTS log_db;

USE log_db;

CREATE TABLE IF NOT EXISTS `doris_log` (
  `log_time` datetime NULL COMMENT 'log content time',
  `collect_time` datetime NULL COMMENT 'log agent collect time',
  `host` text NULL COMMENT 'hostname or ip',
  `path` text NULL COMMENT 'log file path',
  `type` text NULL COMMENT 'log type',
  `level` text NULL COMMENT 'log level',
  `thread` text NULL COMMENT 'log thread',
  `position` text NULL COMMENT 'log code position',
  `message` text NULL COMMENT 'log message',
  INDEX idx_host (`host`) USING INVERTED,
  INDEX idx_path (`path`) USING INVERTED,
  INDEX idx_type (`type`) USING INVERTED,
  INDEX idx_level (`level`) USING INVERTED,
  INDEX idx_thread (`thread`) USING INVERTED,
  INDEX idx_position (`position`) USING INVERTED,
  INDEX idx_message (`message`) USING INVERTED PROPERTIES("parser" = "unicode", "support_phrase" = "true")
) ENGINE=OLAP
DUPLICATE KEY(`log_time`)
PARTITION BY RANGE(`log_time`) ()
DISTRIBUTED BY RANDOM BUCKETS 10
PROPERTIES (
  "replication_num" = "1",
  "dynamic_partition.enable" = "true",
  "dynamic_partition.time_unit" = "DAY",
  "dynamic_partition.start" = "-7",
  "dynamic_partition.end" = "1",
  "dynamic_partition.prefix" = "p",
  "dynamic_partition.buckets" = "10",
  "dynamic_partition.create_history_partition" = "true",
  "compaction_policy" = "time_series"
);
