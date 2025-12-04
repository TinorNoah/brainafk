# Technology Stack V2 - BrainAFK Platform

*Modern, self-hosted technology stack with AI/ML capabilities, advanced security, and comprehensive monitoring.*

## 🏗️ Architecture Overview

### High-Level Architecture

```yaml
Frontend:  Remix (Current) → Astro + React Islands (Future)
Backend:   Nhost (GraphQL + Auth + Storage) + Go + Python
Database:  PostgreSQL 16+ + Redis + MeiliSearch
Security:  Fail2ban + Vault
Deploy:    Docker Compose + Traefik + Self-hosted
Monitor:   Grafana + Prometheus + Loki
```

## 🎯 Frontend Architecture

### Current Implementation

**Remix Framework**
- TypeScript with Vite build system
- Tailwind CSS for styling
- Server-side rendering (SSR)
- File-based routing

**Technology Stack**
```yaml
Framework: Remix + React
Build: Vite + TypeScript
Styling: Tailwind CSS + shadcn/ui
State: Zustand + TanStack Query
Icons: Lucide React
```

### Migration Strategy (Future)

**Static Content → Astro + React Islands**
- Portfolio, blog, landing pages
- SEO-optimized static generation
- React components for interactivity

**Interactive Apps → React + Vite**
- AI pricing dashboard
- Browser games
- Real-time applications

## ⚙️ Backend Architecture

### Nhost Unified Backend

**Core Services**
```yaml
PostgreSQL Database: Managed database with automatic backups
GraphQL API: Auto-generated from PostgreSQL schema
Authentication: JWT-based with OAuth providers
File Storage: S3-compatible with CDN integration
Real-time: GraphQL subscriptions
Admin: Hasura console for database management
```

**Features**
- Automatic API generation from database schema
- Built-in authentication and authorization
- File upload with image optimization
- Real-time subscriptions for live updates

### Go Backend Services

**High-Performance Processing**
```yaml
Framework: Go + Gin
Use Cases:
  - AI pricing calculations
  - Game logic processing
  - Background job processing
  - External API integrations
  - Performance-critical algorithms
```

### Python AI/ML Services

**Machine Learning Pipeline**
```yaml
Framework: FastAPI + Celery
Services:
  - ML model training and inference
  - Natural language processing
  - Computer vision and OCR
  - Data science pipelines
  - AI integration hub (OpenAI, Anthropic)

Key Libraries:
  - FastAPI (async web framework)
  - Celery (distributed task queue)
  - pandas/polars (data manipulation)
  - scikit-learn (machine learning)
  - transformers (Hugging Face models)
```

## 🗄️ Database Architecture

### Nhost PostgreSQL (Managed Database)

> **Note**: Nhost provides a fully managed PostgreSQL database as part of their service. No separate PostgreSQL setup required.

**Core Data**
```sql
-- Authentication (managed by Hasura Auth)
auth.users, auth.user_roles, auth.sessions

-- Application Data
user_profiles, blog_posts, projects, skills

-- Gaming Platform
games, game_sessions, leaderboards, achievements

-- AI/ML Data
ai_models, pricing_data, ml_experiments

-- Analytics
page_views, user_sessions, engagement_metrics
```

**Nhost Database Features**
- Fully managed PostgreSQL with automatic backups
- Auto-generated GraphQL API from schema
- Real-time subscriptions for live data
- Built-in row-level security (RLS)
- Database migrations via Hasura console

**Optional Extensions** (if using self-hosted PostgreSQL)
- pgvector (vector similarity search)
- TimescaleDB (time-series optimization)
- pg_stat_statements (query monitoring)

### Redis (Cache & Queue)

**Use Cases**
- Session caching
- API response caching
- Rate limiting
- Task queues (Celery)
- Real-time game state

### MeiliSearch (Search Engine)

**Features**
- Lightning-fast full-text search (<50ms)
- Typo tolerance and fuzzy matching
- Instant search-as-you-type
- Faceted search and filtering

**Indexed Content**
- Blog posts and articles
- Portfolio projects
- Learning materials
- User-generated content

## 🔐 Security & Authentication

### Nhost Authentication

**Authentication Methods**
- Email/password with verification
- Magic links (passwordless)
- Social logins (Google, GitHub, Discord)
- Multi-factor authentication (MFA)

**Security Features**
- JWT tokens with automatic refresh
- Role-based access control (RBAC)
- Session management
- Brute force protection

### Infrastructure Security

**Fail2ban (Intrusion Prevention)**
- Real-time log monitoring
- Automatic IP banning
- SSH and HTTP protection
- Custom application filters

**Vault (Secret Management)**
- Dynamic secret generation
- Encryption as a service
- Certificate authority
- API key management

> **Note**: Nhost Auth handles all application-level authentication. Additional gateway authentication (like Authelia) is unnecessary since Nhost provides comprehensive auth features including SSO, MFA, and session management.

## 📦 Deployment & Infrastructure

### Docker Compose Stack

**Core Services**
```yaml
# Reverse Proxy & SSL
traefik: Automatic HTTPS + load balancing

# Cache & Queue
redis: Multi-purpose cache and queue

# Search & AI
meilisearch: Full-text search engine
python-backend: FastAPI AI/ML services
go-backend: High-performance processing

# Nhost Stack (includes managed PostgreSQL)
nhost-backend: Complete backend with database, GraphQL, auth, storage

# Monitoring
grafana: Metrics visualization
prometheus: Metrics collection
loki: Log aggregation
```

**Security Services**
```yaml
fail2ban: Intrusion prevention
vault: Secret management
```

**Infrastructure Management**
```yaml
# Container Management
portainer: Docker container management UI
watchtower: Automatic container updates
diun: Docker image update notifications

# CI/CD & Development
gitea: Self-hosted Git service with CI/CD
registry: Private Docker registry
code-server: VS Code in browser (remote development)

# Backup & Maintenance
restic: Encrypted backup service
cleanup-scripts: Log rotation and maintenance
```

### Configuration Management

**Environment Variables**
```yaml
# Core Infrastructure
DOMAIN: Primary domain for services
POSTGRES_PASSWORD: Database password
REDIS_PASSWORD: Redis authentication
SSL_EMAIL: Let's Encrypt email

# Nhost Configuration
NHOST_HASURA_GRAPHQL_ADMIN_SECRET: Hasura admin access
NHOST_HASURA_GRAPHQL_JWT_SECRET: JWT signing key
NHOST_AUTH_SMTP_HOST: Email service

# External Services
OPENAI_API_KEY: OpenAI integration
MEILISEARCH_MASTER_KEY: Search engine access
```

## 📊 Performance Targets

### Frontend Performance

**Static Pages (Astro)**
- Lighthouse Score: 95+
- First Contentful Paint: <800ms
- Time to Interactive: <1.5s
- Bundle Size: <40KB

**Interactive Apps (React)**
- Time to Interactive: <2.5s
- JavaScript Bundle: <180KB
- API Response Time: <200ms

### Backend Performance

**API Response Times**
```yaml
GraphQL (Nhost): <50ms (simple), <150ms (complex)
Go Backend: <100ms (game logic), <300ms (pricing)
Python AI/ML: <200ms (inference), <500ms (NLP)
Search (MeiliSearch): <30ms (full-text), <50ms (faceted)
```

**Database Performance**
- PostgreSQL queries: <50ms (95th percentile)
- Redis operations: <1ms
- Cache hit ratio: >90%

## 🚀 Implementation Strategy

### Phase 1: Core Infrastructure (2-3 weeks)

**Infrastructure Setup**
- Deploy Docker Compose stack
- Configure Traefik with SSL
- Set up Redis for caching
- Deploy monitoring stack (Grafana + Prometheus + Loki)

**Infrastructure Management**
- Deploy Portainer for container management
- Set up Watchtower for automatic updates
- Configure private Docker registry
- Set up Gitea for self-hosted Git with CI/CD

**Security Implementation**
- Configure Fail2ban
- Deploy Vault
- Implement backup automation with Restic

### Phase 2: Backend Services (2-3 weeks)

**Nhost Stack**
- Deploy Nhost backend (includes PostgreSQL database)
- Configure authentication and social logins
- Set up file storage and CDN
- Create database schema

**Search Engine**
- Deploy MeiliSearch
- Configure search indexes
- Set up real-time updates

### Phase 3: AI/ML Services (3-4 weeks)

**Python Infrastructure**
- Deploy FastAPI server
- Set up Celery workers
- Configure ML pipelines
- Integrate external AI APIs

**Go Services**
- Deploy Go backend
- Implement pricing engine
- Set up game logic
- Configure caching

### Phase 4: Frontend Migration (4-6 weeks)

**Current State (Remix)**
- Optimize existing implementation
- Improve performance
- Enhance user experience

**Future Migration**
- Plan Astro + React architecture
- Implement component library
- Set up build optimization

## 🎯 Technology Advantages

### Why This Stack?

**Unified Backend (Nhost)**
- Single configuration for auth, database, and storage
- Auto-generated GraphQL API
- Real-time subscriptions
- Reduced operational overhead

**AI/ML Ready**
- Dedicated Python infrastructure
- GPU acceleration support
- Model serving and monitoring
- External AI integration

**Self-Hosted Benefits**
- Complete data control
- No vendor lock-in
- Predictable costs
- Custom optimization

**Modern Security**
- Multi-layer protection
- Automated threat response
- Compliance ready
- Zero-trust architecture

## 🛠️ Development Workflow & CI/CD

### Version Control & Git Strategy

#### Git Workflow

```yaml
Strategy: GitFlow with simplified branches
Branches:
  main: Production-ready code (auto-deploy to production)
  develop: Integration branch for features
  feature/*: Individual feature development
  hotfix/*: Critical production fixes
  release/*: Release preparation and testing

Repository Structure:
  Frontend: /app, /public, /scripts
  Backend: /backend (Go), /ai-services (Python)
  Infrastructure: /docker, /deploy, /.github
  Documentation: /docs, README.md
```

#### Git Hooks & Quality Gates

```yaml
Pre-commit Hooks:
  - Code formatting (Prettier, Black, gofmt)
  - Linting (ESLint, pylint, golangci-lint)
  - Type checking (TypeScript, mypy)
  - Security scanning (git-secrets)
  - Conventional commit format validation

Pre-push Hooks:
  - Unit test execution
  - Integration test validation
  - Docker image build verification
  - Dependency vulnerability scanning
```

### CI/CD Pipeline Architecture

#### GitHub Actions Workflow

```yaml
Trigger Events:
  - Push to main/develop branches
  - Pull request creation/updates
  - Release tag creation
  - Manual workflow dispatch
  - Scheduled security scans (weekly)

Pipeline Stages:
  1. Code Quality & Security
  2. Build & Test
  3. Container Image Build
  4. Deployment (Staging/Production)
  5. Post-deployment Verification
```

#### Detailed CI/CD Pipeline

**Stage 1: Code Quality & Security**
```yaml
Frontend Quality:
  - TypeScript compilation check
  - ESLint + Prettier validation
  - Unit tests (Vitest)
  - Component tests (React Testing Library)
  - Bundle size analysis
  - Lighthouse CI performance audit

Backend Quality:
  Go Services:
    - golangci-lint static analysis
    - Unit + integration tests
    - Race condition detection
    - Security vulnerability scanning (gosec)
    - Code coverage reporting
  
  Python Services:
    - Black code formatting validation
    - pylint + mypy static analysis
    - Unit tests (pytest)
    - Security scanning (bandit)
    - Dependency vulnerability check (safety)

Security Scanning:
  - Dependency vulnerability scanning (npm audit, go mod audit)
  - Docker image vulnerability scanning (Trivy)
  - Secret detection (git-secrets)
  - SAST scanning (CodeQL)
  - License compliance checking
```

**Stage 2: Build & Test**
```yaml
Frontend Build:
  - Install dependencies (npm ci)
  - Build production bundle (Vite)
  - Generate static assets
  - Run E2E tests (Playwright)
  - Performance testing (Lighthouse)

Backend Build:
  Go Services:
    - Dependency download and verification
    - Cross-platform binary compilation
    - Integration tests with test database
    - API contract testing
  
  Python Services:
    - Virtual environment setup
    - Dependency installation (pip)
    - ML model validation tests
    - API endpoint testing
    - Performance benchmarking

Database Testing:
  - Schema migration validation
  - Seed data insertion
  - Query performance testing
  - Data integrity checks
```

**Stage 3: Container Image Build**
```yaml
Multi-stage Docker Builds:
  Frontend:
    - Node.js build stage (dependencies + build)
    - Nginx production stage (serve static files)
    - Security hardening (non-root user)
    - Image optimization (multi-layer caching)
  
  Backend Services:
    - Go: Multi-stage (build + alpine runtime)
    - Python: Multi-stage (dependencies + slim runtime)
    - Security scanning integration
    - Image signing with Cosign
  
  Image Registry:
    - Push to GitHub Container Registry (ghcr.io)
    - Tag with commit SHA + semantic version
    - Vulnerability scanning before deployment
    - Cleanup old images (retention policy)
```

**Stage 4: Deployment Strategy**
```yaml
Staging Deployment:
  Trigger: Push to develop branch
  Environment: staging.brainafk.com
  Process:
    - Deploy to staging infrastructure
    - Run smoke tests
    - Integration tests with external services
    - Performance validation
    - Security penetration testing

Production Deployment:
  Trigger: Push to main branch or release tag
  Environment: brainafk.com
  Process:
    - Blue-green deployment strategy
    - Database migration execution
    - Service health checks
    - Gradual traffic shifting
    - Rollback capability
    - Post-deployment monitoring

Deployment Tools:
  - Docker Compose for service orchestration
  - Traefik for traffic routing and SSL
  - Health check endpoints for all services
  - Automated rollback on health check failure
```

**Stage 5: Post-deployment Verification**
```yaml
Health Checks:
  - Application health endpoints (/health, /ready)
  - Database connectivity and performance
  - External API connectivity (Nhost, OpenAI)
  - SSL certificate validation
  - Performance metrics collection

Monitoring & Alerting:
  - Application performance monitoring
  - Error rate and response time tracking
  - Resource utilization monitoring
  - Security event monitoring
  - Slack/email notifications for issues

Automated Testing:
  - Production smoke tests
  - User journey validation
  - API contract verification
  - Performance regression detection
```

### Container & Infrastructure Management

#### Docker Management Strategy

```yaml
Container Orchestration:
  Primary: Docker Compose (current scale)
  Future: Kubernetes (if scaling beyond single server)
  
Container Registry:
  - GitHub Container Registry (ghcr.io)
  - Automated image building and pushing
  - Image vulnerability scanning
  - Multi-architecture builds (AMD64, ARM64)

Image Optimization:
  - Multi-stage builds for minimal runtime images
  - Layer caching for faster builds
  - Security hardening (non-root users)
  - Regular base image updates
```

#### Infrastructure as Code

```yaml
Repository Structure:
  /deploy/
    docker-compose.yml        # Core services
    docker-compose.prod.yml   # Production overrides
    docker-compose.dev.yml    # Development overrides
    .env.example             # Environment template
    Makefile                 # Common operations
  
  /scripts/
    deploy.sh               # Deployment automation
    backup.sh              # Database backup automation
    health-check.sh         # System health validation
    cleanup.sh             # Log rotation and cleanup

Configuration Management:
  - Environment-specific configurations
  - Secret management with Docker secrets
  - Configuration validation scripts
  - Automated configuration deployment
```

#### Deployment Automation

```yaml
Makefile Commands:
  make setup          # Initial server setup
  make deploy         # Deploy latest changes
  make backup         # Create system backup
  make restore        # Restore from backup
  make logs           # View aggregated logs
  make health         # Run health checks
  make cleanup        # Clean old containers/images
  make update         # Update all services

Deployment Script Features:
  - Zero-downtime deployments
  - Automatic rollback on failure
  - Health check validation
  - Configuration validation
  - Backup creation before deployment
  - Slack notifications for deployment status
```

### Development Environment

#### Local Development Setup

```yaml
Development Tools:
  - Docker Compose for local services
  - Nhost CLI for backend development
  - VS Code with recommended extensions
  - Git hooks for code quality
  - Local testing environment

VS Code Extensions:
  - TypeScript and React support
  - Go language support
  - Python development tools
  - Docker and Docker Compose
  - GitLens for Git integration
  - Prettier for code formatting
  - ESLint for JavaScript/TypeScript
  - REST Client for API testing

Local Services:
  - Redis for caching (Docker)
  - MeiliSearch for search (Docker)
  - Local Go backend development server
  - Local Python FastAPI development server
  - Nhost local development environment
```

#### Development Workflow

```yaml
Feature Development:
  1. Create feature branch from develop
  2. Set up local development environment
  3. Implement feature with tests
  4. Run local quality checks
  5. Create pull request to develop
  6. Code review and CI validation
  7. Merge to develop for staging deployment
  8. Integration testing on staging
  9. Merge to main for production deployment

Code Review Process:
  - Automated quality checks must pass
  - At least one human reviewer approval
  - Security review for sensitive changes
  - Performance impact assessment
  - Documentation updates when needed
```

### Monitoring & Observability

#### Application Monitoring

```yaml
Metrics Collection:
  - Prometheus for system and application metrics
  - Custom metrics for business logic
  - Performance monitoring (response times, throughput)
  - Error tracking and alerting
  - Resource utilization monitoring

Log Management:
  - Structured logging (JSON format)
  - Centralized log aggregation (Loki)
  - Log retention policies
  - Error alerting based on log patterns
  - Performance analytics from logs

Distributed Tracing:
  - Request tracing across services
  - Performance bottleneck identification
  - Error propagation tracking
  - Service dependency mapping
```

#### Dashboard & Alerting

```yaml
Grafana Dashboards:
  - System health overview
  - Application performance metrics
  - Business metrics and KPIs
  - Security event monitoring
  - Infrastructure resource usage

Alerting Rules:
  - High error rates (>5% for 5 minutes)
  - Slow response times (>2s average)
  - Service down/unreachable
  - High resource utilization (>80%)
  - Security incidents
  - Failed deployments

Notification Channels:
  - Slack for team notifications
  - Email for critical alerts
  - PagerDuty for production incidents
  - SMS for emergency situations
```

**Modern Security**

## 📈 Success Metrics

**Performance**
- Page load times: <2 seconds
- API response times: <200ms
- Search results: <50ms
- Uptime: 99.9%

**Security**
- Zero successful breaches
- <1% false positive rate
- Automated threat blocking
- Regular security audits

**Development**
- Feature delivery time: 50% faster
- Bug resolution: <24 hours
- Code coverage: >80%
- Automated testing: 100%

---

**Last Updated**: June 18, 2025  
**Version**: 2.0 (Production-Ready)  
**Status**: Implementation Ready
