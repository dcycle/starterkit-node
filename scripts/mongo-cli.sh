#!/bin/bash
#
# Get into the command line with Mongo DB.
#
set -e

./scripts/docker-compose.sh exec mongo /bin/bash -c 'mongo mongodb://"$''MONGO_INITDB_ROOT_USERNAME":"$''MONGO_INITDB_ROOT_PASSWORD"@localhost:27017/?authSource=admin'
