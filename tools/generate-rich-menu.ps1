$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$out = Join-Path $root "assets\rich-menu-jo-assistant.png"

Add-Type -AssemblyName System.Drawing

$width = 2500
$height = 1686
$cellW = [int]($width / 3)
$cellH = [int]($height / 2)

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$black = [System.Drawing.Color]::FromArgb(13, 13, 13)
$gold = [System.Drawing.Color]::FromArgb(212, 175, 88)
$goldSoft = [System.Drawing.Color]::FromArgb(164, 128, 58)
$warmWhite = [System.Drawing.Color]::FromArgb(245, 231, 192)
$muted = [System.Drawing.Color]::FromArgb(180, 150, 86)

$graphics.Clear($black)

$fontTitle = New-Object System.Drawing.Font "Microsoft JhengHei", 62, ([System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font "Georgia", 32, ([System.Drawing.FontStyle]::Regular)
$fontIcon = New-Object System.Drawing.Font "Georgia", 82, ([System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font "Georgia", 24, ([System.Drawing.FontStyle]::Regular)
$brushGold = New-Object System.Drawing.SolidBrush $gold
$brushWhite = New-Object System.Drawing.SolidBrush $warmWhite
$brushMuted = New-Object System.Drawing.SolidBrush $muted
$penGold = New-Object System.Drawing.Pen $gold, 7
$penGoldSoft = New-Object System.Drawing.Pen $goldSoft, 3

function U {
  param([int[]]$Codepoints)
  return [string]::Concat(($Codepoints | ForEach-Object { [char]$_ }))
}

$items = @(
  @{ Title = (U @(0x8A8D, 0x8B58, 0x6211, 0x5011)); Sub = "ABOUT US"; Icon = "US" },
  @{ Title = (U @(0x505C, 0x8ECA, 0x8CC7, 0x8A0A)); Sub = "PARKING INFO"; Icon = "P" },
  @{ Title = (U @(0x9810, 0x7D04, 0x5C08, 0x5340)); Sub = "RESERVATION"; Icon = "R" },
  @{ Title = (U @(0x83DC, 0x55AE)); Sub = "MENU"; Icon = "M" },
  @{ Title = (U @(0x6700, 0x65B0, 0x512A, 0x60E0)); Sub = "PROMOTIONS"; Icon = "%" },
  @{ Title = ("JO " + (U @(0x52A9, 0x624B))); Sub = "AI ASSISTANT"; Icon = "AI" }
)

for ($i = 0; $i -lt $items.Count; $i++) {
  $col = $i % 3
  $row = [math]::Floor($i / 3)
  $x = $col * $cellW
  $y = $row * $cellH

  $rect = New-Object System.Drawing.Rectangle $x, $y, $cellW, $cellH
  $cellBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(24, 22, 19)), ([System.Drawing.Color]::FromArgb(3, 3, 3)), 90
  $graphics.FillRectangle($cellBrush, $rect)
  $cellBrush.Dispose()

  $cx = $x + ($cellW / 2)
  $cy = $y + ($cellH / 2) - 10
  $r = 330
  $circle = New-Object System.Drawing.Rectangle ([int]($cx - $r)), ([int]($cy - $r)), ($r * 2), ($r * 2)
  $graphics.DrawEllipse($penGold, $circle)
  $inner = New-Object System.Drawing.Rectangle ([int]($cx - $r + 30)), ([int]($cy - $r + 30)), (($r - 30) * 2), (($r - 30) * 2)
  $graphics.DrawEllipse($penGoldSoft, $inner)

  $item = $items[$i]
  $iconSize = $graphics.MeasureString($item.Icon, $fontIcon)
  $graphics.DrawString($item.Icon, $fontIcon, $brushGold, [float]($cx - $iconSize.Width / 2), [float]($cy - 225))

  $titleSize = $graphics.MeasureString($item.Title, $fontTitle)
  $graphics.DrawString($item.Title, $fontTitle, $brushWhite, [float]($cx - $titleSize.Width / 2), [float]($cy - 50))

  $lineY = [float]($cy + 40)
  $graphics.DrawLine($penGoldSoft, [float]($cx - 210), $lineY, [float]($cx + 210), $lineY)

  $subSize = $graphics.MeasureString($item.Sub, $fontSub)
  $graphics.DrawString($item.Sub, $fontSub, $brushMuted, [float]($cx - $subSize.Width / 2), [float]($cy + 72))

  $brand = if ($i -eq 5) { "JO CLUB MEMBER SERVICE" } else { "JO CLUB" }
  $brandSize = $graphics.MeasureString($brand, $fontSmall)
  $graphics.DrawString($brand, $fontSmall, $brushMuted, [float]($cx - $brandSize.Width / 2), [float]($cy + 175))
}

$bitmap.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()

Write-Output $out
