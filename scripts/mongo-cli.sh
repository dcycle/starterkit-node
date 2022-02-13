#!/bin/bash
#
# Get into the command line with Mongo DB.
#
set -e

source ./scripts/lib/start.source.sh

./scripts/docker-compose.sh exec mongo /bin/bash -c 'mongo mongodb://"$''MONGO_INITDB_ROOT_USERNAME":"$''MONGO_INITDB_ROOT_PASSWORD"@localhost:27017/?authSource=admin'

source ./scripts/lib/end.source.sh
