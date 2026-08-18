# 冒烟：检查 compose 语法、容器状态、BE Alive、doris_log 行数。
# 用法：在 deploy/log-stack-doris 下执行  pwsh -File .\scripts\smoke.ps1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Invoke-Compose {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$ComposeArgs)
    docker compose --env-file .env.example @ComposeArgs
}

Write-Host "== compose config（中心机） =="
Invoke-Compose config --quiet
Write-Host "中心机 compose 语法通过"

Write-Host "== compose config（业务机 Vector） =="
docker compose --env-file (Join-Path $Root "vector\.env.example") -f (Join-Path $Root "vector\docker-compose.yml") --profile demo config --quiet
Write-Host "Vector compose 语法通过"

$dockerOk = $true
try {
    docker info | Out-Null
} catch {
    $dockerOk = $false
}

if (-not $dockerOk) {
    Write-Host "Docker 未运行，跳过在线检查。请先启动 Docker Desktop 再执行："
    Write-Host "  docker compose --env-file .env.example up -d"
    Write-Host "  docker compose --env-file vector\.env.example -f vector\docker-compose.yml --profile demo up -d"
    exit 0
}

Write-Host "== 容器状态 =="
Invoke-Compose ps

Write-Host "== FE =="
docker compose --env-file .env.example exec -T fe bash -lc "mysql -uroot -P9030 -h127.0.0.1 -e `"SHOW FRONTENDS\G`""
Write-Host "== BE =="
docker compose --env-file .env.example exec -T fe bash -lc "mysql -uroot -P9030 -h127.0.0.1 -e `"SHOW BACKENDS\G`""

Write-Host "== 表行数 =="
$countSql = "SELECT COUNT(*) AS cnt FROM log_db.doris_log;"
docker compose --env-file .env.example exec -T fe bash -lc "mysql -uroot -P9030 -h127.0.0.1 -e `"$countSql`""

Write-Host "== MATCH_ANY error =="
$matchSql = "SELECT log_time, level, LEFT(message, 80) AS msg FROM log_db.doris_log WHERE message MATCH_ANY 'error' ORDER BY log_time DESC LIMIT 5;"
docker compose --env-file .env.example exec -T fe bash -lc "mysql -uroot -P9030 -h127.0.0.1 -e `"$matchSql`""

Write-Host ""
Write-Host "Grafana: http://127.0.0.1:4300  默认 admin / admin"
Write-Host "看板: Logs / Doris 日志检索"
Write-Host "FE HTTP: http://127.0.0.1:8030"
Write-Host "业务机 Vector: docker compose --env-file vector\.env.example -f vector\docker-compose.yml --profile demo up -d"
