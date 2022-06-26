#!/bin/bash
#
# Get into the command line with Node.
#
set -e

echo ""
echo "Node SANDBOX command line interface."
echo ""
echo "This runs independently from your running application and is useful to"
echo "test node commands in isolation, for example, type:"
echo ""
echo "1 + 1;"
echo ""
echo "See The Node.js command line interface (CLI) in project README."
echo ""

docker-compose run --rm node /bin/sh -c 'node'
