$projectRoot = $PSScriptRoot
$serverScript = Join-Path $projectRoot "server\static-http-server.ps1"
$pidFile = Join-Path $projectRoot ".preview.pid"
$port = 4174

if (Test-Path -LiteralPath $pidFile) {
  $existingPid = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue
  if ($existingPid -and (Get-Process -Id $existingPid -ErrorAction SilentlyContinue)) {
    Write-Output "Preview already running at http://127.0.0.1:$port/"
    exit 0
  }
}

$process = Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $serverScript,
  "-Root", $projectRoot,
  "-Port", $port
) -WindowStyle Hidden -PassThru

Set-Content -LiteralPath $pidFile -Value $process.Id
Write-Output "Preview started at http://127.0.0.1:$port/"
