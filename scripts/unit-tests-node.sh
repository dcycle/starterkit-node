#!/bin/bash
#
# Run unit tests on node scripts.
set -e

source ./scripts/lib/start.source.sh

echo "$MYINDENT"'=> Running unit tests on node scripts (2).'
"$BIN"docker-compose exec node /bin/bash -c 'npm test'

source ./scripts/lib/end.source.sh
