#!/bin/bash
#
# Get logs.
#
set -e

./scripts/docker-compose.sh logs mongo
./scripts/docker-compose.sh logs node
