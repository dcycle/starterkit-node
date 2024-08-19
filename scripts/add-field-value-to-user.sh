#!/bin/bash
#
# Add a field value to a user.
#
set -e

if [ -z "$1" ]; then
  >&2 echo "Please specify a username, for example admin"
  exit 1
fi
if [ -z "$2" ]; then
  >&2 echo "Please specify a field name view-content-permission-xyz"
  exit 1
fi
if [ -z "$3" ]; then
  >&2 echo "Please specify a field value, for example 1"
  exit 1
fi

docker-compose exec -T \
  --env MY_USER="$MY_USER" \
  --env MY_FIELD="$MY_FIELD" \
  --env MY_VALUE="$MY_VALUE" \
  node /bin/sh -c 'node /usr/src/app/app/tools/add-field-value-to-user.js'
