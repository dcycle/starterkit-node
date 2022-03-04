#!/bin/bash
#
# Displays a Unique Log-In link.
#
set -e

DOMAIN_AND_PORT=$(docker-compose port node 8080)
MAIL_DOMAIN_AND_PORT=$(docker-compose port mail 8025)
USERNAME=admin
PASSWORD=$(./scripts/reset-password.sh "$USERNAME")

echo "=>"
echo "=> Your node app is at: http://$DOMAIN_AND_PORT"
echo "=> Your dummy mail server, if this is dev, is at: http://$MAIL_DOMAIN_AND_PORT"
echo "=> Log in using $USERNAME / $PASSWORD"
echo "=>"
