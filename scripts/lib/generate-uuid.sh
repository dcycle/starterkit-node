# Generate a UUID.
#

docker run --rm node:alpine /bin/sh -c 'cat /proc/sys/kernel/random/uuid'
