#!/bin/bash
#
# Add a line to an env file if it does not exist.
#
set -e

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  >&2 echo "./scripts/lib/add-to-env.sh requires three arguments."
  >&2 echo "See ./scripts/lib/README.md."
  exit 1
fi
FILELOC="$1"
VARNAME="$2"
VARVALUE="$3"

# Not sure how to fix this...
# shellcheck disable=SC2143
if [[ $(grep "^$2=" "$FILELOC") ]] ; then
  echo "$FILELOC contains ^$2="
else
  echo "$FILELOC does not contain ^$2="
  echo "$VARNAME=$VARVALUE" >> "$FILELOC"
fi
