#!/bin/bash
#
# Destroy the node installation and its data.
#
set -e

source ./scripts/lib/source-env.source.sh

./scripts/docker-compose.sh down -v
docker network rm "$DOCKERNETWORK" || echo 'docker network cannot be deleted; moving on.'

rm -rf ./do-not-commit
rm ./.env
