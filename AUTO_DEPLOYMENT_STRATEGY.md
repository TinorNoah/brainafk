# Auto-Deployment Strategy for Nhost-Centric Platform Stack

## Overview

This document outlines a comprehensive auto-deployment strategy for the simplified Nhost-centric platform stack, designed for self-hosted Ubuntu server deployment with 20GB RAM and 200GB storage.

## Architecture Components

### Core Services
1. **Frontend**: Astro + React Islands + Standalone React Apps
2. **Backend**: Nhost (PostgreSQL + GraphQL + Auth + Storage) + Go microservices
3. **Infrastructure**: Traefik reverse proxy, Redis cache
4. **Monitoring**: Grafana + Prometheus

## 1. Repository Structure & Branching Strategy

### Monorepo Structure
```
brainafk/
├── apps/
│   ├── portfolio/          # Astro main site
│   ├── ai-dashboard/      # React AI pricing dashboard
│   ├── games/             # Browser games
│   ├── blog/              # Blog platform
│   └── tools/             # Utility tools
├── services/
│   ├── api-gateway/       # Go API gateway
│   ├── pricing-service/   # Go pricing microservice
│   ├── analytics-service/ # Go analytics service
│   └── notification-service/ # Go notification service
├── infrastructure/
│   ├── docker/            # Docker configurations
│   ├── traefik/          # Traefik configuration
│   ├── nhost/            # Nhost configuration
│   └── monitoring/       # Grafana/Prometheus setup
├── scripts/
│   ├── deploy/           # Deployment scripts
│   ├── migrate/          # Database migration scripts
│   └── backup/           # Backup scripts
└── .github/
    └── workflows/        # GitHub Actions CI/CD
```

