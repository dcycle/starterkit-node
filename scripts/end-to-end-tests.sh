#!/bin/bash
#
# Run end-to-end tests and keep track of markup and screenshots.
#

set -e

source ./scripts/lib/start.source.sh
source ./scripts/lib/source-env.source.sh

ADMIN_PASSWORD=$(./scripts/generate-password.sh)
./scripts/reset-password.sh admin "$ADMIN_PASSWORD"

echo 'Running our tests'
docker run --rm \
  -v "$(pwd)"/tests/browser-tests:/app/test \
  -e ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  --network "$DOCKERNETWORK" \
  -v "$(pwd)"/do-not-commit/screenshots:/artifacts/screenshots \
  -v "$(pwd)"/do-not-commit/dom-captures:/artifacts/dom-captures \
  dcycle/browsertesting:4

BASE="$(pwd)"
echo "* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * "
echo " SEE YOUR SCREENSHOTS IN"
echo " $BASE/do-not-commit/screenshots/*"
echo " AND"
echo " $BASE/do-not-commit/dom-captures/*"
echo "* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * "
