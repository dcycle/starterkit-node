#!/bin/bash
#
# Build the Docker images.
#
set -e

mv /docker-resources/node/package.json /usr/src/app/package.json

npm install \
  body-parser \
  express \
  express-session \
  http \
  mongoose \
  passport \
  socket.io \
  && echo "Done with npm install."
