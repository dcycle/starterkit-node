#!/bin/bash
#
# Deploy an environment, use "dev" or "prod".
#
set -e

if [ -z "$1" ]; then
  export TARGET_ENV=dev
else
  export TARGET_ENV="$1"
fi

source ./scripts/lib/deploy.source.sh
