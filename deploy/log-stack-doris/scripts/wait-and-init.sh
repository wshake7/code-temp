#!/usr/bin/env bash
# 等待 FE 可连、BE Alive，再执行建库建表。
set -euo pipefail

FE_HOST="${FE_HOST:-fe}"
FE_PORT="${FE_MYSQL_PORT:-9030}"
FE_USER="${DORIS_USER:-root}"
FE_PASS="${DORIS_PASSWORD:-}"
SQL_FILE="${SQL_FILE:-/sql/01-log-schema.sql}"

mysql_cmd() {
  if [[ -n "${FE_PASS}" ]]; then
    mysql -h"${FE_HOST}" -P"${FE_PORT}" -u"${FE_USER}" -p"${FE_PASS}" --protocol=TCP "$@"
  else
    mysql -h"${FE_HOST}" -P"${FE_PORT}" -u"${FE_USER}" --protocol=TCP "$@"
  fi
}

echo "[init] 等待 FE ${FE_HOST}:${FE_PORT} ..."
for _ in $(seq 1 90); do
  if mysql_cmd -e "SELECT 1" >/dev/null 2>&1; then
    echo "[init] FE 已可连接"
    break
  fi
  sleep 5
done

if ! mysql_cmd -e "SELECT 1" >/dev/null 2>&1; then
  echo "[init] FE 超时仍不可连接" >&2
  exit 1
fi

echo "[init] 等待 BE Alive ..."
for _ in $(seq 1 60); do
  alive="$(mysql_cmd -N -e "SELECT IFNULL(MAX(Alive), 0) FROM backends()" 2>/dev/null || echo 0)"
  # backends() 列名大小写因版本可能不同，再兜底一次
  if [[ "${alive}" != "1" && "${alive}" != "true" ]]; then
    alive="$(mysql_cmd -N -e "SELECT IFNULL(MAX(alive), 0) FROM backends()" 2>/dev/null || echo 0)"
  fi
  if [[ "${alive}" == "1" || "${alive}" == "true" ]]; then
    echo "[init] BE 已 Alive"
    break
  fi
  sleep 5
done

echo "[init] 执行 ${SQL_FILE}"
mysql_cmd < "${SQL_FILE}"
echo "[init] 建表完成"
mysql_cmd -e "SHOW TABLES FROM log_db"
