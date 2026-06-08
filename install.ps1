# Postral Core — Windows installer (PowerShell)
# Usage: irm https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.ps1 | iex
#   or:  powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.ps1 | iex"

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── Variables ────────────────────────────────────────────────────────────────
$RepoOwner   = "ubs-platform"
$RepoName    = "postral-core"
$Branch      = "master"
$RawBaseUrl  = "https://raw.githubusercontent.com/$RepoOwner/$RepoName/$Branch"
$InstallDir  = "$env:USERPROFILE\.bin\tetakent\postral"

# Files to download (paths relative to repo root)
$Files = @(
  "infrastructure/docker-compose.yml",
  "infrastructure/config/postral-ui.conf",
  "infrastructure/init.sql"
)

# Empty directories to create inside the install dir
$EmptyDirs = @(
  "mongo-data",
  "mariadb-data",
  "mongo-entrypoint"
)
# ──────────────────────────────────────────────────────────────────────────────

# ─── Preflight checks ─────────────────────────────────────────────────────────

# 1) Virtualization check
$virt = Get-CimInstance -ClassName Win32_Processor | Select-Object -ExpandProperty VirtualizationFirmwareEnabled -ErrorAction SilentlyContinue
if ($virt -eq $false) {
  Write-Warning "Hardware virtualization is disabled in firmware (BIOS/UEFI)."
  Write-Warning "Docker Desktop requires virtualization to be enabled."
  Write-Warning "Please enable Intel VT-x / AMD-V in your BIOS/UEFI settings and restart."
  exit 1
}

# 2) Hyper-V / WSL2 check (Docker Desktop needs one of these)
$hyperv = (Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -ErrorAction SilentlyContinue).State
$wsl    = (Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -ErrorAction SilentlyContinue).State
if ($hyperv -ne 'Enabled' -and $wsl -ne 'Enabled') {
  Write-Warning "Neither Hyper-V nor WSL2 is enabled."
  Write-Warning "Docker Desktop on Windows requires Hyper-V or WSL2 backend."
  Write-Warning "Enable WSL2:   wsl --install"
  Write-Warning "Enable Hyper-V: Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All"
  Write-Warning "A system restart will be required after enabling."
  exit 1
}

# 3) Docker check
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
  Write-Warning "Docker is not installed or not in PATH."
  Write-Warning "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
  exit 1
}

try {
  docker info 2>&1 | Out-Null
} catch {
  Write-Warning "Docker daemon is not running. Please start Docker Desktop and try again."
  exit 1
}

# ──────────────────────────────────────────────────────────────────────────────

Write-Host "Installing Postral Core to: $InstallDir"
Write-Host ""

# Create install directory structure
New-Item -ItemType Directory -Force -Path "$InstallDir\config" | Out-Null

foreach ($dir in $EmptyDirs) {
  New-Item -ItemType Directory -Force -Path "$InstallDir\$dir" | Out-Null
}

# Download each file
foreach ($file in $Files) {
  # Strip the "infrastructure/" prefix to get the local relative path
  $relative   = $file -replace "^infrastructure/", ""
  $localPath  = $relative -replace "/", "\"
  $target     = Join-Path $InstallDir $localPath
  $targetDir  = Split-Path $target -Parent

  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  Write-Host "  Downloading $file ..."
  Invoke-WebRequest -Uri "$RawBaseUrl/$file" -OutFile $target -UseBasicParsing
}
# Download stock.env as .env (version pins)
Write-Host "  Downloading infrastructure/stock.env -> .env ..."
Invoke-WebRequest -Uri "$RawBaseUrl/infrastructure/stock.env" -OutFile (Join-Path $InstallDir ".env") -UseBasicParsing
Write-Host ""
Write-Host "Done! Postral Core installed to: $InstallDir"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  cd `"$InstallDir`""
Write-Host "  docker compose up -d"
