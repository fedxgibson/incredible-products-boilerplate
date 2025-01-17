#!/bin/bash

# Extract token from doctl config and set it as environment variable
if [ -f "/root/.config/doctl/config.yaml" ]; then
    export DIGITALOCEAN_TOKEN=$(yq '.access-token' /root/.config/doctl/config.yaml)
    echo "DigitalOcean token loaded from config file"
else
    echo "Warning: No doctl config file found"
fi

# Execute the passed command
exec "$@"