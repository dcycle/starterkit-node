#!/bin/bash
#
# Get into the command line with Node.
#
set -e

source ./scripts/lib/start.source.sh

./scripts/docker-compose.sh exec node /bin/bash -c 'node'

source ./scripts/lib/end.source.sh
