#!/bin/bash
#
# Reset and print out a new, random password for a username.
#
set -e

if [ -z "$1" ]; then
  >&2 echo "Please specify a username, for example ./scripts/reset-password.sh admin"
  exit 1
fi

export MY_USERNAME="$1"
# Password is optional.
export MY_PASSWORD="$2"
docker-compose exec -T --env MY_USERNAME="$MY_USERNAME" --env MY_PASSWORD="$MY_PASSWORD" node /bin/sh -c 'node /usr/src/app/app/tools/reset-password.js'
