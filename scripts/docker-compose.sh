#!/bin/bash
#
# The equivalent of docker-compose, but depends on our environment.
#
# Depending on our environment, different compose files are used. This script
# sources our environment variables and runs docker-compose using the
# right docker-compose files.
#
set -e

source ./scripts/lib/source-env.source.sh

COMPOSEFILES='-f docker-compose.yml'

if [ "$ENVIRONMENT_USAGE" != 'prod' ]; then
  COMPOSEFILES="$COMPOSEFILES -f docker-compose.dev.yml"
fi

# Cannot quote $DOCKER_COMPOSE_FILES here
# shellcheck disable=SC2086
docker-compose $COMPOSEFILES "$@"
