#!/bin/bash
#
# Displays a Unique Log-In link.
#
set -e

DOMAIN_AND_PORT=$(docker-compose port node 8080)
USERNAME=admin
PASSWORD=$(./scripts/reset-password.sh "$USERNAME")

echo "=>"
echo "=> Your node app is at: http://$DOMAIN_AND_PORT"
echo "=> Log in using $USERNAME / $PASSWORD"
echo "=>"
