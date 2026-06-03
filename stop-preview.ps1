$projectRoot = $PSScriptRoot
$pidFile = Join-Path $projectRoot ".preview.pid"

if (-not (Test-Path -LiteralPath $pidFile)) {
  Write-Output "No preview server pid file found."
  exit 0
}

$serverPid = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue
if ($serverPid) {
  $process = Get-Process -Id $serverPid -ErrorAction SilentlyContinue
  if ($process) {
    Stop-Process -Id $serverPid -Force
    Write-Output "Preview server stopped."
  } else {
    Write-Output "Preview server was not running."
  }
}

Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
