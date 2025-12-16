#!/bin/bash

# SmartX Infrastructure Setup Script
# Sets up PostgreSQL, Redis, and MinIO for local development

echo "🚀 Starting SmartX infrastructure setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start infrastructure containers
echo "📦 Starting infrastructure containers..."
docker-compose up -d postgres redis minio

# Wait for services to be healthy
echo "⏳ Waiting for services to initialize..."

# Wait for PostgreSQL
echo "🐬 Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker exec smartx-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start"
        exit 1
    fi
done

# Wait for Redis
echo "🔴 Waiting for Redis..."
for i in {1..30}; do
    if docker exec smartx-redis redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis is ready"
        break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        echo "❌ Redis failed to start"
        exit 1
    fi
done

# Wait for MinIO
echo "📦 Waiting for MinIO..."
for i in {1..30}; do
    if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
        echo "✅ MinIO is ready"
        break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        echo "❌ MinIO failed to start"
        exit 1
    fi
done

# Set up MinIO bucket
echo "📂 Setting up MinIO bucket..."
docker run --rm --network smartx-network -v $(pwd)/backend/.env:/app/.env -e MINIO_ENDPOINT=minio:9000 -e MINIO_ACCESS_KEY=minioadmin -e MINIO_SECRET_KEY=minioadmin minio/mc:latest \
    mb minio/smartx-files || echo "Bucket may already exist"

# Run Prisma migrations
echo "🐬 Running Prisma migrations..."
cd backend
npx prisma migrate dev --name "init" || echo "Migrations may already be applied"

# Seed initial data
echo "🌱 Seeding initial data..."
cd ..
node backend/scripts/backfill-tenant-features.js || echo "Seeding completed or already done"

echo "🎉 Infrastructure setup complete!"
echo ""
echo "📊 Services running:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - MinIO: localhost:9000"
echo "  - MinIO Console: localhost:9001"
echo "  - PGAdmin: localhost:5050"
echo ""
echo "💡 To stop infrastructure: docker-compose down"
