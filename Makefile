# =============================================================================
# AI DataHub Docker Makefile
# =============================================================================
# Usage:
#   make build          - Build all Docker images
#   make up             - Start all services
#   make down           - Stop all services
#   make logs           - View logs for all services
#   make health         - Check health status of all services
#   make clean          - Remove all containers and volumes
# =============================================================================

.PHONY: build build-base build-services up down logs health clean dev prod

# Default target
.DEFAULT_GOAL := help

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------
COMPOSE := docker-compose
COMPOSE_DEV := docker-compose -f docker-compose.yml -f docker-compose.dev.yml
SERVICES := api-gateway auth-service metadata-service data-service task-scheduler \
            ops-service integration-service admin-service sharing-service analytics-service security-service

# -----------------------------------------------------------------------------
# Help
# -----------------------------------------------------------------------------
help:
	@echo "AI DataHub Docker Commands"
	@echo ""
	@echo "Building:"
	@echo "  make build-base    Build base image (run first)"
	@echo "  make build         Build all service images"
	@echo "  make build-service SERVICE=name  Build specific service"
	@echo ""
	@echo "Running:"
	@echo "  make up            Start all services (production)"
	@echo "  make dev           Start all services (development with hot reload)"
	@echo "  make down          Stop all services"
	@echo "  make restart       Restart all services"
	@echo ""
	@echo "Monitoring:"
	@echo "  make logs          View all logs"
	@echo "  make logs-service SERVICE=name  View specific service logs"
	@echo "  make health        Check health of all services"
	@echo "  make ps            Show running containers"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean         Stop and remove all containers"
	@echo "  make clean-volumes Also remove volumes (WARNING: data loss)"
	@echo ""

# -----------------------------------------------------------------------------
# Build Commands
# -----------------------------------------------------------------------------
build-base:
	@echo "Building base image..."
	docker build -f Dockerfile.base -t ai-datahub-base:latest .

build: build-base
	@echo "Building all service images..."
	$(COMPOSE) build

build-service:
ifndef SERVICE
	@echo "Error: SERVICE not specified. Usage: make build-service SERVICE=name"
	@exit 1
endif
	@echo "Building $(SERVICE)..."
	$(COMPOSE) build $(SERVICE)

# -----------------------------------------------------------------------------
# Run Commands
# -----------------------------------------------------------------------------
up:
	@echo "Starting all services..."
	$(COMPOSE) up -d
	@echo "Waiting for services to be healthy..."
	@sleep 10
	@$(MAKE) health

dev:
	@echo "Starting development environment..."
	$(COMPOSE_DEV) up -d

down:
	@echo "Stopping all services..."
	$(COMPOSE) down

restart: down up

# -----------------------------------------------------------------------------
# Monitoring Commands
# -----------------------------------------------------------------------------
logs:
	$(COMPOSE) logs -f

logs-service:
ifndef SERVICE
	@echo "Error: SERVICE not specified. Usage: make logs-service SERVICE=name"
	@exit 1
endif
	$(COMPOSE) logs -f $(SERVICE)

health:
	@echo "Checking service health..."
	@curl -s http://localhost:3000/health | jq . 2>/dev/null || echo "API Gateway: Not healthy"
	@curl -s http://localhost:4001/health | jq . 2>/dev/null || echo "Auth Service: Not healthy"
	@curl -s http://localhost:4002/health | jq . 2>/dev/null || echo "Metadata Service: Not healthy"
	@curl -s http://localhost:4003/health | jq . 2>/dev/null || echo "Data Service: Not healthy"

ps:
	$(COMPOSE) ps

# -----------------------------------------------------------------------------
# Cleanup Commands
# -----------------------------------------------------------------------------
clean:
	@echo "Stopping and removing containers..."
	$(COMPOSE) down --remove-orphans

clean-volumes:
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	$(COMPOSE) down -v --remove-orphans

# -----------------------------------------------------------------------------
# Utility Commands
# -----------------------------------------------------------------------------
shell:
	@echo "Opening shell in API Gateway container..."
	$(COMPOSE) exec api-gateway sh

migrate:
	@echo "Running database migrations..."
	$(COMPOSE) exec auth-service npm run migrate

# -----------------------------------------------------------------------------
# Development Utilities
# -----------------------------------------------------------------------------
install:
	npm ci

build-local:
	npm run build

test:
	npm run test

lint:
	npm run lint