FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ARG DEBIAN_FRONTEND=noninteractive

# Install essential packages
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    wget \
    gpg \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    lsb-release \
    && rm -rf /var/lib/apt/lists/* \
		&& wget https://github.com/mikefarah/yq/releases/download/v4.35.1/yq_linux_amd64 -O /usr/bin/yq \
    && chmod +x /usr/bin/yq

# Install Terraform
RUN wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list \
    && apt-get update \
    && apt-get install -y terraform

# Install doctl
RUN cd /tmp \
    && curl -sL https://github.com/digitalocean/doctl/releases/download/v1.101.0/doctl-1.101.0-linux-amd64.tar.gz | tar -xzv \
    && mv doctl /usr/local/bin \
    && chmod +x /usr/local/bin/doctl

# Verify installations
RUN terraform --version && doctl version

# Set working directory
WORKDIR /infra

# Create directories for terraform and SSH
RUN mkdir -p /root/.terraform.d && mkdir -p /root/.ssh

# Add entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]