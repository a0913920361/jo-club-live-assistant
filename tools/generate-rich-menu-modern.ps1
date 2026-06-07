$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$out = Join-Path $root "assets\rich-menu-jo-modern-join-us.png"

Add-Type -AssemblyName System.Drawing

$width = 2500
$height = 1686
$cellW = [int]($width / 3)
$cellH = [int]($height / 2)

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

function ColorArgb {
  param([int]$A, [int]$R, [int]$G, [int]$B)
  return [System.Drawing.Color]::FromArgb($A, $R, $G, $B)
}

function U {
  param([int[]]$Codepoints)
  return [string]::Concat(($Codepoints | ForEach-Object { [char]$_ }))
}

function Draw-CenteredText {
  param(
    [System.Drawing.Graphics]$G,
    [string]$Text,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$Brush,
    [float]$CenterX,
    [float]$Y
  )
  $size = $G.MeasureString($Text, $Font)
  $G.DrawString($Text, $Font, $Brush, [float]($CenterX - $size.Width / 2), $Y)
}

function Draw-RoundRect {
  param(
    [System.Drawing.Graphics]$G,
    [System.Drawing.RectangleF]$Rect,
    [float]$Radius,
    [System.Drawing.Brush]$Brush,
    [System.Drawing.Pen]$Pen = $null
  )
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $Radius * 2
  $path.AddArc($Rect.X, $Rect.Y, $d, $d, 180, 90)
  $path.AddArc($Rect.Right - $d, $Rect.Y, $d, $d, 270, 90)
  $path.AddArc($Rect.Right - $d, $Rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($Rect.X, $Rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  if ($Brush) { $G.FillPath($Brush, $path) }
  if ($Pen) { $G.DrawPath($Pen, $path) }
  $path.Dispose()
}

function Draw-Icon {
  param(
    [System.Drawing.Graphics]$G,
    [string]$Kind,
    [float]$X,
    [float]$Y,
    [float]$Size,
    [System.Drawing.Pen]$Pen,
    [System.Drawing.Brush]$Brush
  )

  $cx = $X + $Size / 2
  $cy = $Y + $Size / 2

  switch ($Kind) {
    "about" {
      $G.DrawEllipse($Pen, [float]($X + 18), [float]($Y + 14), [float]($Size - 36), [float]($Size - 36))
      $G.FillEllipse($Brush, [float]($cx - 10), [float]($Y + 34), 20, 20)
      $G.DrawArc($Pen, [float]($X + 42), [float]($Y + 66), [float]($Size - 84), 54, 200, 140)
    }
    "parking" {
      $font = New-Object System.Drawing.Font "Arial", 78, ([System.Drawing.FontStyle]::Bold)
      Draw-CenteredText $G "P" $font $Brush $cx ([float]($Y + 12))
      $font.Dispose()
    }
    "reservation" {
      $G.DrawEllipse($Pen, [float]($X + 18), [float]($Y + 18), [float]($Size - 36), [float]($Size - 36))
      $G.DrawLine($Pen, $cx, [float]($Y + 32), $cx, $cy)
      $G.DrawLine($Pen, $cx, $cy, [float]($X + $Size - 46), [float]($Y + $Size - 50))
    }
    "menu" {
      for ($i = 0; $i -lt 4; $i++) {
        $yy = $Y + 28 + ($i * 26)
        $G.FillEllipse($Brush, [float]($X + 26), [float]$yy, 10, 10)
        $G.DrawLine($Pen, [float]($X + 48), [float]($yy + 5), [float]($X + $Size - 26), [float]($yy + 5))
      }
    }
    "join" {
      $G.DrawEllipse($Pen, [float]($X + 20), [float]($Y + 26), 44, 44)
      $G.DrawEllipse($Pen, [float]($X + 76), [float]($Y + 26), 44, 44)
      $G.DrawArc($Pen, [float]($X + 8), [float]($Y + 76), 70, 58, 198, 144)
      $G.DrawArc($Pen, [float]($X + 64), [float]($Y + 76), 70, 58, 198, 144)
      $G.DrawLine($Pen, [float]($X + 148), $cy, [float]($X + $Size - 24), $cy)
      $G.DrawLine($Pen, [float]($X + $Size - 56), [float]($cy - 32), [float]($X + $Size - 24), $cy)
      $G.DrawLine($Pen, [float]($X + $Size - 56), [float]($cy + 32), [float]($X + $Size - 24), $cy)
    }
    "ai" {
      $G.DrawEllipse($Pen, [float]($X + 20), [float]($Y + 20), [float]($Size - 40), [float]($Size - 40))
      $font = New-Object System.Drawing.Font "Arial", 54, ([System.Drawing.FontStyle]::Bold)
      Draw-CenteredText $G "AI" $font $Brush $cx ([float]($Y + 45))
      $font.Dispose()
      $G.DrawLine($Pen, [float]($X + 35), [float]($Y + $Size - 24), [float]($X + $Size - 35), [float]($Y + $Size - 24))
    }
    "staff" {
      $bubble = New-Object System.Drawing.RectangleF ([float]($X + 18)), ([float]($Y + 24)), ([float]($Size - 36)), ([float]($Size - 62))
      $G.DrawArc($Pen, $bubble.X, $bubble.Y, 46, 46, 180, 90)
      $G.DrawArc($Pen, ($bubble.Right - 46), $bubble.Y, 46, 46, 270, 90)
      $G.DrawArc($Pen, ($bubble.Right - 46), ($bubble.Bottom - 46), 46, 46, 0, 90)
      $G.DrawArc($Pen, $bubble.X, ($bubble.Bottom - 46), 46, 46, 90, 90)
      $G.DrawLine($Pen, [float]($bubble.X + 23), $bubble.Y, [float]($bubble.Right - 23), $bubble.Y)
      $G.DrawLine($Pen, $bubble.Right, [float]($bubble.Y + 23), $bubble.Right, [float]($bubble.Bottom - 23))
      $G.DrawLine($Pen, [float]($bubble.X + 23), $bubble.Bottom, [float]($bubble.Right - 52), $bubble.Bottom)
      $G.DrawLine($Pen, $bubble.X, [float]($bubble.Y + 23), $bubble.X, [float]($bubble.Bottom - 23))
      $G.DrawLine($Pen, [float]($bubble.Right - 52), $bubble.Bottom, [float]($bubble.Right - 28), [float]($bubble.Bottom + 30))
      $G.DrawLine($Pen, [float]($bubble.Right - 28), [float]($bubble.Bottom + 30), [float]($bubble.Right - 88), $bubble.Bottom)
      $G.FillEllipse($Brush, [float]($X + 48), [float]($Y + 78), 14, 14)
      $G.FillEllipse($Brush, [float]($X + 77), [float]($Y + 78), 14, 14)
      $G.FillEllipse($Brush, [float]($X + 106), [float]($Y + 78), 14, 14)
    }
  }
}

$bgTop = ColorArgb 255 18 16 14
$bgBottom = ColorArgb 255 5 5 6
$gold = ColorArgb 255 218 178 84
$goldLight = ColorArgb 255 255 226 151
$goldDim = ColorArgb 255 145 109 47
$white = ColorArgb 255 246 239 220
$muted = ColorArgb 255 190 164 107
$wine = ColorArgb 255 142 47 63
$green = ColorArgb 255 95 142 112

$bgRect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $bgRect, $bgTop, $bgBottom, 90
$graphics.FillRectangle($bgBrush, $bgRect)
$bgBrush.Dispose()

$brushGold = New-Object System.Drawing.SolidBrush $gold
$brushGoldLight = New-Object System.Drawing.SolidBrush $goldLight
$brushWhite = New-Object System.Drawing.SolidBrush $white
$brushMuted = New-Object System.Drawing.SolidBrush $muted
$brushWine = New-Object System.Drawing.SolidBrush (ColorArgb 80 142 47 63)
$brushGreen = New-Object System.Drawing.SolidBrush (ColorArgb 95 95 142 112)
$penGold = New-Object System.Drawing.Pen $gold, 5
$penGoldLight = New-Object System.Drawing.Pen $goldLight, 4
$penGoldDim = New-Object System.Drawing.Pen (ColorArgb 120 218 178 84), 2
$penDivider = New-Object System.Drawing.Pen (ColorArgb 90 218 178 84), 2

$fontKicker = New-Object System.Drawing.Font "Arial", 22, ([System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font "Microsoft JhengHei", 64, ([System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font "Arial", 28, ([System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font "Arial", 22, ([System.Drawing.FontStyle]::Regular)

$items = @(
  @{ Title = (U @(0x8A8D, 0x8B58, 0x6211, 0x5011)); Sub = "ABOUT US"; Kicker = "WHO WE ARE"; Icon = "about"; Accent = "gold" },
  @{ Title = (U @(0x505C, 0x8ECA, 0x8CC7, 0x8A0A)); Sub = "PARKING"; Kicker = "ARRIVE EASY"; Icon = "parking"; Accent = "green" },
  @{ Title = (U @(0x9810, 0x7D04, 0x5C08, 0x5340)); Sub = "RESERVATION"; Kicker = "BOOK YOUR NIGHT"; Icon = "reservation"; Accent = "gold" },
  @{ Title = (U @(0x83DC, 0x55AE)); Sub = "MENU"; Kicker = "DRINK & BITE"; Icon = "menu"; Accent = "wine" },
  @{ Title = (U @(0x52A0, 0x5165, 0x6211, 0x5011)); Sub = "JOIN US"; Kicker = "JOIN THE CREW"; Icon = "join"; Accent = "green" },
  @{ Title = (U @(0x5C08, 0x4EBA, 0x56DE, 0x8986)); Sub = "STAFF REPLY"; Kicker = "REAL PERSON"; Icon = "staff"; Accent = "gold" }
)

for ($i = 0; $i -lt $items.Count; $i++) {
  $col = $i % 3
  $row = [math]::Floor($i / 3)
  $x = $col * $cellW
  $y = $row * $cellH

  if ($col -gt 0) {
    $graphics.DrawLine($penDivider, [float]$x, [float]($y + 90), [float]$x, [float]($y + $cellH - 90))
  }
  if ($row -gt 0) {
    $graphics.DrawLine($penDivider, [float]($x + 80), [float]$y, [float]($x + $cellW - 80), [float]$y)
  }

  $card = New-Object System.Drawing.RectangleF ([float]($x + 56)), ([float]($y + 56)), ([float]($cellW - 112)), ([float]($cellH - 112))
  $cardBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $card, (ColorArgb 230 28 25 22), (ColorArgb 210 7 7 8), 90
  $cardPen = New-Object System.Drawing.Pen (ColorArgb 125 218 178 84), 2
  Draw-RoundRect $graphics $card 34 $cardBrush $cardPen
  $cardBrush.Dispose()
  $cardPen.Dispose()

  $item = $items[$i]
  $accentBrush = if ($item.Accent -eq "green") { $brushGreen } elseif ($item.Accent -eq "wine") { $brushWine } else { New-Object System.Drawing.SolidBrush (ColorArgb 75 218 178 84) }
  $accentRect = New-Object System.Drawing.RectangleF ([float]($x + 82)), ([float]($y + 82)), ([float]($cellW - 164)), 104
  Draw-RoundRect $graphics $accentRect 28 $accentBrush $null
  if ($item.Accent -eq "gold") { $accentBrush.Dispose() }

  $cx = $x + ($cellW / 2)
  Draw-CenteredText $graphics $item.Kicker $fontKicker $brushMuted $cx ([float]($y + 116))

  $iconSize = 166
  $iconX = $cx - $iconSize / 2
  $iconY = $y + 238
  Draw-Icon $graphics $item.Icon $iconX $iconY $iconSize $penGoldLight $brushGoldLight

  Draw-CenteredText $graphics $item.Title $fontTitle $brushWhite $cx ([float]($y + 455))
  $graphics.DrawLine($penGold, [float]($cx - 190), [float]($y + 548), [float]($cx + 190), [float]($y + 548))
  Draw-CenteredText $graphics $item.Sub $fontSub $brushGold $cx ([float]($y + 580))
  Draw-CenteredText $graphics "JO CLUB" $fontSmall $brushMuted $cx ([float]($y + 660))

  $dotBrush = New-Object System.Drawing.SolidBrush (ColorArgb 170 218 178 84)
  for ($d = 0; $d -lt 3; $d++) {
    $graphics.FillEllipse($dotBrush, [float]($x + $cellW - 120 + $d * 22), [float]($y + 112), 8, 8)
  }
  $dotBrush.Dispose()
}

$bitmap.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$fontKicker.Dispose()
$fontTitle.Dispose()
$fontSub.Dispose()
$fontSmall.Dispose()
$brushGold.Dispose()
$brushGoldLight.Dispose()
$brushWhite.Dispose()
$brushMuted.Dispose()
$brushWine.Dispose()
$brushGreen.Dispose()
$penGold.Dispose()
$penGoldLight.Dispose()
$penGoldDim.Dispose()
$penDivider.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Output $out
