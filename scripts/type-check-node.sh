#!/bin/bash
#
# Run unit tests on node scripts.
set -e

echo '=> Running type checking using flow.'

docker run --rm -v "$(pwd)"/app/code:/app/code dcycle/flow:1
