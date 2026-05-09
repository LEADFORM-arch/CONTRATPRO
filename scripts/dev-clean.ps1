$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$escapedRepoRoot = [regex]::Escape($repoRoot)

Write-Host "ContratPro dev clean start" -ForegroundColor Cyan
Write-Host "Repository: $repoRoot"

try {
  $contratProNodeProcesses = Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -eq "node.exe" -and
      $_.CommandLine -match $escapedRepoRoot
    }
} catch {
  Write-Host "Process command lines are not accessible. Falling back to all node.exe processes." -ForegroundColor Yellow
  $contratProNodeProcesses = Get-Process node -ErrorAction SilentlyContinue |
    ForEach-Object {
      [pscustomobject]@{
        ProcessId = $_.Id
      }
    }
}

foreach ($process in $contratProNodeProcesses) {
  Write-Host "Stopping node process $($process.ProcessId)"
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

Set-Location $repoRoot

Write-Host "Starting Next dev server on http://localhost:3000" -ForegroundColor Green
npm.cmd run dev
