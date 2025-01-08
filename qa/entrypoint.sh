#!/bin/bash

# Start D-Bus
rm -f /var/run/dbus/pid
rm -f /run/dbus/pid
rm -f /var/run/dbus/system_bus_socket

mkdir -p /var/run/dbus
mkdir -p /run/dbus
chmod 755 /var/run/dbus
chmod 755 /run/dbus

dbus-uuidgen > /var/lib/dbus/machine-id

if ! dbus-daemon --system --fork; then
    echo "Failed to start D-Bus daemon"
    exit 1
fi

sleep 2

# Keep container running but also forward signals properly
exec tail -f /dev/null & wait