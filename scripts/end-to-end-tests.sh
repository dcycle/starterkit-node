#!/bin/bash
#
# Run end-to-end tests and keep track of markup and screenshots.
#
set -e

source ./scripts/lib/source-env.source.sh

# Create a user called xyz with the permission view-content-permission-xyz

ADMIN_PASSWORD=$(./scripts/generate-password.sh)
./scripts/reset-password.sh admin "$ADMIN_PASSWORD"
XYZ_PASSWORD=$(./scripts/generate-password.sh)
./scripts/reset-password.sh xyz "$XYZ_PASSWORD"
XYZ2_PASSWORD=$(./scripts/generate-password.sh)
./scripts/reset-password.sh xyz2 "$XYZ2_PASSWORD"

./scripts/add-field-value-to-user.sh xyz view-content-permission-xyz 1
./scripts/add-field-value-to-user.sh xyz2 view-content-permission-xyz 0
./scripts/add-field-value-to-user.sh xyz2 view-content-permission-xyz2 1


echo 'Sending an email'

TOKEN=$(./scripts/generate-password.sh)

echo "app.component('./mail/index.js').sendMailInDefaultServer({from: 'test@example.com', to: 'test@example.com', subject: 'This message was sent by node: $TOKEN.', html: '<p>Hello</p>', text: 'Hello'});" | ./scripts/node-cli.sh

echo 'Running our tests'
docker run --rm \
  -v "$(pwd)"/tests/browser-tests:/app/test \
  -e ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  -e XYZ_PASSWORD="$XYZ_PASSWORD" \
  -e XYZ2_PASSWORD="$XYZ2_PASSWORD" \
  -e TOKEN="$TOKEN" \
  --network "$DOCKERNETWORK" \
  -v "$(pwd)"/do-not-commit/screenshots:/artifacts/screenshots \
  -v "$(pwd)"/do-not-commit/dom-captures:/artifacts/dom-captures \
  dcycle/browsertesting:4

BASE="$(pwd)"
echo "* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * "
echo " SEE YOUR SCREENSHOTS IN"
echo " $BASE/do-not-commit/screenshots/*"
echo " AND"
echo " $BASE/do-not-commit/dom-captures/*"
echo "* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * "
