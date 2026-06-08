# Postral Core — Windows version updater (PowerShell)
# Downloads the latest stock.env from the repo and writes it to .env
# Usage: irm https://raw.githubusercontent.com/ubs-platform/postral-core/master/update.ps1 | iex

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── Variables ────────────────────────────────────────────────────────────────
$RepoOwner    = "ubs-platform"
$RepoName     = "postral-core"
$Branch       = "master"
$RawBaseUrl   = "https://raw.githubusercontent.com/$RepoOwner/$RepoName/$Branch"
$InstallDir   = "$env:USERPROFILE\.bin\tetakent\postral"
$StockEnvUrl  = "$RawBaseUrl/infrastructure/stock.env"
$EnvFile      = Join-Path $InstallDir ".env"
# ──────────────────────────────────────────────────────────────────────────────

if (-not (Test-Path $InstallDir)) {
  Write-Warning "Install directory not found: $InstallDir"
  Write-Warning "Run the installer first:"
  Write-Warning "  irm $RawBaseUrl/install.ps1 | iex"
  exit 1
}

Write-Host "Updating versions in: $EnvFile"
Invoke-WebRequest -Uri $StockEnvUrl -OutFile $EnvFile -UseBasicParsing
Write-Host "Done! Updated .env with latest versions from stock.env"
Write-Host ""
Write-Host "To apply the new versions, restart the stack:"
Write-Host "  cd `"$InstallDir`""
Write-Host "  docker compose pull"
Write-Host "  docker compose up -d"
