# Deployment Process Guide

## Project Structure
Our project uses the following key files:
- `Dockerfile`: Contains instructions to build our deployment tool image with Terraform and doctl
- `digital-ocean-config.yml`: Contains our DigitalOcean authentication token
- `main.tf`: Terraform configuration that defines our infrastructure
- `Makefile`: Contains commands to simplify our deployment process
- `terraform.tfvars.json`: Contains our configuration variables

## Authentication Setup
1. First, ensure you have a `digital-ocean-config.yml` file with your DigitalOcean token:
```yaml
access-token: your_token_here
context: default
current-context: default
```

2. When you run Terraform commands through our custom Docker container:
   - The token is automatically loaded from this config file
   - It's set as the DIGITALOCEAN_TOKEN environment variable
   - Both Terraform and doctl use this token for authentication

## Deployment Commands
Our Makefile provides several commands to manage deployment:

1. Initialize Terraform (first time only):
```bash
make tf-init
```

2. Preview changes before applying:
```bash
make tf-plan
```

3. Apply changes to infrastructure:
```bash
make tf-apply
```

4. If needed, destroy infrastructure:
```bash
make tf-destroy
```

## What Happens During Deployment
When you run `make tf-apply`:

1. **Docker Build Phase**
   - Builds a container with Terraform and doctl installed
   - Sets up authentication using your config file

2. **Infrastructure Creation**
   - Creates MongoDB database cluster
   - Sets up network and firewall rules
   - Deploys your application services:
     - Frontend (webapp)
     - Backend (server)

3. **GitHub Integration**
   - Connects to your GitHub repository
   - Sets up automatic deployments when you push to main branch

## Automatic Deployments
After initial setup:
1. Push code to GitHub main branch
2. DigitalOcean automatically:
   - Detects the change
   - Pulls new code
   - Rebuilds containers
   - Updates running services

## Common Issues and Solutions

### Authentication Failed
If you see authentication errors:
1. Check your `digital-ocean-config.yml` file is correct
2. Ensure the file is properly mounted in the container
3. Verify the token is valid in DigitalOcean dashboard

### Deployment Failed
If deployment fails:
1. Check the logs using `make logs`
2. Verify your MongoDB connection strings
3. Ensure all environment variables are set correctly
4. Check GitHub repository permissions

## Best Practices
1. Always run `tf-plan` before `tf-apply`
2. Keep sensitive data in appropriate files:
   - Tokens in `digital-ocean-config.yml`
   - Other secrets in `terraform.tfvars.json`
3. Never commit sensitive files to Git
4. Keep your deployment documentation updated
5. Monitor resource usage regularly

## Monitoring Your Deployment
After deployment:
1. Check the DigitalOcean dashboard for:
   - Application health
   - Database metrics
   - Resource usage
2. Set up alerts for:
   - High CPU/Memory usage
   - Database connectivity issues
   - Application errors

## Getting Help
If you encounter issues:
1. Check the logs first
2. Review the error messages
3. Consult the team's documentation
4. Ask for help in the #devops Slack channel

Remember: It's better to ask for help early than to struggle with deployment issues alone!