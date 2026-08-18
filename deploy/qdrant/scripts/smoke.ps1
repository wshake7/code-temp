# 冒烟：检查 compose 语法、容器状态、/readyz、集合列表。
# 用法：在 deploy/qdrant 下执行  pwsh -File .\scripts\smoke.ps1
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
$httpPort = Get-DotEnvValue -Path $envFile -Key "QDRANT_HTTP_PORT" -Default "6333"
$apiKey = Get-DotEnvValue -Path $envFile -Key "QDRANT_API_KEY" -Default "changeme"
$qdrantBase = "http://127.0.0.1:${httpPort}"

Write-Host "== Qdrant /readyz =="
try {
    $healthCode = & curl.exe -sS -o NUL -w "%{http_code}" --max-time 5 -H "api-key: ${apiKey}" "$qdrantBase/readyz"
    if ($healthCode -ne "200") {
        throw "HTTP $healthCode"
    }
    Write-Host "GET $qdrantBase/readyz -> $healthCode"
} catch {
    Write-Host "Qdrant 未就绪：$($_.Exception.Message)"
    Write-Host "先启动：docker compose --env-file .env.example up -d"
    exit 0
}

Write-Host "== 集合列表 GET /collections =="
try {
    $content = & curl.exe -sS --max-time 15 -H "api-key: ${apiKey}" "$qdrantBase/collections"
    Write-Host $content
} catch {
    Write-Host "查询失败：$($_.Exception.Message)"
}

Write-Host ""
Write-Host "Dashboard: $qdrantBase/dashboard"
Write-Host "REST: $qdrantBase  （请求头 api-key: $apiKey）"
