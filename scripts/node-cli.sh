#!/bin/bash
#
# Get into the command line with Node.
#
set -e

# We are outputting instructions to stderr becase we do not want these to
# be part of the output when piping a command to the cli, then fetching
# the output.
# See "Piping commands to the CLI", in ./README.md.
# See https://stackoverflow.com/questions/2199624.
>&2 echo ""
>&2 echo "Node APPLICATION command line interface."
>&2 echo ""
>&2 echo "This runs against your running application and is useful to"
>&2 echo "test node commands against your running application, for example:"
>&2 echo ""
>&2 echo "app.component('./numUsers/index.js').numUsers();"
>&2 echo ""
>&2 echo "See The Node.js command line interface (CLI) in project README."
>&2 echo ""
>&2 echo "Use command-C or type .exit to quit"
>&2 echo ""
>&2 echo "YOU CAN START TYPING."
>&2 echo ""

# -i Interactive shell
docker compose exec -iT node /bin/sh -c 'node app/tools/repl.js localhost:8001'
