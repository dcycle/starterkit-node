#!/bin/bash
#
# Build the Docker images.
#
set -e

mv /docker-resources/node/package.json /usr/src/app/package.json

npm install express
npm install mongoose
npm install body-parser
npm install socket.io
npm install http
