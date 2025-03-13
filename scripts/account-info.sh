#!/bin/bash
#
# Display users merged account details
#
set -e

if [ -z "$1" ]; then
  >&2 echo "Please specify a username to fetch account info"
  exit 1
fi

docker compose exec -T \
  --env EXEC="info" \
  --env USERNAME="$1" \
  node /bin/sh -c 'node /usr/src/app/app/tools/account-merge-unmerge.js'
