#!/bin/bash
#
# Deploy an environment, use "dev" or "prod".
#
set -e

if [ "$1" ]; then
  export TARGET_ENV="$1"
fi

export TARGET_ENV=$(./scripts/lib/calc-target-env.sh)

echo "Target environment is $TARGET_ENV"

#
#
#
# source ./scripts/lib/deploy.source.sh
