#!/bin/bash
#
# Make sure we have a working env file.
#
set -e

ENVLOC="$BASE/.env"

source ./config/versioned
if [ ! -f "$ENVLOC" ]; then
  echo " => $ENVLOC did not exist, creating it."
  echo "# See $BASE/scripts/lib/examples/env.txt" > "$ENVLOC"
fi
source "$ENVLOC"

grep MONGO_USER "$ENVLOC" > /dev/null || echo "export MONGO_USER=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep MONGO_PASS "$ENVLOC" > /dev/null || echo "export MONGO_PASS=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep ENVIRONMENT_USAGE "$ENVLOC" > /dev/null || echo "export ENVIRONMENT_USAGE=dev" >> "$ENVLOC"
grep DOCKERPORT "$ENVLOC" > /dev/null || echo "export DOCKERPORT=$DOCKERPORT" >> "$ENVLOC"
grep DOCKERNETWORK "$ENVLOC" > /dev/null || echo "export DOCKERNETWORK=$DOCKERNETWORK" >> "$ENVLOC"

source "$ENVLOC"
