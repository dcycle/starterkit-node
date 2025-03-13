#!/bin/bash
#
# Merge 2 UserInfo account.
#
set -e

if [ -z "$1" ]; then
  >&2 echo "Please specify a 2 username to merge account"
  exit 1
fi
if [ -z "$2" ]; then
  >&2 echo "Please specify a 2 username to merge account"
  exit 1
fi

docker compose exec -T \
  --env EXEC="merge" \
  --env USERNAME1="$1" \
  --env USERNAME2="$2" \
  node /bin/sh -c 'node /usr/src/app/app/tools/account-merge-unmerge.js'
