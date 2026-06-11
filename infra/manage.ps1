param(
  [Parameter(Position=0)]
  [ValidateSet("status", "start", "stop", "restart", "logs", "update", "backup", "reset-db", "prisma-studio")]
  [string]$Command = "status"
)

$ROOT = Split-Path -Parent $PSScriptRoot

function Show-Status {
  Write-Host "=== Recap Home Status ===" -ForegroundColor Cyan
  Write-Host ""

  # Check Docker
  $dockerRunning = docker info 2>&1 | Select-String "Server Version" -ErrorAction SilentlyContinue
  if ($dockerRunning) {
    Write-Host "🐳 Docker: Running" -ForegroundColor Green
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($containers) { Write-Host $containers }
  } else {
    Write-Host "🐳 Docker: Not running" -ForegroundColor Yellow
  }

  Write-Host ""

  # Check processes
  $apiProc = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "apps/api" }
  $webProc = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "apps/web" }
  $adminProc = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "apps/admin" }

  Write-Host "🖥️ Services:" -ForegroundColor Yellow
  if ($apiProc) { Write-Host "  ✅ API (port 3001)" -ForegroundColor Green } else { Write-Host "  ❌ API (port 3001)" -ForegroundColor Red }
  if ($webProc) { Write-Host "  ✅ Web (port 3000)" -ForegroundColor Green } else { Write-Host "  ❌ Web (port 3000)" -ForegroundColor Red }
  if ($adminProc) { Write-Host "  ✅ Admin (port 3002)" -ForegroundColor Green } else { Write-Host "  ❌ Admin (port 3002)" -ForegroundColor Red }

  Write-Host ""

  # Check ports
  Write-Host "🔌 Ports:" -ForegroundColor Yellow
  $ports = @(3001, 3000, 3002, 5432, 6379)
  foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
      Write-Host "  ✅ Port $port - Open" -ForegroundColor Green
    } else {
      Write-Host "  ⚠️ Port $port - Closed" -ForegroundColor DarkYellow
    }
  }
}

function Start-Services {
  param([string]$Service = "all")
  Write-Host "Starting Recap Home services..." -ForegroundColor Cyan
  $rootDir = Split-Path -Parent $PSScriptRoot

  # Check Docker
  $dockerRunning = docker info 2>&1 | Select-String "Server Version" -ErrorAction SilentlyContinue
  if (-not $dockerRunning) {
    Write-Host "⚠️ Docker is not running. Start Docker Desktop first." -ForegroundColor Yellow
    Write-Host "   docker-compose up -d" -ForegroundColor Gray
  }

  if ($Service -eq "all" -or $Service -eq "docker") {
    Set-Location $rootDir
    docker-compose up -d 2>$null
  }

  if ($Service -eq "all" -or $Service -eq "api") {
    $apiDir = Join-Path $rootDir "apps/api"
    $logFile = Join-Path $rootDir "logs/api.log"
    New-Item -ItemType Directory -Force -Path (Join-Path $rootDir "logs") | Out-Null
    Write-Host "  Starting API (logs: logs/api.log)..." -ForegroundColor Yellow
    $null = Start-Process -WindowStyle Hidden -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $apiDir -RedirectStandardOutput $logFile
  }

  if ($Service -eq "all" -or $Service -eq "web") {
    $webDir = Join-Path $rootDir "apps/web"
    $logFile = Join-Path $rootDir "logs/web.log"
    New-Item -ItemType Directory -Force -Path (Join-Path $rootDir "logs") | Out-Null
    Write-Host "  Starting Web (logs: logs/web.log)..." -ForegroundColor Yellow
    $null = Start-Process -WindowStyle Hidden -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $webDir -RedirectStandardOutput $logFile
  }
  Write-Host "✅ Done" -ForegroundColor Green
}

function Stop-Services {
  Write-Host "Stopping Recap Home services..." -ForegroundColor Cyan
  Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Write-Host "✅ All Node processes stopped" -ForegroundColor Green
}

function Show-Logs {
  param([string]$Service = "api", [int]$Lines = 50)
  $logFile = Join-Path $ROOT "logs/$Service.log"
  if (Test-Path $logFile) {
    Get-Content $logFile -Tail $Lines
  } else {
    Write-Host "❌ No logs found for $Service" -ForegroundColor Red
  }
}

function Update-Project {
  Write-Host "=== Updating Recap Home ===" -ForegroundColor Cyan
  Set-Location $ROOT

  # Pull latest code
  if (Test-Path ".git") {
    Write-Host "Pulling latest code..." -ForegroundColor Yellow
    git pull
  }

  # Update dependencies
  Write-Host "Updating dependencies..." -ForegroundColor Yellow
  npm install

  # Regenerate Prisma
  Set-Location packages/database
  npx prisma generate
  Set-Location $ROOT

  Write-Host "✅ Update complete" -ForegroundColor Green
}

function Backup-Database {
  $backupDir = Join-Path $ROOT "backups"
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $backupFile = Join-Path $backupDir "recap-home-$timestamp.sql"

  try {
    & docker exec recap-home-postgres-1 pg_dump -U recap recap_home > $backupFile 2>$null
    Write-Host "✅ Database backed up to $backupFile" -ForegroundColor Green
  } catch {
    Write-Host "❌ Backup failed. Is Docker running?" -ForegroundColor Red
  }
}

function Reset-Database {
  $confirm = Read-Host "⚠️ This will delete all data. Are you sure? (yes/no)"
  if ($confirm -ne "yes") { return }

  Set-Location (Join-Path $ROOT "packages/database")
  npx prisma migrate reset --force
  Write-Host "✅ Database reset complete" -ForegroundColor Green
}

function Open-PrismaStudio {
  Set-Location (Join-Path $ROOT "packages/database")
  npx prisma studio
}

# Main dispatch
switch ($Command) {
  "status" { Show-Status }
  "start" { Start-Services }
  "stop" { Stop-Services }
  "restart" { Stop-Services; Start-Services }
  "logs" { Show-Logs }
  "update" { Update-Project }
  "backup" { Backup-Database }
  "reset-db" { Reset-Database }
  "prisma-studio" { Open-PrismaStudio }
}