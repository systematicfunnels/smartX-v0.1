# SmartX Monorepo

A comprehensive AI-powered knowledge management platform with multi-tenancy support.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure
pnpm run infra:up

# Run database migrations
pnpm run db:migrate

# Start development
pnpm run dev
```

## 📂 Monorepo Structure

```bash
/smartX-monorepo
├── apps/
│   ├── smartmeet/          # Next.js app (port 3001)
│   ├── smartdoc/           # Next.js app (port 3002)
│   ├── smartcode/          # Next.js app (port 3003)
│   └── api/                # Next.js API backend (port 3000)
│
├── backend/
│   ├── orchestrator/       # Job orchestration service
│   └── workers/            # AI worker services
│       ├── transcription/
│       ├── meaning/
│       ├── docgen/
│       └── codegen/
│
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── types/              # TypeScript types
│   ├── db/                 # Database client
│   ├── prompts/            # AI prompt templates
│   └── api-client/         # API client library
│
├── infra/
│   ├── docker/             # Docker configurations
│   └── terraform/          # Production infrastructure
│
├── prisma/
│   └── schema.prisma       # Database schema
│
└── .github/
    └── workflows/         # CI/CD pipelines
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each app/backend directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartx"

# Redis
REDIS_URL="redis://localhost:6379"

# MinIO
MINIO_ENDPOINT="localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

### Infrastructure

```bash
# Start all services
docker-compose up -d

# Access services:
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - MinIO: localhost:9000
# - PGAdmin: localhost:5050
```

## 📦 Apps

### SmartMeet
Meeting intelligence platform with transcription and knowledge extraction.

### SmartDoc
Document generation and management system.

### SmartCode
AI-powered code scaffolding and repository analysis.

### API
Central API backend with tenant isolation and job orchestration.

## 🎯 Features

- **Multi-tenancy**: Complete tenant isolation
- **Job Orchestration**: AI workflow management
- **Retention Policies**: Automated data cleanup
- **File Storage**: MinIO/S3 integration
- **Queue System**: Redis-based task processing
- **Knowledge Schema**: Unified knowledge representation

## 🔄 Workflow

1. **Upload**: Documents, meetings, or code
2. **Process**: AI workers extract knowledge
3. **Store**: Results in unified knowledge schema
4. **Retrieve**: Access through specialized apps
5. **Manage**: Retention policies handle cleanup

## 🛠️ Development

```bash
# Run specific app
pnpm --filter smartmeet dev

# Build all apps
pnpm run build

# Run tests
pnpm run test

# Format code
pnpm run format
```

## 🚀 Production

```bash
# Build for production
pnpm run build:prod

# Start production server
pnpm run start:prod
```

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing](docs/contributing.md)
