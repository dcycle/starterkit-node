#!/bin/bash
#
# Run the continuous integration script; make sure everything works as expected.
#
# Designed to be run on a new virtual machine with Docker, especially on
# Circle CI, from ./.circleci/config.yml.
set -e

source ./scripts/lib/start.source.sh

# We need to create some directories because if they are created with
# ./scripts/end-to-end-tests.sh, Circle CI will not be able to delete them
# within the destroy.sh script.
mkdir -p "$BASE"/do-not-commit/screenshots
mkdir -p "$BASE"/do-not-commit/dom-captures

echo "$MYINDENT"'=> Running ./scripts/test.sh'
"$BASE"/scripts/test.sh
echo "$MYINDENT"'=> Initial deployment'
"$BASE"/scripts/deploy.sh
echo "$MYINDENT"'=> Incremental deployment'
"$BASE"/scripts/deploy.sh
echo "$MYINDENT"'=> End-to-end tests'
"$BASE"/scripts/end-to-end-tests.sh
echo "$MYINDENT"'=> Destroy'
"$BASE"/scripts/destroy.sh

source ./scripts/lib/end.source.sh
