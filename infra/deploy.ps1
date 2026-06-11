param(
  [ValidateSet("api", "web", "admin", "all")]
  [string]$Target = "all",
  [switch]$DryRun
)

Write-Host "=== Recap Home Deployment ===" -ForegroundColor Cyan

$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Host "⚠️ Uncommitted changes detected:" -ForegroundColor Yellow
  Write-Host $gitStatus
  $confirm = Read-Host "Continue? (yes/no)"
  if ($confirm -ne "yes") { exit 0 }
}

function Deploy-API {
  Write-Host "📦 Deploying API to Railway..." -ForegroundColor Yellow
  if ($DryRun) { Write-Host "  [DRY RUN] Would deploy apps/api to Railway"; return }

  $hasRailway = Get-Command railway -ErrorAction SilentlyContinue
  if (-not $hasRailway) {
    Write-Host "  ⚠️ Railway CLI not found. Install: npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "  Then: railway login && railway link"
    return
  }

  Push-Location apps/api
  railway up --detach
  railway run npx prisma migrate deploy
  Pop-Location
  Write-Host "  ✅ API deployed" -ForegroundColor Green
}

function Deploy-Web {
  Write-Host "📦 Deploying Web to Vercel..." -ForegroundColor Yellow
  if ($DryRun) { Write-Host "  [DRY RUN] Would deploy apps/web to Vercel"; return }

  $hasVercel = Get-Command vercel -ErrorAction SilentlyContinue
  if (-not $hasVercel) {
    Write-Host "  ⚠️ Vercel CLI not found. Install: npm install -g vercel" -ForegroundColor Yellow
    Write-Host "  Then: vercel login"
    return
  }

  Push-Location apps/web
  vercel --prod
  Pop-Location
  Write-Host "  ✅ Web deployed" -ForegroundColor Green
}

function Deploy-Admin {
  Write-Host "📦 Deploying Admin to Vercel..." -ForegroundColor Yellow
  if ($DryRun) { Write-Host "  [DRY RUN] Would deploy apps/admin to Vercel"; return }

  $hasVercel = Get-Command vercel -ErrorAction SilentlyContinue
  if (-not $hasVercel) { Write-Host "  ⚠️ Vercel CLI not found." -ForegroundColor Yellow; return }

  Push-Location apps/admin
  vercel --prod
  Pop-Location
  Write-Host "  ✅ Admin deployed" -ForegroundColor Green
}

# Build checks
Write-Host "Running pre-deployment checks..." -ForegroundColor Yellow

if ($Target -eq "web" -or $Target -eq "all") {
  Write-Host "  Building web..." -ForegroundColor Yellow
  Push-Location apps/web
  $build = npm run build 2>&1
  if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Web build failed" -ForegroundColor Red; Pop-Location; exit 1 }
  Pop-Location
  Write-Host "  ✅ Web build OK" -ForegroundColor Green
}

if ($Target -eq "admin" -or $Target -eq "all") {
  Write-Host "  Building admin..." -ForegroundColor Yellow
  Push-Location apps/admin
  npm run build 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Admin build failed" -ForegroundColor Red; Pop-Location; exit 1 }
  Pop-Location
  Write-Host "  ✅ Admin build OK" -ForegroundColor Green
}

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

Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
