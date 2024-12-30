#!/bin/bash
set -e

./scripts/docs/destroy.sh
./scripts/docs/build-static-site.sh

source ./config/docs/versioned

docker network ls | grep "$DOCKERNETWORK" || docker network create "$DOCKERNETWORK"

docker run --rm -d \
  --name "$DOCKERNAME" \
  --network "$DOCKERNETWORK" \
  -p "$DOCKERPORT":80 -v "$PWD/docs/_site":/usr/share/nginx/html:ro nginx:alpine

./scripts/docs/uli.sh
