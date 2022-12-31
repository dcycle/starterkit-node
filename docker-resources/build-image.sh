#!/bin/sh
#
# Build the Docker images.
#
set -e

# express:
#   The web framework.
# mongoose:
#   NoSQL database driver built atop mongodb.
# mongodb:
#   NoSQL database simple driver.
# body-parser:
#   Process data sent in an HTTP request body.
# ejs:
#   For templating, see https://github.com/mde/ejs.
# passport:
#   Authentication framework.
# passport-local-mongoose:
#   Authentication with username and password.
# socket.io:
#   Allows pushing info from the server to the web client.
# express-session:
#   Persistent authenticated sessions for express.
# js-yaml:
#   YAML parsing.
# nodemailer:
#   Send emails.
# passport-github2:
#   Log in with GitHub and make your site a GitHub App.
# deepmerge:
#   Deep merge arrays.
# argon2:
#   Relatively safe hashing.
# jsonwebtoken:
#   JWTs or Json Web Tokens are an industry standard token.

npm install \
  ejs \
  express \
  mongoose \
  mongodb \
  body-parser \
  passport \
  passport-local-mongoose \
  socket.io \
  express-session \
  js-yaml \
  nodemailer \
  passport-github2 \
  deepmerge \
  argon2 \
  jsonwebtoken
