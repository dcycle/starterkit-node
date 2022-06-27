#!/bin/bash
#
# Run command-line tests.
#
set -e

echo "We are generating random numbers four times, they should be different..."

RAND1=$(echo 'app.component("./random/index.js").random()' | ./scripts/node-cli-app.sh)
RAND2=$(echo 'app.component("./random/index.js").random()' | ./scripts/node-cli-app.sh)
RAND3=$(echo 'console.log(require("./app/random/index.js").random())' | ./scripts/node-cli-sandbox.sh)
RAND4=$(echo 'console.log(require("./app/random/index.js").random())' | ./scripts/node-cli-sandbox.sh)

echo "First"
echo "$RAND1"
echo "Second"
echo "$RAND2"
echo "Third"
echo "$RAND3"
echo "Fourth"
echo "$RAND4"

if [ "$RAND1" == "$RAND2" ]; then
  exit 1;
fi
if [ "$RAND1" == "$RAND3" ]; then
  exit 1;
fi
if [ "$RAND1" == "$RAND4" ]; then
  exit 1;
fi
if [ "$RAND2" == "$RAND3" ]; then
  exit 1;
fi
if [ "$RAND2" == "$RAND4" ]; then
  exit 1;
fi
if [ "$RAND3" == "$RAND4" ]; then
  exit 1;
fi

echo "All is well!"
