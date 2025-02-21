#!/bin/bash
#
# Run command-line tests.
#
set -e

echo "Making sure random numbers are different each time."

RAND1=$(echo 'app.c("crypto").random()' | ./scripts/node-cli.sh ci)
RAND2=$(echo 'app.c("crypto").random()' | ./scripts/node-cli.sh ci)

echo "First"
echo "$RAND1"
echo "Second"
echo "$RAND2"

if [ "$RAND1" == "$RAND2" ]; then
  exit 1;
fi

echo "All is well!"
