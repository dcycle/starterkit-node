#!/bin/bash
#
# Build the Docker images.
#
set -e

mv /docker-resources/node/package.json /usr/src/app/package.json

npm install \
  body-parser \
  connect-ensure-login \
  express \
  express-session \
  http \
  mongoose \
  nodemailer \
  passport \
  passport-local-mongoose \
  socket.io \
  && echo "Done with npm install."
