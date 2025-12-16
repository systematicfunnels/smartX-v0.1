# Backend Database Migration Guide

## Overview

This guide provides comprehensive instructions for managing database migrations for the SmartX backend using Prisma.

## Current Status

- **Database Schema**: Complete (all ERD models implemented)
- **Migrations**: None created yet (initial state)
- **Migration Strategy**: Phased approach defined

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Prisma CLI

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

## Migration Phases

### Phase 1: Core Entities

**Models**: Tenant, User, UserTenant, Project, Meeting, TranscriptSegment, KnowledgeSchema

```bash
npx prisma migrate dev --name "init-core-entities"
```

### Phase 2: Documents

**Models**: Document, DocumentVersion

```bash
npx prisma migrate dev --name "add-documents"
```

### Phase 3: Code & Repositories

**Models**: Repository

```bash
npx prisma migrate dev --name "add-repositories"
```

### Phase 4: Job Orchestrator

**Models**: MasterJob, TaskJob

```bash
npx prisma migrate dev --name "add-job-orchestrator"
```

## Migration Commands

### Create a New Migration

```bash
npx prisma migrate dev --name "migration-name"
```

### Apply Migrations to Production

```bash
npx prisma migrate deploy
```

### Check Migration Status

```bash
npx prisma migrate status
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Open Prisma Studio (GUI)

```bash
npx prisma studio
```

## Data Backfill Scripts

Backfill scripts are located in `backend/scripts/` and can be run manually:

```bash
npx ts-node scripts/backfill-tenant-features.ts
```

## CI/CD Integration

The migration process is integrated with GitHub Actions. See `.github/workflows/database-migration.yml` for the workflow configuration.

## Database Schema

The current schema includes all models from the ERD:

### Core Models
- **Tenant**: Multi-tenancy support with feature flags
- **User**: User accounts and authentication
- **UserTenant**: Many-to-many relationship between users and tenants
- **Project**: Projects within tenants

### Meeting Models
- **Meeting**: Meeting metadata
- **TranscriptSegment**: Meeting transcripts
- **KnowledgeSchema**: Extracted knowledge from meetings

### Document Models
- **Document**: Document metadata
- **DocumentVersion**: Document versioning

### Code Models
- **Repository**: Code repository information

### Job Models
- **MasterJob**: Job orchestration
- **TaskJob**: Individual tasks within jobs

## Design Decisions

### Tenant Features

Instead of a separate `TENANT_FEATURE` table as shown in the ERD, features are implemented as boolean fields directly on the `Tenant` model:

```prisma
model Tenant {
  hasMeet Boolean @default(true)
  hasDoc  Boolean @default(false)
  hasCode Boolean @default(false)
}
```

**Rationale**:
- More efficient queries (no joins needed)
- Simpler data access patterns
- Atomic consistency between tenant and features
- Same functional result as separate table

### JSON Fields

Several models use JSON fields for flexible data storage:
- `KnowledgeSchema.data`
- `DocumentVersion.content`
- `Repository.data`
- `MasterJob.payload` and `result`
- `TaskJob.payload` and `result`

This provides flexibility for evolving data structures without schema changes.

## Best Practices

1. **Never modify existing fields** - only add new fields
2. **Use optional fields** for backward compatibility
3. **Create backfill scripts** for data transformations
4. **Test migrations** in staging before production
5. **Document all schema changes** in migration descriptions

## Troubleshooting

### Migration Conflicts

If you encounter migration conflicts:

```bash
# Reset migrations (development only)
npx prisma migrate reset

# Create fresh migration
npx prisma migrate dev --name "fixed-migration"
```

### Database Connection Issues

Ensure your `.env` file has the correct `DATABASE_URL` and the database server is running.

## Resources

- [Prisma Migration Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
