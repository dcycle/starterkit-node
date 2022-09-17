# Assuming you have the latest version Docker installed, this script will
# fully create or update your environment.
#

# See http://patorjk.com/software/taag/#p=display&f=Ivrit&t=D8%20Starterkit%0A
cat ./scripts/lib/my-ascii-art.txt
echo ''
source ./scripts/lib/hook.source.sh extra-banner-info

source ./scripts/lib/source-env.source.sh
echo ''
echo '-----'
echo 'Pull latest versions of base images.'
docker pull node:alpine
docker pull mongo:4
docker build -t my/starterkit-node .

echo ''
echo '-----'
echo 'About to create the starterkit_drupal8site_default network if it does'
echo 'exist, because we need it to have a predictable name when we try to'
echo 'connect other containers to it (for example browser testers).'
echo 'The network is then referenced in docker-compose.yml.'
echo 'See https://github.com/docker/compose/issues/3736.'
docker network ls | grep "$DOCKERNETWORK" || docker network create "$DOCKERNETWORK"

echo ''
echo '---DETERMINE LOCAL DOMAIN---'
echo 'The local domain variable, used by https-deploy.sh does not need to be'
echo 'set during non-https deployment, however we will set it anyway because'
echo 'otherwise docker-compose up will complain that the variable is not set.'
source ./scripts/lib/set-local-domain.sh

source ./scripts/lib/hook.source.sh set-docker-compose-files

# Cannot quote $DOCKER_COMPOSE_FILES here
# shellcheck disable=SC2086
docker-compose $DOCKER_COMPOSE_FILES up -d --build
./scripts/docker-compose.sh restart
./scripts/docker-compose.sh ps
./scripts/uli.sh
