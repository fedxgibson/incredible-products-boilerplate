# Variables
COMPOSE = docker compose
COMPOSE_DEV = docker compose -f docker-compose.yml -f docker-compose.dev.yml
APP_SERVICE = app

# Development commands
.PHONY: dev-up
dev-up:
	$(COMPOSE_DEV) up --build -d

.PHONY: dev-down
dev-down:
	$(COMPOSE_DEV) down

.PHONY: dev-logs
dev-logs:
	$(COMPOSE_DEV) logs -f

.PHONY: dev-shell
dev-shell:
	$(COMPOSE_DEV) exec $(APP_SERVICE) sh

# Production commands
.PHONY: prod-up
prod-up:
	$(COMPOSE) up --build -d

.PHONY: prod-down
prod-down:
	$(COMPOSE) down

.PHONY: prod-logs
prod-logs:
	$(COMPOSE) logs -f

.PHONY: prod-shell
prod-shell:
	$(COMPOSE) exec $(APP_SERVICE) sh

# Application commands
.PHONY: lint
lint:
	$(COMPOSE_DEV) exec $(APP_SERVICE) npm run lint

.PHONY: start
start:
	$(COMPOSE) exec $(APP_SERVICE) npm run start

# Database commands
.PHONY: db-shell
db-shell:
	$(COMPOSE_DEV) exec db psql -U ${POSTGRES_USER:-postgres} -d ${DB_NAME:-myapp}

.PHONY: db-shell-prod
db-shell-prod:
	$(COMPOSE) exec db psql -U ${POSTGRES_USER:-postgres} -d ${DB_NAME:-myapp}

.PHONY: seed
seed:
	$(COMPOSE_DEV) exec $(APP_SERVICE) npm run seed

.PHONY: db-migrate
db-migrate:
	$(COMPOSE_DEV) exec $(APP_SERVICE) npm run db:migrate

.PHONY: db-migrate-prod
db-migrate-prod:
	$(COMPOSE) exec $(APP_SERVICE) npm run db:migrate

# Terraform commands
.PHONY: tf-init
tf-init:
	cd infra && terraform init

.PHONY: tf-plan
tf-plan:
	cd infra && terraform plan

.PHONY: tf-apply
tf-apply:
	cd infra && terraform apply

.PHONY: tf-destroy
tf-destroy:
	cd infra && terraform destroy

# General commands
.PHONY: prune
prune:
	docker system prune -af --volumes

.PHONY: restart
restart:
	docker restart $$(docker ps -aq)

# Development utilities
.PHONY: ps
ps:
	docker ps

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@echo ""
	@echo "Development Environment:"
	@echo "  dev-up        : Start development environment"
	@echo "  dev-down      : Stop development environment"
	@echo "  dev-logs      : Show development logs"
	@echo "  dev-shell     : Access development shell"
	@echo ""
	@echo "Production Environment:"
	@echo "  prod-up       : Start production environment"
	@echo "  prod-down     : Stop production environment"
	@echo "  prod-logs     : Show production logs"
	@echo "  prod-shell    : Access production shell"
	@echo ""
	@echo "Application Commands:"
	@echo "  lint          : Run linter"
	@echo "  start         : Start production server"
	@echo ""
	@echo "Database Commands:"
	@echo "  db-shell      : Access development database shell"
	@echo "  db-shell-prod : Access production database shell"
	@echo "  seed          : Run database seed (development)"
	@echo "  db-migrate    : Run database migrations (development)"
	@echo "  db-migrate-prod: Run database migrations (production)"
	@echo ""
	@echo "Terraform Commands:"
	@echo "  tf-init       : Initialize Terraform"
	@echo "  tf-plan       : Plan Terraform changes"
	@echo "  tf-apply      : Apply Terraform changes"
	@echo "  tf-destroy    : Destroy Terraform resources"
	@echo ""
	@echo "Utility Commands:"
	@echo "  ps            : List running containers"
	@echo "  prune         : Clean project: stopped containers, images, network, cache, etc"
	@echo "  restart   		 : Restart all services (development)"

# Default target
.DEFAULT_GOAL := help