#!/bin/bash
#
# Deploy a local version of node.
#
set -e

source ./scripts/lib/start.source.sh

# See http://patorjk.com/software/taag/#p=display&f=Ivrit&t=D8%20Starterkit%0A
cat "$BASE"/scripts/lib/my-ascii-art.txt

source "$BASE"/scripts/lib/source-env.source.sh
"$BIN"docker pull node:lts
"$BIN"docker pull mongo:4
"$BIN"docker build -t my/starterkit-node .

echo ''
echo '-----'
echo 'About to create the starterkit_drupal8site_default network if it does'
echo 'exist, because we need it to have a predictable name when we try to'
echo 'connect other containers to it (for example browser testers).'
echo 'The network is then referenced in docker-compose.yml.'
echo 'See https://github.com/docker/compose/issues/3736.'
docker network ls | grep "$DOCKERNETWORK" || docker network create "$DOCKERNETWORK"

"$BASE"/scripts/docker-compose.sh up -d --build
"$BASE"/scripts/docker-compose.sh restart
"$BASE"/scripts/docker-compose.sh ps
"$BASE"/scripts/uli.sh

source ./scripts/lib/end.source.sh
