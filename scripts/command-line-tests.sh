#!/bin/bash
#
# Run command-line tests.
#
set -e

echo "Making sure random numbers are different each time."

RAND1=$(echo 'app.component("./random/index.js").random()' | ./scripts/node-cli.sh)
RAND2=$(echo 'app.component("./random/index.js").random()' | ./scripts/node-cli.sh)

echo "First"
echo "$RAND1"
echo "Second"
echo "$RAND2"

if [ "$RAND1" == "$RAND2" ]; then
  exit 1;
fi

echo "All is well!"
