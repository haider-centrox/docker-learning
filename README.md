# 3-Tier Application with CI/CD Pipeline

A complete full-stack task management application demonstrating modern DevOps practices including containerization, CI/CD, monitoring, and semantic versioning.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js       │────▶│   NestJS        │────▶│   MongoDB       │
│   Frontend      │     │   Backend       │     │   Database      │
│   Port: 3000    │     │   Port: 8000    │     │   Port: 27017   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Tech Stack

- **Frontend**: Next.js 15 + TypeScript
- **Backend**: NestJS 10 + TypeScript
- **Database**: MongoDB 7.0
- **Containerization**: Docker + Docker Compose
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions

## Features

- Full CRUD task management
- Docker containerization with resource limits
- Health checks and auto-restart
- CI/CD pipelines for staging and production
- Semantic versioning with automated releases
- Email notifications for alerts and releases
- Container monitoring and alerting

## Quick Start

### Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- Node.js 20+ (for local development)

### 1. Clone and Setup

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Start Services

```bash
# Development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Access Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8000 | - |
| API Docs | http://localhost:8000/api | - |
| MongoDB | mongodb://localhost:27017 | - |
| Grafana | http://localhost:3001 | admin/admin |
| Prometheus | http://localhost:9090 | - |

### 4. Useful Commands

```bash
# View logs
docker-compose logs -f

# Check container health
docker ps

# View resource usage
docker stats

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild services
docker-compose build
docker-compose up -d
```

## Project Structure

```
learning-devops/
├── frontend/                 # Next.js application
│   ├── src/                 # Source code
│   ├── Dockerfile           # Container definition
│   └── package.json         # Dependencies
├── backend/                  # NestJS application
│   ├── src/                 # Source code
│   ├── Dockerfile           # Container definition
│   └── package.json         # Dependencies
├── docker-compose.yml       # Main orchestration
├── .github/workflows/       # CI/CD pipelines
│   ├── ci-staging.yml       # Staging pipeline
│   └── ci-main.yml          # Production pipeline
├── scripts/                 # Utility scripts
│   ├── health-check.sh      # Container monitoring
│   ├── alert.sh             # Alert notifications
│   └── release.sh           # Semantic versioning
├── monitoring/              # Monitoring configs
│   ├── prometheus.yml       # Prometheus config
│   └── grafana/             # Grafana dashboards
└── .releaserc.json          # Semantic release config
```

## CI/CD Pipeline

### Staging Pipeline

Triggered on push to `staging` branch:
1. Run frontend tests
2. Run backend tests
3. Build Docker images
4. Security scanning

### Production Pipeline

Triggered on push to `main` branch:
1. Run all tests
2. Build and push Docker images to GHCR
3. Create semantic release
4. Send email notification

### GitHub Secrets

Configure these secrets in your repository:

| Secret | Description |
|--------|-------------|
| `MONGODB_URI_STAGING` | MongoDB URI for staging |
| `MONGODB_URI_PROD` | MongoDB URI for production |
| `SMTP_SERVER` | Email server address |
| `SMTP_PORT` | SMTP port (587 for TLS) |
| `SMTP_USERNAME` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `NOTIFICATION_EMAIL` | Email for notifications |
| `GIT_EMAIL` | Git user email |
| `GIT_USERNAME` | Git username |

## Monitoring & Alerts

### Health Check Script

```bash
# Run health check manually
./scripts/health-check.sh

# Add to crontab for periodic checks
crontab -e
# Add: */5 * * * * /path/to/learning-devops/scripts/health-check.sh
```

### Manual Release

```bash
# Create a patch release
./scripts/release.sh patch

# Create a minor release
./scripts/release.sh minor

# Create a major release
./scripts/release.sh major
```

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create new task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### Request Examples

```bash
# Create a task
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project setup",
    "description": "Set up the full 3-tier application",
    "priority": "high"
  }'

# Get all tasks
curl http://localhost:8000/tasks

# Update task status
curl -X PATCH http://localhost:8000/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Delete task
curl -X DELETE http://localhost:8000/tasks/{id}
```

## Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev    # Start dev server on port 3000
npm run build  # Build for production
npm test       # Run tests
```

### Backend Development

```bash
cd backend
npm install
npm run start:dev  # Start dev server with hot reload
npm run build      # Build for production
npm test           # Run tests
```

## Troubleshooting

### Container Issues

```bash
# Check container logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb

# Restart a specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# View MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB shell
docker-compose exec mongodb mongosh
```

### Resource Limits

If containers are hitting resource limits:

```bash
# Check current resource usage
docker stats

# Edit docker-compose.yml to adjust limits
# Then restart:
docker-compose up -d
```

## License

MIT

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## Support

For issues and questions, please open a GitHub issue.