### Branching Strategy
- **main**: Production-ready code
- **develop**: Integration branch for development
- **feature/***: Feature development branches
- **hotfix/***: Emergency production fixes
- **release/***: Release preparation branches

## 2. CI/CD Pipeline Configuration

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Platform Stack

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  REGISTRY_USER: ${{ github.actor }}
  REGISTRY_PASSWORD: ${{ secrets.GITHUB_TOKEN }}

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.changes.outputs.frontend }}
      backend: ${{ steps.changes.outputs.backend }}
      infrastructure: ${{ steps.changes.outputs.infrastructure }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            frontend:
              - 'apps/**'
            backend:
              - 'services/**'
            infrastructure:
              - 'infrastructure/**'

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: |
          npm run test:frontend
          npm run test:backend

  build-frontend:
    needs: [changes, test]
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [portfolio, ai-dashboard, games, blog, tools]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Build ${{ matrix.app }}
        run: |
          cd apps/${{ matrix.app }}
          npm ci
          npm run build
      - name: Build Docker image
        run: |
          docker build -t ${{ env.REGISTRY }}/brainafk-${{ matrix.app }}:${{ github.sha }} \
            -f apps/${{ matrix.app }}/Dockerfile .
      - name: Push Docker image
        if: github.ref == 'refs/heads/main'
        run: |
          echo ${{ env.REGISTRY_PASSWORD }} | docker login ${{ env.REGISTRY }} -u ${{ env.REGISTRY_USER }} --password-stdin
          docker push ${{ env.REGISTRY }}/brainafk-${{ matrix.app }}:${{ github.sha }}

  build-backend:
    needs: [changes, test]
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, pricing-service, analytics-service, notification-service]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - name: Build ${{ matrix.service }}
        run: |
          cd services/${{ matrix.service }}
          go mod download
          go build -o bin/${{ matrix.service }} ./cmd
      - name: Build Docker image
        run: |
          docker build -t ${{ env.REGISTRY }}/brainafk-${{ matrix.service }}:${{ github.sha }} \
            -f services/${{ matrix.service }}/Dockerfile .
      - name: Push Docker image
        if: github.ref == 'refs/heads/main'
        run: |
          echo ${{ env.REGISTRY_PASSWORD }} | docker login ${{ env.REGISTRY }} -u ${{ env.REGISTRY_USER }} --password-stdin
          docker push ${{ env.REGISTRY }}/brainafk-${{ matrix.service }}:${{ github.sha }}

  deploy:
    needs: [build-frontend, build-backend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/brainafk
            git pull origin main
            export IMAGE_TAG=${{ github.sha }}
            ./scripts/deploy/production.sh
```

## 3. Docker Containerization Strategy

### Multi-Stage Dockerfile for Astro Apps

```dockerfile
# apps/portfolio/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY apps/portfolio/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Go Service Dockerfile

```dockerfile
# services/api-gateway/Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/api-gateway ./cmd

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/
COPY --from=builder /app/bin/api-gateway .
COPY --from=builder /app/config ./config
EXPOSE 8080
CMD ["./api-gateway"]
```

## 4. Production Docker Compose Configuration

```yaml
# infrastructure/docker/production.yml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    command:
      - --api.dashboard=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --providers.docker=true
      - --providers.file.directory=/etc/traefik/dynamic
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
      - --certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/dynamic:/etc/traefik/dynamic:ro
      - ./letsencrypt:/letsencrypt
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.${DOMAIN}`)"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"

  # Frontend Applications
  portfolio:
    image: ghcr.io/brainafk-portfolio:${IMAGE_TAG:-latest}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portfolio.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.portfolio.tls.certresolver=letsencrypt"
      - "traefik.http.services.portfolio.loadbalancer.server.port=80"

  ai-dashboard:
    image: ghcr.io/brainafk-ai-dashboard:${IMAGE_TAG:-latest}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ai-dashboard.rule=Host(`ai.${DOMAIN}`)"
      - "traefik.http.routers.ai-dashboard.tls.certresolver=letsencrypt"

  games:
    image: ghcr.io/brainafk-games:${IMAGE_TAG:-latest}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.games.rule=Host(`games.${DOMAIN}`)"
      - "traefik.http.routers.games.tls.certresolver=letsencrypt"

  # Backend Services
  api-gateway:
    image: ghcr.io/brainafk-api-gateway:${IMAGE_TAG:-latest}
    environment:
      - NHOST_BACKEND_URL=${NHOST_BACKEND_URL}
      - NHOST_ADMIN_SECRET=${NHOST_ADMIN_SECRET}
      - REDIS_URL=redis://redis:6379
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.${DOMAIN}`)"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=8080"

  pricing-service:
    image: ghcr.io/brainafk-pricing-service:${IMAGE_TAG:-latest}
    environment:
      - NHOST_BACKEND_URL=${NHOST_BACKEND_URL}
      - NHOST_ADMIN_SECRET=${NHOST_ADMIN_SECRET}
      - REDIS_URL=redis://redis:6379

  # Infrastructure
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # Nhost Services
  nhost-postgres:
    image: nhost/postgres:14.6-20230312-1
    environment:
      POSTGRES_PASSWORD: ${NHOST_POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  nhost-hasura:
    image: hasura/graphql-engine:v2.30.0
    depends_on:
      - nhost-postgres
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:${NHOST_POSTGRES_PASSWORD}@nhost-postgres:5432/postgres
      HASURA_GRAPHQL_ADMIN_SECRET: ${NHOST_ADMIN_SECRET}
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_JWT_SECRET: ${NHOST_JWT_SECRET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.hasura.rule=Host(`hasura.${DOMAIN}`)"
      - "traefik.http.routers.hasura.tls.certresolver=letsencrypt"
      - "traefik.http.services.hasura.loadbalancer.server.port=8080"

  nhost-auth:
    image: nhost/hasura-auth:0.21.2
    depends_on:
      - nhost-postgres
      - nhost-hasura
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:${NHOST_POSTGRES_PASSWORD}@nhost-postgres:5432/postgres
      HASURA_GRAPHQL_ADMIN_SECRET: ${NHOST_ADMIN_SECRET}
      HASURA_GRAPHQL_JWT_SECRET: ${NHOST_JWT_SECRET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.auth.rule=Host(`auth.${DOMAIN}`)"
      - "traefik.http.routers.auth.tls.certresolver=letsencrypt"

  nhost-storage:
    image: nhost/hasura-storage:0.6.0
    depends_on:
      - nhost-postgres
      - nhost-hasura
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:${NHOST_POSTGRES_PASSWORD}@nhost-postgres:5432/postgres
      HASURA_GRAPHQL_ADMIN_SECRET: ${NHOST_ADMIN_SECRET}
    volumes:
      - storage_data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.storage.rule=Host(`storage.${DOMAIN}`)"
      - "traefik.http.routers.storage.tls.certresolver=letsencrypt"

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`monitoring.${DOMAIN}`)"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"

volumes:
  postgres_data:
  redis_data:
  storage_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    external: true
    name: brainafk-network
```

## 5. Deployment Scripts

### Production Deployment Script

```bash
#!/bin/bash
# scripts/deploy/production.sh

set -e

echo "🚀 Starting production deployment..."

# Load environment variables
source .env.production

# Create network if it doesn't exist
docker network create brainafk-network 2>/dev/null || true

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose -f infrastructure/docker/production.yml pull

# Run database migrations
echo "🗄️ Running database migrations..."
./scripts/migrate/run-migrations.sh

# Deploy with zero downtime
echo "🔄 Deploying services..."
docker-compose -f infrastructure/docker/production.yml up -d --remove-orphans

# Health checks
echo "🏥 Running health checks..."
./scripts/deploy/health-check.sh

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
```

### Health Check Script

```bash
#!/bin/bash
# scripts/deploy/health-check.sh

DOMAIN=${DOMAIN:-brainafk.com}
TIMEOUT=300
INTERVAL=10

check_service() {
    local service=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo "Checking $service at $url..."
    
    for i in $(seq 1 $((TIMEOUT/INTERVAL))); do
        if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_code"; then
            echo "✅ $service is healthy"
            return 0
        fi
        echo "⏳ Waiting for $service... (attempt $i)"
        sleep $INTERVAL
    done
    
    echo "❌ $service health check failed"
    return 1
}

# Check all services
check_service "Portfolio" "https://$DOMAIN"
check_service "AI Dashboard" "https://ai.$DOMAIN"
check_service "Games" "https://games.$DOMAIN"
check_service "API Gateway" "https://api.$DOMAIN/health"
check_service "Hasura" "https://hasura.$DOMAIN/healthz"
check_service "Auth" "https://auth.$DOMAIN/healthz"

echo "🎉 All services are healthy!"
```

## 6. Database Migration Strategy

### Migration Script

```bash
#!/bin/bash
# scripts/migrate/run-migrations.sh

set -e

echo "🗄️ Running database migrations..."

# Wait for database to be ready
until docker-compose -f infrastructure/docker/production.yml exec -T nhost-postgres pg_isready -U postgres; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

# Run Hasura migrations
echo "📊 Applying Hasura migrations..."
hasura migrate apply --database-name default --endpoint "https://hasura.$DOMAIN"
hasura metadata apply --endpoint "https://hasura.$DOMAIN"

# Run custom SQL migrations
echo "🔧 Running custom migrations..."
for migration in scripts/migrate/sql/*.sql; do
    if [ -f "$migration" ]; then
        echo "Applying $(basename "$migration")..."
        docker-compose -f infrastructure/docker/production.yml exec -T nhost-postgres \
            psql -U postgres -d postgres -f /dev/stdin < "$migration"
    fi
done

echo "✅ All migrations completed!"
```

## 7. Environment Management

### Environment Variables Template

```bash
# .env.production
DOMAIN=brainafk.com
ACME_EMAIL=admin@brainafk.com
IMAGE_TAG=latest

# Nhost Configuration
NHOST_BACKEND_URL=https://hasura.brainafk.com
NHOST_POSTGRES_PASSWORD=your_secure_postgres_password
NHOST_ADMIN_SECRET=your_secure_admin_secret
NHOST_JWT_SECRET={"type":"HS256","key":"your_jwt_secret_key_here"}

# Monitoring
GRAFANA_PASSWORD=your_secure_grafana_password

# External APIs
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

## 8. Backup and Disaster Recovery

### Automated Backup Script

```bash
#!/bin/bash
# scripts/backup/backup.sh

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
echo "📀 Backing up PostgreSQL database..."
docker-compose -f infrastructure/docker/production.yml exec -T nhost-postgres \
    pg_dump -U postgres postgres | gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# File storage backup
echo "📁 Backing up file storage..."
tar -czf "$BACKUP_DIR/storage_$DATE.tar.gz" -C /opt/brainafk/storage .

# Configuration backup
echo "⚙️ Backing up configuration..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    -C /opt/brainafk \
    .env.production \
    infrastructure/traefik \
    infrastructure/monitoring

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

echo "✅ Backup completed: $DATE"
```

## 9. Monitoring and Alerting

### Prometheus Configuration

```yaml
# infrastructure/monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8080']

  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:8080']

  - job_name: 'pricing-service'
    static_configs:
      - targets: ['pricing-service:8080']

  - job_name: 'postgres'
    static_configs:
      - targets: ['nhost-postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

## 10. Security Considerations

### Security Checklist
- [ ] SSL/TLS certificates automatically renewed via Let's Encrypt
- [ ] Environment variables stored securely (not in git)
- [ ] Database access restricted to application services
- [ ] Regular security updates via automated patching
- [ ] Network isolation between services
- [ ] Rate limiting configured on API endpoints
- [ ] CORS policies properly configured
- [ ] Regular backup testing and restoration procedures

## 11. Rollback Strategy

### Quick Rollback Script

```bash
#!/bin/bash
# scripts/deploy/rollback.sh

PREVIOUS_TAG=$1

if [ -z "$PREVIOUS_TAG" ]; then
    echo "Usage: $0 <previous_image_tag>"
    exit 1
fi

echo "🔄 Rolling back to $PREVIOUS_TAG..."

export IMAGE_TAG=$PREVIOUS_TAG
docker-compose -f infrastructure/docker/production.yml up -d

echo "🏥 Running health checks..."
./scripts/deploy/health-check.sh

echo "✅ Rollback completed!"
```

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
1. Set up CI/CD pipeline
2. Configure Docker containerization
3. Implement basic deployment scripts

### Phase 2: Core Services (Week 3-4)
1. Deploy Nhost stack
2. Set up Traefik reverse proxy
3. Configure monitoring stack

### Phase 3: Applications (Week 5-6)
1. Deploy frontend applications
2. Deploy Go backend services
3. Implement health checks

### Phase 4: Optimization (Week 7-8)
1. Fine-tune performance
2. Implement advanced monitoring
3. Set up alerting and backup strategies

This comprehensive auto-deployment strategy provides a robust, scalable foundation for your Nhost-centric platform stack with automated CI/CD, monitoring, and disaster recovery capabilities.
