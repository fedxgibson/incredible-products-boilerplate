# Provider configuration
terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}



# Configure the DigitalOcean Provider
provider "digitalocean" {
  token = var.do_token
}

# Variables
variable "do_token" {
  description = "DigitalOcean API Token"
  type        = string
  sensitive   = true
}

variable "repository_name" {
  description = "Name of repository"
  type        = string
  default     = ""
}

variable "app_name" {
  description = "Name of your Next.js application"
  type        = string
  default     = "nextjs-app"
}

variable "region" {
  description = "Region to deploy the application"
  type        = string
  default     = "nyc1"
}

# Database configuration
resource "digitalocean_database_cluster" "postgres" {
  name       = "${var.app_name}-db"
  engine     = "pg"  # postgresql
  version    = "15"  # postgresql version
  size       = "db-s-1vcpu-1gb"  # smallest size, good for development
  region     = var.region
  node_count = 1

  # Optional but recommended: maintenance window
  maintenance_window {
    day  = "sunday"
    hour = "02:00:00"
  }
}

# Create a database
resource "digitalocean_database_db" "database" {
  cluster_id = digitalocean_database_cluster.postgres.id
  name       = "${var.app_name}_prod"
}

# Create a database user
resource "digitalocean_database_user" "user" {
  cluster_id = digitalocean_database_cluster.postgres.id
  name       = "${var.app_name}_user"
}

# Configure firewall rules to allow the app to connect to the database
resource "digitalocean_database_firewall" "app_fw" {
  cluster_id = digitalocean_database_cluster.postgres.id

  rule {
    type  = "app"
    value = digitalocean_app.nextjs.id
  }
}

# Update the app configuration to use the database
resource "digitalocean_app" "nextjs" {
  spec {
    name   = var.app_name
    region = var.region

    service {
      name               = "nextjs-service"
      instance_size_slug = "basic-xxs"
      instance_count     = 1

      github {
        repo           = var.repository_name
        branch         = "main"
        deploy_on_push = true
      }

      dockerfile_path = "Dockerfile"

      # Database connection environment variable
      env {
        key = "DATABASE_URL"
        value = join("", [
          "postgresql://",
          digitalocean_database_user.user.name,
          ":",
          digitalocean_database_user.user.password,
          "@",
          digitalocean_database_cluster.postgres.host,
          ":",
          digitalocean_database_cluster.postgres.port,
          "/",
          digitalocean_database_db.database.name
        ])
        type = "SECRET"
      }

      # Other environment variables
      env {
        key   = "NODE_ENV"
        value = "production"
      }
    }
  }
}

# Output important database information
output "database_host" {
  value = digitalocean_database_cluster.postgres.host
}

output "database_port" {
  value = digitalocean_database_cluster.postgres.port
}

output "database_name" {
  value = digitalocean_database_db.database.name
}

output "database_user" {
  value = digitalocean_database_user.user.name
}

# Don't output the password in a production environment
output "database_password" {
  value     = digitalocean_database_user.user.password
  sensitive = true
}

# Output the app URL
output "app_url" {
  value = digitalocean_app.nextjs.default_ingress
}

# Output the app ID
output "app_id" {
  value = digitalocean_app.nextjs.id
}