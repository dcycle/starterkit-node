#!/bin/bash
#
# Run unit tests on node scripts.
set -e

echo '=> Running unit tests on node scripts (2).'
./scripts/docker-compose.sh exec -T node /bin/sh -c 'npm test'
