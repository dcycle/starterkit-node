#!/bin/bash
#
# Run tests; make sure everything works as expected.
#
# Designed to be run on any computer with Docker installed.
set -e

echo '=> Running all relatively fast tests.'
./scripts/lint.sh
./scripts/unit-tests-node.sh
./scripts/type-check-node.sh

echo ""
echo "."
echo ".."
echo " --- fast tests complete ---"
echo ".."
echo "."
echo ""
