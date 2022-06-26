#!/bin/bash
#
# Get into the command line with Node.
#
set -e

echo ""
echo "Node APPLICATION command line interface."
echo ""
echo "This runs against your running application and is useful to"
echo "test node commands against your running application, for example:"
echo ""
echo "require('./app/app.js').numUsers();"
echo ""
echo "See The Node.js command line interface (CLI) in project README."
echo ""

docker-compose exec node /bin/sh -c 'node app/tools/repl.js'
