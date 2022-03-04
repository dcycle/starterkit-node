#!/bin/bash
#
# Run unit tests on node scripts.
set -e

source ./scripts/lib/start.source.sh

echo "$MYINDENT"'=> Running type checking using flow.'

docker run --rm -v $(pwd)/app/code:/app/code dcycle/flow:1

source ./scripts/lib/end.source.sh
