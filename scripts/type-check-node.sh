#!/bin/bash
#
# Type checking our Javascript code.
set -e

echo '=> Running type checking using TypeScript.'
echo '=> Using http://github.com/dcycle/docker-typescript'
echo '=>'
echo '=> To ignore the next line add:'
echo '=> // @ts-expect-error'
echo '=>'

find ./app/code -name "*.js" -print0 | \
  xargs -0  docker run --rm -v "$(pwd)":/code \
  dcycle/typescript:1 \
  --noEmit --checkJs --target es6
