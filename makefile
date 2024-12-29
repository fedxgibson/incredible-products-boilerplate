# Variables
COMPOSE_DEV = docker compose -f docker-compose.base.yml -f docker-compose.dev.yml
COMPOSE_PROD = docker compose -f docker-compose.base.yml -f docker-compose.prod.yml

# Development commands
dev-up:
	$(COMPOSE_DEV) up -d

dev-down:
	$(COMPOSE_DEV) down

dev-logs:
	$(COMPOSE_DEV) logs -f

dev-shell:
	$(COMPOSE_DEV) exec app sh

# Production commands
prod-up:
	$(COMPOSE_PROD) up -d

prod-down:
	$(COMPOSE_PROD) down

prod-logs:
	$(COMPOSE_PROD) logs -f

prod-shell:
	$(COMPOSE_PROD) exec app sh

# Next.js commands
dev:
	$(COMPOSE_DEV) exec app npm run dev

build:
	$(COMPOSE_DEV) exec app npm run build

lint:
	$(COMPOSE_DEV) exec app npm run lint

start:
	$(COMPOSE_PROD) exec app npm run start

# Database commands
db-shell:
	$(COMPOSE_PROD) exec db psql -U postgres -d myapp

seed:
	$(COMPOSE_DEV) exec app npm run seed

db-migrate:
	$(COMPOSE_DEV) exec app npm run db:migrate

db-studio:
	$(COMPOSE_DEV) exec app npm run db:studio

postinstall:
	$(COMPOSE_DEV) exec app npm run postinstall

# Terraform commands
tf-init:
	cd infra && terraform init

tf-plan:
	cd infra && terraform plan

tf-apply:
	cd infra && terraform apply

tf-destroy:
	cd infra && terraform destroy

# General commands
clean:
	docker compose down -v --rmi all

restart:
	$(COMPOSE_PROD) restart

# Help
help:
	@echo "Available commands:"
	@echo ""
	@echo "Docker Environment:"
	@echo "  dev-up      : Start development environment"
	@echo "  dev-down    : Stop development environment"
	@echo "  dev-logs    : Show development logs"
	@echo "  dev-shell   : Access development app shell"
	@echo "  prod-up     : Start production environment"
	@echo "  prod-down   : Stop production environment"
	@echo "  prod-logs   : Show production logs"
	@echo "  prod-shell  : Access production app shell"
	@echo ""
	@echo "Next.js Commands:"
	@echo "  dev         : Run Next.js development server"
	@echo "  build       : Build Next.js application"
	@echo "  lint        : Run linter"
	@echo "  start       : Start production server"
	@echo ""
	@echo "Database Commands:"
	@echo "  db-shell    : Access database shell"
	@echo "  seed        : Run database seed"
	@