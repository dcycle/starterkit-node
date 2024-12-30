#!/bin/bash
#
# Displays a Unique Log-In link.
#
set -e

DOMAIN_AND_PORT=$(docker compose port node 8080)

./scripts/docs/uli.sh

./scripts/reset-password.sh admin

echo "=>"
echo "=> Your node app is at: http://$DOMAIN_AND_PORT"
source ./config/docs/versioned
echo "=> Documentation is at http://0.0.0.0:$DOCKERPORT"
echo "=> Log in with the username and password above."
echo "=>"
