param(
  [switch]$SkipDocker,
  [switch]$SkipInstall
)

Write-Host "=== Recap Home Infrastructure Setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check prerequisites
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow
$hasNode = Get-Command node -ErrorAction SilentlyContinue
$hasNpm = Get-Command npm -ErrorAction SilentlyContinue
$hasGit = Get-Command git -ErrorAction SilentlyContinue
$hasDocker = Get-Command docker -ErrorAction SilentlyContinue

if (-not $hasNode) { Write-Host "  ❌ Node.js not found. Install from https://nodejs.org" -ForegroundColor Red; exit 1 }
if (-not $hasNpm) { Write-Host "  ❌ npm not found." -ForegroundColor Red; exit 1 }
if (-not $hasGit) { Write-Host "  ❌ git not found. Install from https://git-scm.com" -ForegroundColor Red; exit 1 }

Write-Host "  ✅ Node.js $(node --version)" -ForegroundColor Green
Write-Host "  ✅ npm $(npm --version)" -ForegroundColor Green
Write-Host "  ✅ Git $(git --version)" -ForegroundColor Green

if ($hasDocker) {
  Write-Host "  ✅ Docker $(docker --version)" -ForegroundColor Green
} else {
  Write-Host "  ⚠️ Docker not found (optional for local development)" -ForegroundColor Yellow
}

# 2. Install dependencies
if (-not $SkipInstall) {
  Write-Host "[2/5] Installing workspace dependencies..." -ForegroundColor Yellow
  npm install
  if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ npm install failed" -ForegroundColor Red; exit 1 }
  Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
}

# 3. Generate Prisma client
Write-Host "[3/5] Generating Prisma client..." -ForegroundColor Yellow
Set-Location packages\database
npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Prisma generate failed" -ForegroundColor Red; exit 1 }
Write-Host "  ✅ Prisma client generated" -ForegroundColor Green
Set-Location ..\..

# 4. Start Docker containers (if available)
if ((-not $SkipDocker) -and $hasDocker) {
  Write-Host "[4/5] Starting Docker containers..." -ForegroundColor Yellow
  $dockerRunning = docker info 2>&1 | Select-String "Server Version"
  if ($dockerRunning) {
    docker-compose up -d
    Write-Host "  ✅ Docker containers started" -ForegroundColor Green
  } else {
    Write-Host "  ⚠️ Docker daemon not running. Start Docker Desktop first." -ForegroundColor Yellow
  }
} else {
  Write-Host "[4/5] Skipping Docker (use -SkipDocker or Docker not available)" -ForegroundColor Yellow
}

# 5. Run Prisma migrations (if database is available)
Write-Host "[5/5] Checking database..." -ForegroundColor Yellow
try {
  $connection = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
  if ($connection.TcpTestSucceeded) {
    Set-Location packages\database
    npx prisma migrate dev --name init
    Write-Host "  ✅ Database migrations applied" -ForegroundColor Green
    Set-Location ..\..
  } else {
    Write-Host "  ⚠️ Database not available. Run docker-compose up -d first." -ForegroundColor Yellow
  }
} catch {
  Write-Host "  ⚠️ Could not connect to database." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  - Start API:     cd apps/api && npm run dev"
Write-Host "  - Start Web:     cd apps/web && npm run dev"
Write-Host "  - Start Admin:   cd apps/admin && npm run dev"
Write-Host "  - Start All:     npm run dev (from root)"