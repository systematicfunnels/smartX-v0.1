#!/bin/bash

# Quick start script for SmartX infrastructure
# Starts all infrastructure services

echo "🚀 Starting SmartX infrastructure..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start all infrastructure services
docker-compose up -d

echo "✅ Infrastructure services started:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - MinIO: localhost:9000"
echo "  - MinIO Console: localhost:9001"
echo "  - PGAdmin: localhost:5050"
echo ""
echo "💡 To stop: docker-compose down"
echo "💡 To view logs: docker-compose logs -f"
