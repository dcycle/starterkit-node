#!/bin/bash
#
# Get into the command line with Node.
#
set -e

# We are outputting intrusctions to stderr for consistency with
# ./node-cli-app.sh.
>&2 echo ""
>&2 echo "Node SANDBOX command line interface."
>&2 echo ""
>&2 echo "This runs independently from your running application and is useful to"
>&2 echo "test node commands in isolation, for example, type:"
>&2 echo ""
>&2 echo "1 + 1;"
>&2 echo ""
>&2 echo "See The Node.js command line interface (CLI) in project README."
>&2 echo ""
>&2 echo "Use command-C or type .exit to quit"
>&2 echo ""

docker-compose run --rm node /bin/sh -c 'node'
