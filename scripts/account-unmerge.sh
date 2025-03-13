#!/bin/bash
#
# UnMerge User account.
#
set -e

if [ -z "$1" ]; then
  >&2 echo "Please specify a username to unmerge account"
  exit 1
fi

docker compose exec -T \
  --env EXEC="unmerge" \
  --env USERNAME="$1" \
  node /bin/sh -c 'node /usr/src/app/app/tools/account-merge-unmerge.js'
