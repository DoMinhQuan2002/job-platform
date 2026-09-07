# OS-level helper: chạy set-all-avatars 1 lần (để gắn Windows Task Scheduler / cron).
# Backend in-process cron đã có trong src/jobs/scheduler.ts (mỗi giờ).
# Chỉ dùng file này nếu muốn schedule ngoài process Node.
#
# Windows Task Scheduler (mỗi giờ):
#   Program: powershell.exe
#   Args:    -ExecutionPolicy Bypass -File "F:\app\job-platform\job-platform\apps\backend\scripts\cron-set-all-avatars.ps1"
#
# Linux crontab:
#   0 * * * * cd /path/to/job-platform/apps/backend && npx tsx scripts/set-all-avatars.ts >> /tmp/set-all-avatars.log 2>&1

$ErrorActionPreference = "Stop"
$backendRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $backendRoot "package.json"))) {
  $backendRoot = $PSScriptRoot
  if (-not (Test-Path (Join-Path $backendRoot "package.json"))) {
    throw "Cannot find apps/backend root from $PSScriptRoot"
  }
}

Set-Location $backendRoot
Write-Host "[cron-set-all-avatars] $(Get-Date -Format o) cwd=$backendRoot"
npx tsx scripts/set-all-avatars.ts
if ($LASTEXITCODE -ne 0) {
  throw "set-all-avatars exited with code $LASTEXITCODE"
}
