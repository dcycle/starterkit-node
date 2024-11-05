# Make sure we have a working env file.
#

ENVLOC="./.env"

if [ -z "$TARGET_ENV" ]; then
  TARGET_ENV=dev
fi

source ./config/versioned
if [ ! -f "$ENVLOC" ]; then
  echo " => $ENVLOC did not exist, creating it."
  echo "# See ./scripts/lib/examples/env.txt" > "$ENVLOC"
fi
source "$ENVLOC"

if [ -z "$ENVIRONMENT_USAGE" ]; then
  echo "ENVIRONMENT_USAGE does not exist in $ENVLOC, it will be set later. Moving on."
else
  if [ "$ENVIRONMENT_USAGE" != "$TARGET_ENV" ]; then
    >&2 echo "Environments are not the same: $ENVIRONMENT_USAGE != $TARGET_ENV"
    >&2 echo "You cannot run a command for one environment ($TARGET_ENV) if"
    >&2 echo "Your current environment ($ENVIRONMENT_USAGE) is different."
    >&2 echo "You can destroy your current environemnt, using"
    >&2 echo ""
    >&2 echo " => ./scripts/destroy.sh"
    >&2 echo ""
    >&2 echo "Then run this command again."
    exit 1
  fi
fi

grep MONGO_USER "$ENVLOC" > /dev/null || echo "export MONGO_USER=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep MONGO_PASS "$ENVLOC" > /dev/null || echo "export MONGO_PASS=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep ENVIRONMENT_USAGE "$ENVLOC" > /dev/null || echo "export ENVIRONMENT_USAGE=dev" >> "$ENVLOC"
grep TWILIO_USER "$ENVLOC" > /dev/null || echo "export TWILIO_USER=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep TWILIO_PASS "$ENVLOC" > /dev/null || echo "export TWILIO_PASS=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep DOCKERPORT "$ENVLOC" > /dev/null || echo "export DOCKERPORT=$DOCKERPORT" >> "$ENVLOC"
grep DOCKERNETWORK "$ENVLOC" > /dev/null || echo "export DOCKERNETWORK=$DOCKERNETWORK" >> "$ENVLOC"
grep EXPRESS_SESSION_SECRET "$ENVLOC" > /dev/null || echo "export EXPRESS_SESSION_SECRET=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep SALT "$ENVLOC" > /dev/null || echo "export SALT=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep ENVIRONMENT_USAGE "$ENVLOC" > /dev/null || echo "export ENVIRONMENT_USAGE=$TARGET_ENV" >> "$ENVLOC"
grep CRASHTEST_TOKEN "$ENVLOC" > /dev/null ||  echo "export CRASHTEST_TOKEN=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep DEV_MODE "$ENVLOC" > /dev/null || echo "export DEV_MODE=true" >> "$ENVLOC"
grep WHATSAPPSENDM_API_TOKEN "$ENVLOC" > /dev/null ||  echo "export WHATSAPPSENDM_API_TOKEN=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"
grep FROM_NUM "$ENVLOC" > /dev/null ||  echo "export FROM_NUM=$(./scripts/lib/generate-uuid.sh)" >> "$ENVLOC"

source "$ENVLOC"
