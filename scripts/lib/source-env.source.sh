#!/bin/bash
#
# Make sure we have a working env file.
#
set -e

ENVLOC="$BASE/.env"

if [ ! -f "$ENVLOC" ]; then
  echo " => $ENVLOC did not exist, creating it."
  cp "$BASE"/scripts/lib/examples/env.txt "$ENVLOC"
  echo " => Adding random MONGO_USER."
  echo "export MONGO_USER=$("$BASE"/scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
  echo " => Adding random MONGO_PASS."
  echo "export MONGO_PASS=$("$BASE"/scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
  echo " => ENVIRONMENT_USAGE set to dev; edit the .dev file and redeploy for prod."
  echo "export ENVIRONMENT_USAGE=dev"
fi

source ./config/versioned
source "$ENVLOC"

array=( \
MONGO_USER \
MONGO_PASS \
ENVIRONMENT_USAGE \
DOCKERNETWORK \
)
for i in "${array[@]}"
do
  echo " => Checking environment variable $i"
  if [ -z "$$i" ]; then
    >&2 echo " => Environment variable $i does not exist"
    >&2 echo " => Please edit $ENVLOC"
    exit 2
  else
    echo " => Environment variable $i exists"
  fi
done

echo " => Add some variables to $ENVLOC if they are not there"
echo " => These are required by docker-compose.yml"
./scripts/lib/add-to-env.sh "$ENVLOC" "DOCKERNETWORK" "$DOCKERNETWORK"
