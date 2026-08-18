#!/usr/bin/env bash
# Docker Desktop / Windows 上 JDK17 读 cgroup v2 会 NPE，关掉容器感知。
# 同时把默认 8g 堆降到本地可跑的大小。
set -euo pipefail

FE_CONF="/opt/apache-doris/fe/conf/fe.conf"

if [[ -f "${FE_CONF}" ]]; then
  sed -i 's/-Xmx8192m/-Xmx2048m/g; s/-Xms8192m/-Xms1024m/g' "${FE_CONF}"
  if ! grep -q 'UseContainerSupport' "${FE_CONF}"; then
    sed -i 's/JAVA_OPTS_FOR_JDK_17="/JAVA_OPTS_FOR_JDK_17="-XX:-UseContainerSupport /' "${FE_CONF}"
  fi
fi

exec bash init_fe.sh
