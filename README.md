# Infrastructure Setup Guide

This repository uses Docker Compose for local development and deployment. Below you'll find essential commands and instructions for working with the infrastructure.

## Prerequisites

- Docker and Docker Compose
- Make

## Quick Start

1. Start the development environment:
```bash
make up
```

## Common Commands

### Environment Management

- Start services: `make up` (development) or `make up ENV=production`
- Stop services: `make down`
- View logs: `make logs SERVICE=<service-name>`
- Access shell: `make shell SERVICE=<service-name>`
- Restart specific service: `make restart SERVICE=<service-name>`

### Development

- Run all tests: `make test-all`
- Run QA tests: `make run-qa-tests`
- Run QA tests in debug mode: `make run-qa-tests-debug`
- Run unit tests: `make run-unit-tests`
- Run linting: `make lint`

### Database Operations

- Access MongoDB shell: `make db-shell`

### Infrastructure (Terraform)

- Initialize Terraform: `make tf-init`
- Plan changes: `make tf-plan`
- Apply changes: `make tf-apply`
- Destroy resources: `make tf-destroy`

### Utility Commands

- List running containers: `make ps`
- Clean up Docker resources: `make prune`
- Restart all containers: `make restart-all`

## Project Structure

```
.
├── app/          # Frontend application
├── server/       # Backend server
├── qa/           # QA test suite
└── infra/        # Terraform infrastructure code
```

## Troubleshooting

1. If containers aren't starting:
   - Check logs: `make logs SERVICE=<service-name>`
   - Ensure all required environment variables are set
   - Try rebuilding: `make build`

For more detailed commands and options, run:
```bash
make help
```