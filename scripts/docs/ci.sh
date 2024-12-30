#!/bin/bash
#
# Continuous integration script run on CircleCI, see ./.circleci/config.yml.
#
set -e

echo ""
echo "Documentation: Deploying the site"
echo ""
./scripts/docs/deploy.sh
echo ""
echo "Documentation: Destroying the environment"
echo ""
./scripts/docs/destroy.sh
echo ""
echo "Documentation: Good job, all tests are passing!"
echo ""
