#!/bin/bash
#
# Build the Docker images.
#
set -e

mv /docker-resources/node/package.json /usr/src/app/package.json

npm install \
  express \
  mongoose \
  body-parser \
  passport \
  passport-local-mongoose \
  socket.io \
  express-session \
  http
