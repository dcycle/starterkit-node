#!/bin/bash
#
# Run unit tests on node scripts.
set -e

source ./scripts/lib/start.source.sh

echo "$MYINDENT"'=> Running unit tests on node scripts (2).'

docker run --rm -v $(pwd)/app/test:/app/code \
  -v $(pwd)/app/code:/mycode dcycle/ava:3

source ./scripts/lib/end.source.sh
