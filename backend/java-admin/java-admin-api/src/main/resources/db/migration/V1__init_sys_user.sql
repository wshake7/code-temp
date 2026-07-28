-- V1: 建 sys_user + casbin_rule 表（Q5 决策：部分对齐 v5 约定）
--   采纳：snake_case / BIGINT UNSIGNED 主键 / utf8mb4_0900_ai_ci / InnoDB / 显式 uniq_ 索引
--   不加：deleted_at / is_enabled / 7 字段审计（Q5 决策）
--   casbin_rule：jcasbin JDBC adapter 标准 policy 存储表（与 backend/db/schema.sql 对齐）

CREATE TABLE IF NOT EXISTS sys_user (
    id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    username    VARCHAR(64)      NOT NULL DEFAULT '',
    password    VARCHAR(255)     NOT NULL DEFAULT '',
    nickname    VARCHAR(64)      NOT NULL DEFAULT '',
    status      TINYINT          NOT NULL DEFAULT 1         COMMENT '0=禁用 1=启用',
    create_time DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_sys_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='系统用户表';

-- jcasbin policy 存储表（与 jcasbin jdbc-adapter 2.7.0 兼容）
CREATE TABLE IF NOT EXISTS casbin_rule (
    id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ptype VARCHAR(255)    NOT NULL                COMMENT 'policy type: p=策略 / g=角色继承',
    v0    VARCHAR(255)    DEFAULT NULL             COMMENT 'subject（用户 ID / 角色）',
    v1    VARCHAR(255)    DEFAULT NULL             COMMENT 'object（API 路径）',
    v2    VARCHAR(255)    DEFAULT NULL             COMMENT 'action（HTTP 方法）',
    v3    VARCHAR(255)    DEFAULT NULL,
    v4    VARCHAR(255)    DEFAULT NULL,
    v5    VARCHAR(255)    DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_casbin_rule_ptype_v0_v1 (ptype, v0, v1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='jcasbin policy 存储（jdbc-adapter 标准表）';
