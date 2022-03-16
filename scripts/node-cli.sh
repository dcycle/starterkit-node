#!/bin/bash
#
# Get into the command line with Node.
#
set -e

echo ""
echo "Node command line interface."
echo ""
echo "To require a local module, you can run (for example):"
echo "const myDatabase = require('./app/myDatabase.js').init();"
echo ""

docker-compose exec node /bin/bash -c 'cd /usr/src/app/app && node'
