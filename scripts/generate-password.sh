#!/bin/bash
#
# Generate a password.
#
set -e
docker compose exec -T node /bin/sh -c 'node /usr/src/app/app/tools/generate-password.js'
