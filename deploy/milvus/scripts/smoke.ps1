# 冒烟：检查 compose 语法、容器状态、/healthz。
# 用法：在 deploy/milvus 下执行  pwsh -File .\scripts\smoke.ps1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Invoke-Compose {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$ComposeArgs)
    docker compose --env-file .env.example @ComposeArgs
}

Write-Host "== compose config =="
Invoke-Compose config --quiet
Write-Host "compose 语法通过"

$dockerOk = $true
try {
    docker info | Out-Null
} catch {
    $dockerOk = $false
}

if (-not $dockerOk) {
    Write-Host "Docker 未运行，跳过在线检查。请先启动 Docker Desktop 再执行："
    Write-Host "  docker compose --env-file .env.example up -d"
    exit 0
}

Write-Host "== 容器状态 =="
Invoke-Compose ps

function Get-DotEnvValue {
    param(
        [string]$Path,
        [string]$Key,
        [string]$Default
    )
    if (-not (Test-Path $Path)) {
        return $Default
    }
    $line = Get-Content -LiteralPath $Path | Where-Object { $_ -match "^\s*$([regex]::Escape($Key))=" } | Select-Object -First 1
    if (-not $line) {
        return $Default
    }
    return ($line -split "=", 2)[1].Trim().Trim('"').Trim("'")
}

$envFile = if (Test-Path (Join-Path $Root ".env")) { Join-Path $Root ".env" } else { Join-Path $Root ".env.example" }
$httpPort = Get-DotEnvValue -Path $envFile -Key "MILVUS_HTTP_PORT" -Default "9091"
$grpcPort = Get-DotEnvValue -Path $envFile -Key "MILVUS_GRPC_PORT" -Default "19530"
$healthUrl = "http://127.0.0.1:${httpPort}/healthz"

Write-Host "== Milvus /healthz =="
try {
    $healthCode = & curl.exe -sS -o NUL -w "%{http_code}" --max-time 5 $healthUrl
    if ($healthCode -ne "200") {
        throw "HTTP $healthCode"
    }
    Write-Host "GET $healthUrl -> $healthCode"
} catch {
    Write-Host "Milvus 未就绪：$($_.Exception.Message)"
    Write-Host "首次启动可能要 1–2 分钟。先执行：docker compose --env-file .env.example up -d"
    exit 0
}

Write-Host ""
Write-Host "WebUI: http://127.0.0.1:${httpPort}/webui/"
Write-Host "客户端 URI: http://127.0.0.1:${grpcPort}"
Write-Host "默认 token（开启鉴权后）: root:Milvus"
