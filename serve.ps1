param(
  [int]$Port = 4173,
  [string]$Root = $PSScriptRoot,
  [switch]$OpenBrowser
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "PRESIDENTE: O DESAFIO GLOBAL rodando em $prefix"
Write-Host "Diretorio raiz: $Root"
Write-Host "Pressione Ctrl+C para encerrar."

if ($OpenBrowser) {
  Start-Process $prefix
}

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".mjs"  = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".ico"  = "image/x-icon"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $relPath = $request.Url.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }
    $relPath = $relPath -replace '/', '\'
    $fullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $relPath))
    $rootFull = [System.IO.Path]::GetFullPath($Root)

    if (-not $fullPath.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $fullPath -PathType Leaf)) {
      $response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $relPath")
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
      continue
    }

    $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
    $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
    $response.ContentType = $contentType
    $response.Headers.Add("Cache-Control", "no-store")
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
