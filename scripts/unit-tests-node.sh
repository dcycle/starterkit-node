#!/bin/bash
#
# Run unit tests on node scripts.
set -e

echo '=> Running unit tests on node scripts using https://github.com/dcycle/docker-ava.'
docker run --rm -v $(pwd)/app/test:/app/code \
  -v $(pwd)/app/code:/mycode dcycle/ava:3
