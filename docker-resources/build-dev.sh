#!/bin/sh
#
# Build the development Dockerfile.
#
set -e

/docker-resources/build-image.sh

npm install --save-dev mocha chai sinon
npm install forever -g
