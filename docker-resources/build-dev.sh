#!/bin/sh
#
# Build the development Dockerfile.
#
set -e

npm install --save-dev mocha chai sinon
npm install forever -g
