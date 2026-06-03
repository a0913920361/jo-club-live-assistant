param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [int]$Port = 4173
)

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
$listener.Start()
$logPath = Join-Path $Root ".preview.log"

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".svg" = "image/svg+xml"
}

function Write-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$Status,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8"
  )

  $headers = "HTTP/1.1 $Status $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  $Stream.Write($Body, 0, $Body.Length)
}

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $buffer = New-Object byte[] 8192
    $read = $stream.Read($buffer, 0, $buffer.Length)
    if ($read -le 0) {
      $client.Close()
      continue
    }

    $request = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read)
    $firstLine = ($request -split "`r`n")[0]
    $parts = $firstLine -split " "
    $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
    $pathOnly = ($rawPath -split "\?")[0]
    $relative = [Uri]::UnescapeDataString($pathOnly.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($relative)) {
      $relative = "index.html"
    }

    $candidate = Join-Path $Root $relative
    if (Test-Path -LiteralPath $candidate -PathType Container) {
      $candidate = Join-Path $candidate "index.html"
    }

    $file = $null
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      $file = (Resolve-Path -LiteralPath $candidate).Path
    }

    Add-Content -LiteralPath $logPath -Value ("{0} raw={1} relative={2} candidate={3} found={4}" -f (Get-Date -Format s), $rawPath, $relative, $candidate, [bool]$file)

    if ($file -and $file.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
      $body = [System.IO.File]::ReadAllBytes($file)
      $extension = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
      $contentType = $mimeTypes[$extension]
      if (-not $contentType) {
        $contentType = "application/octet-stream"
      }
      Write-Response -Stream $stream -Status 200 -StatusText "OK" -Body $body -ContentType $contentType
    } else {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      Write-Response -Stream $stream -Status 404 -StatusText "Not Found" -Body $body
    }
  } catch {
    try {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Server error")
      Write-Response -Stream $stream -Status 500 -StatusText "Server Error" -Body $body
    } catch {}
  } finally {
    $client.Close()
  }
}
