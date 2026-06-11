param(
  [Parameter(Position=0)]
  [ValidateSet("api", "web", "admin", "all")]
  [string]$Target = "all",
  [switch]$DryRun
)

Write-Host "=== Recap Home Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check git status
$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Host "⚠️ Uncommitted changes detected:" -ForegroundColor Yellow
  Write-Host $gitStatus
  $confirm = Read-Host "Continue with deployment? (yes/no)"
  if ($confirm -ne "yes") { exit 0 }
}

function Deploy-API {
  Write-Host "📦 Deploying API to Railway..." -ForegroundColor Yellow
  if ($DryRun) {
    Write-Host "  [DRY RUN] Would deploy apps/api to Railway"
    return
  }

  # Check if Railway CLI is installed
  $hasRailway = Get-Command railway -ErrorAction SilentlyContinue
  if (-not $hasRailway) {
    Write-Host "  ⚠️ Railway CLI not found. Install via: npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "  Then run: railway login && railway link && railway up" -ForegroundColor Gray
    return
  }

  Set-Location apps/api
  railway up
  Set-Location ../..
  Write-Host "  ✅ API deployed" -ForegroundColor Green
}

function Deploy-Web {
  Write-Host "📦 Deploying Web to Vercel..." -ForegroundColor Yellow
  if ($DryRun) {
    Write-Host "  [DRY RUN] Would deploy apps/web to Vercel"
    return
  }

  $hasVercel = Get-Command vercel -ErrorAction SilentlyContinue
  if (-not $hasVercel) {
    Write-Host "  ⚠️ Vercel CLI not found. Install via: npm install -g vercel" -ForegroundColor Yellow
    Write-Host "  Then run: vercel login && vercel --cwd apps/web" -ForegroundColor Gray
    return
  }

  Set-Location apps/web
  vercel --prod
  Set-Location ../..
  Write-Host "  ✅ Web deployed" -ForegroundColor Green
}

function Deploy-Admin {
  Write-Host "📦 Deploying Admin to Vercel..." -ForegroundColor Yellow
  if ($DryRun) {
    Write-Host "  [DRY RUN] Would deploy apps/admin to Vercel"
    return
  }

  $hasVercel = Get-Command vercel -ErrorAction SilentlyContinue
  if (-not $hasVercel) {
    Write-Host "  ⚠️ Vercel CLI not found." -ForegroundColor Yellow
    return
  }

  Set-Location apps/admin
  vercel --prod
  Set-Location ../..
  Write-Host "  ✅ Admin deployed" -ForegroundColor Green
}

# Pre-deployment checks
Write-Host "Running pre-deployment checks..." -ForegroundColor Yellow

# 1. Build check
if ($Target -eq "web" -or $Target -eq "all") {
  Write-Host "  Building web..." -ForegroundColor Yellow
  Set-Location apps/web
  npm run build 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Web build failed" -ForegroundColor Red; exit 1 }
  Write-Host "  ✅ Web build OK" -ForegroundColor Green
  Set-Location ../..
}

if ($Target -eq "admin" -or $Target -eq "all") {
  Write-Host "  Building admin..." -ForegroundColor Yellow
  Set-Location apps/admin
  npm run build 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Admin build failed" -ForegroundColor Red; exit 1 }
  Write-Host "  ✅ Admin build OK" -ForegroundColor Green
  Set-Location ../..
}

Write-Host ""

# Deploy
switch ($Target) {
  "api" { Deploy-API }
  "web" { Deploy-Web }
  "admin" { Deploy-Admin }
  "all" {
    Deploy-API
    Deploy-Web
    Deploy-Admin
  }
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan