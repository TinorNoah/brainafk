# Quick Setup Guide for Auto-Deployment

This guide will help you set up the auto-deployment system for your Nhost-centric platform stack.

## Prerequisites

1. **Ubuntu Server** (20GB RAM, 200GB storage)
2. **Docker & Docker Compose** installed
3. **Git** installed
4. **Domain name** configured with DNS pointing to your server
5. **GitHub repository** with your code

## Initial Server Setup

### 1. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Install Hasura CLI (for migrations)
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
```

### 2. Clone Your Repository

```bash
# Create application directory
sudo mkdir -p /opt/brainafk
sudo chown $USER:$USER /opt/brainafk

# Clone repository
cd /opt/brainafk
git clone https://github.com/yourusername/brainafk.git .
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.production.template .env.production

# Edit with your actual values
nano .env.production
```

**Important:** Update these values in `.env.production`:
- `DOMAIN=your-domain.com`
- `ACME_EMAIL=your-email@domain.com`
- `NHOST_POSTGRES_PASSWORD=your-secure-password`
- `NHOST_ADMIN_SECRET=your-secure-admin-secret`
- `NHOST_JWT_SECRET=your-jwt-secret`

### 4. Set Up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

- `PRODUCTION_HOST`: Your server IP address
- `PRODUCTION_USER`: SSH username (usually `ubuntu` or your username)
- `SSH_PRIVATE_KEY`: Your SSH private key content

### 5. Initial Deployment

```bash
# Make scripts executable
chmod +x scripts/deploy/*.sh

# Run initial deployment
./scripts/deploy/production.sh
```

## GitHub Actions Setup

The CI/CD pipeline is already configured in `.github/workflows/deploy.yml`. It will:

1. **Detect changes** in frontend, backend, or infrastructure
2. **Run tests** for all components
3. **Build Docker images** for changed components
4. **Push images** to GitHub Container Registry
5. **Deploy** to production server via SSH

### Triggering Deployments

- **Automatic**: Push to `main` branch triggers production deployment
- **Manual**: Use GitHub Actions interface to trigger deployment
- **Rollback**: Use the rollback script if needed

## Directory Structure

After setup, your server will have:

```
/opt/brainafk/
├── apps/                  # Frontend applications
├── services/              # Go backend services
├── infrastructure/        # Docker & Traefik configs
├── scripts/              # Deployment scripts
├── .env.production       # Environment variables
└── docker-compose files  # Service orchestration
```

## Monitoring Setup

Access your monitoring services:

- **Traefik Dashboard**: `https://traefik.your-domain.com:8080`
- **Grafana**: `https://monitoring.your-domain.com`
- **Hasura Console**: `https://hasura.your-domain.com`

## Common Commands

```bash
# Check service status
docker-compose -f infrastructure/docker/production.yml ps

# View logs
docker-compose -f infrastructure/docker/production.yml logs -f

# Restart a service
docker-compose -f infrastructure/docker/production.yml restart service-name

# Run health checks
./scripts/deploy/health-check.sh

# Rollback to previous version
./scripts/deploy/rollback.sh <image-tag>
```

## Troubleshooting

### SSL Certificate Issues
```bash
# Check Traefik logs
docker logs traefik

# Manually request certificate
docker exec traefik traefik acme --help
```

### Database Connection Issues
```bash
# Check PostgreSQL logs
docker-compose -f infrastructure/docker/production.yml logs nhost-postgres

# Test database connection
docker exec -it nhost-postgres psql -U postgres
```

### Service Not Starting
```bash
# Check specific service logs
docker-compose -f infrastructure/docker/production.yml logs service-name

# Restart all services
docker-compose -f infrastructure/docker/production.yml down
docker-compose -f infrastructure/docker/production.yml up -d
```

## Security Notes

1. **Firewall**: Configure UFW to only allow necessary ports (80, 443, 22)
2. **SSH**: Disable password authentication, use key-based auth only
3. **Updates**: Set up automatic security updates
4. **Backups**: The system includes automated database and file backups
5. **Secrets**: Never commit `.env.production` to git

## Next Steps

1. Set up DNS records for all subdomains
2. Configure your first application in the `apps/` directory
3. Set up monitoring alerts
4. Test the rollback procedure
5. Schedule regular backups to external storage

For detailed information, see the main `AUTO_DEPLOYMENT_STRATEGY.md` document.
