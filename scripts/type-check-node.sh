#!/bin/bash
#
# Run unit tests on node scripts.
set -e

echo '=> Running type checking using flow.'
echo '=> Using https://github.com/dcycle/docker-flow'
echo '=> We are currently completely ignoring node_modules, and testing our'
echo '=> code in isolation. Future versions could use a system based on'
echo '=> https://stackoverflow.com/a/51956846/1207752 and an image which'
echo '=> includes external node modules.'
echo '=> If you are getting false negatives or want to ignore certain'
echo '=> errors add this before the line you want to ignore:'
echo '=>'
echo '=>    // ''$''FlowFixMe'
echo '=>'

docker run --rm -v "$(pwd)"/app/code:/app/code dcycle/flow:1
