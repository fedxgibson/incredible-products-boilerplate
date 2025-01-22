# Provider configuration
terraform {
  required_version = ">= 1.0.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

# Configure the DigitalOcean Provider
provider "digitalocean" {}

# Variables
variable "app_name" {
  description = "Name of your application"
  type        = string
  default     = "webapp"
}

variable "region" {
  description = "Region to deploy the application"
  type        = string
  default     = "nyc1"
}

variable "jwt_secret" {
  description = "JWT Secret for authentication"
  type        = string
  sensitive   = true
}

variable "github_repo" {
  description = "GitHub repository (format: username/repo)"
  type        = string
}

# MongoDB Database Cluster
resource "digitalocean_database_cluster" "mongodb" {
  name       = "${var.app_name}-mongodb"
  engine     = "mongodb"
  version    = "6"
  size       = "db-s-1vcpu-1gb"
  region     = var.region
  node_count = 1

  maintenance_window {
    day  = "sunday"
    hour = "02:00:00"
  }
}

# MongoDB Database
resource "digitalocean_database_db" "mongodb_app" {
  cluster_id = digitalocean_database_cluster.mongodb.id
  name       = "app"
}

# MongoDB User
resource "digitalocean_database_user" "mongodb_user" {
  cluster_id = digitalocean_database_cluster.mongodb.id
  name       = "${var.app_name}_user"
}

# App Configuration
resource "digitalocean_app" "webapp" {
  spec {
    name   = var.app_name
    region = var.region

    # Frontend Service (webapp)
    service {
      name               = "webapp"
      instance_size_slug = "basic-xxs"
      instance_count     = 1

      github {
        repo           = var.github_repo
        branch         = "main"
        deploy_on_push = true
      }

      source_dir = "webapp"
      dockerfile_path = "webapp/Dockerfile"

      http_port = 3000

      health_check {
        http_path = "/login"
        port      = 3000
        timeout_seconds = 10
        period_seconds  = 30
        failure_threshold = 3
        initial_delay_seconds = 20
      }

      env {
        key   = "NODE_ENV"
        value = "production"
      }

      env {
        key   = "JWT_SECRET"
        value = var.jwt_secret
        type  = "SECRET"
      }

      env {
        key   = "API_URL"
        value = "https://${var.app_name}.ondigitalocean.app/api/v1"
      }
    }

    # Backend Service (server)
    service {
      name               = "server"
      instance_size_slug = "basic-xxs"
      instance_count     = 1

      github {
        repo           = var.github_repo
        branch         = "main"
        deploy_on_push = true
      }

      source_dir = "server"
      dockerfile_path = "server/Dockerfile"

      http_port = 3001

      health_check {
        http_path = "/health"
        port      = 3001
        timeout_seconds = 10
        period_seconds  = 30
        failure_threshold = 3
        initial_delay_seconds = 20
      }

      env {
        key   = "NODE_ENV"
        value = "production"
      }

      env {
        key   = "PORT"
        value = "3001"
      }

      env {
        key   = "ORIGIN"
        value = "https://${var.app_name}.ondigitalocean.app"
      }

      env {
        key   = "HOST"
        value = "0.0.0.0"
      }

      env {
        key   = "MONGO_URI"
        value = digitalocean_database_cluster.mongodb.uri
        type  = "SECRET"
      }

      env {
        key   = "MONGO_DB"
        value = "app"
      }

      env {
        key   = "JWT_SECRET"
        value = var.jwt_secret
        type  = "SECRET"
      }

      env {
        key   = "JWT_EXPIRES_IN"
        value = "1h"
      }
    }

      ingress {
        rule {
          component {
            name = "server"
            preserve_path_prefix = true
          }
          match {
            path {
              prefix = "/api/v1"
            }
          }
          cors {
            allow_origins {
              exact = "https://${var.app_name}.ondigitalocean.app"
            }
            allow_methods   = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
            allow_headers   = ["Content-Type", "Authorization"]
            max_age        = "24h"
          }
        }
        rule {
          component {
            name = "webapp"
          }
        match {
          path {
            prefix = "/"
          }
        }
        }
      }
  }
}

# Database Firewall Rules
resource "digitalocean_database_firewall" "mongodb_fw" {
  cluster_id = digitalocean_database_cluster.mongodb.id

  rule {
    type  = "app"
    value = digitalocean_app.webapp.id
  }
}

# Outputs
output "app_url" {
  value = digitalocean_app.webapp.default_ingress
}

output "app_id" {
  value = digitalocean_app.webapp.id
}

output "mongodb_host" {
  value = digitalocean_database_cluster.mongodb.host
}

output "mongodb_port" {
  value = digitalocean_database_cluster.mongodb.port
}

output "mongodb_user" {
  value = digitalocean_database_user.mongodb_user.name
}

output "mongodb_password" {
  value     = digitalocean_database_user.mongodb_user.password
  sensitive = true
}

output "mongodb_uri" {
  value     = digitalocean_database_cluster.mongodb.uri
  sensitive = true
}