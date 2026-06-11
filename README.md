# Recap Home

A fully functional, open-source, delivery/logistics platform with real-time tracking, multi-role users, and an AI chatbot.

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript), shadcn/ui, Tailwind CSS, Leaflet, Socket.io
- **Backend**: Express.js (TypeScript), Prisma (PostgreSQL), Redis, Socket.io
- **AI**: Mistral AI API (free tier)
- **DevOps**: Docker, Railway, Vercel, GitHub

## Project Structure

```
recap-home/
├── apps/
│   ├── web/               # Next.js frontend (users, riders, businesses)
│   ├── admin/             # Next.js admin dashboard
│   ├── api/               # Express.js backend
│   └── chatbot/           # Node.js AI chatbot service
├── packages/
│   ├── database/          # Prisma schema + migrations
│   ├── ui/                # Shared UI components
│   └── shared/            # Shared types/utilities
├── infra/                 # Infrastructure management scripts
├── docker-compose.yml     # Local Postgres + Redis
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop (for local Postgres/Redis)
- Git

### Setup

```powershell
# Clone and install
git clone <repo-url> && cd recap-home
npm install

# Start infrastructure
docker-compose up -d

# Setup database
cd packages/database
$env:DATABASE_URL="postgresql://recap:recap123@localhost:5432/recap_home?schema=public"
npx prisma migrate dev --name init
cd ../..

# Start all services
npm run dev
```

Or use the management tool:

```powershell
.\infra\setup.ps1          # Full setup
.\infra\manage.psi status  # Check status
.\infra\manage.psi start   # Start all services
.\infra\manage.psi stop    # Stop all services
```

### Services

| Service | URL | Port |
|---------|-----|------|
| Web App | http://localhost:3000 | 3000 |
| Admin Panel | http://localhost:3002 | 3002 |
| API | http://localhost:3001 | 3001 |
| PostgreSQL | localhost | 5432 |
| Redis | localhost | 6379 |

## Features

- Multi-role user system (Private, Rider, Business, Developer, Admin, etc.)
- Order creation, tracking, and management
- Real-time rider assignment
- Live map tracking with Leaflet
- AI chatbot for support (Mistral API)
- Admin dashboard for system management
- Infrastructure management scripts

## Environment Variables

Copy `.env.example` to `.env` in each app directory and fill in the values.

## Deployment

### Backend (Railway)

```powershell
railway login
railway link
railway up
```

### Frontend (Vercel)

```powershell
vercel --cwd apps/web --prod
vercel --cwd apps/admin --prod
```

Or use the deploy script:

```powershell
.\infra\deploy.ps1 all
```