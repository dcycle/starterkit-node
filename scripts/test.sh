#!/bin/bash
#
# Run tests; make sure everything works as expected.
#
# Designed to be run on any computer with Docker installed.
set -e

source ./scripts/lib/start.source.sh

echo "$MYINDENT"'=> Running all relatively fast tests.'
./scripts/lint.sh
./scripts/unit-tests-node.sh

source ./scripts/lib/end.source.sh
