#!/bin/sh
# 写出与官方 FE 日志相近的行，供 Vector 多行解析 + VRL 正则使用。
set -eu

LOG_DIR="${LOG_DIR:-/var/log/app}"
LOG_FILE="${LOG_FILE:-${LOG_DIR}/demo.log}"
INTERVAL_SECS="${INTERVAL_SECS:-2}"

mkdir -p "${LOG_DIR}"
touch "${LOG_FILE}"

seq_no=0
echo "[generator] 写入 ${LOG_FILE}，间隔 ${INTERVAL_SECS}s"

while true; do
  seq_no=$((seq_no + 1))
  ts="$(date '+%Y-%m-%d %H:%M:%S'),000"

  case $((seq_no % 10)) in
    0)
      printf '%s ERROR (demo-thread|1) [DemoApp.handle():42] request failed error 404 id=%s\n' "${ts}" "${seq_no}" >> "${LOG_FILE}"
      printf 'java.lang.RuntimeException: demo stacktrace seq=%s\n' "${seq_no}" >> "${LOG_FILE}"
      printf '        at com.example.DemoApp.handle(DemoApp.java:42)\n' >> "${LOG_FILE}"
      ;;
    3|7)
      printf '%s WARN (demo-thread|1) [DemoApp.handle():28] slow request latency_ms=320 seq=%s\n' "${ts}" "${seq_no}" >> "${LOG_FILE}"
      ;;
    *)
      printf '%s INFO (demo-thread|1) [DemoApp.run():10] demo heartbeat seq=%s\n' "${ts}" "${seq_no}" >> "${LOG_FILE}"
      ;;
  esac

  sleep "${INTERVAL_SECS}"
done
