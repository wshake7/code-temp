#!/usr/bin/env bash
# 容器 mem_limit 默认 4g。BE 默认按宿主机 80% 估内存，会超过 cgroup 被 OOM。
# 这里把进程预算压到 3G，给堆外/页缓存留余量。
set -euo pipefail

BE_CONF="/opt/apache-doris/be/conf/be.conf"

if [[ -f "${BE_CONF}" ]]; then
  if grep -qE '^\s*mem_limit\s*=' "${BE_CONF}"; then
    sed -i 's/^\s*mem_limit\s*=.*/mem_limit=3G/' "${BE_CONF}"
  else
    printf '\nmem_limit=3G\n' >> "${BE_CONF}"
  fi
fi

exec bash init_be.sh
