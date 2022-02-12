#!/bin/bash
#
# Run unit tests on node scripts.
set -e

source ./scripts/lib/start.source.sh

echo "$MYINDENT"'=> Running unit tests on node scripts.'
"$BIN"docker build -t my/starterkit-node .
"$BIN"docker-compose exec node /bin/bash -c 'npm test'

source ./scripts/lib/start.source.sh
