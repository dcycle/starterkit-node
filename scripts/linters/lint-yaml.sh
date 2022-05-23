#!/bin/bash
#
# Lint files; make sure they follow style guidelines.
set -e



echo '=> Linting yaml files'
docker run --rm -v "$(pwd)":/code dcycle/yaml-lint:2 /code


