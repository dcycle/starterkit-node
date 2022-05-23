#!/bin/bash
#
# Lint files; make sure they follow style guidelines.
set -e



echo '=> Linting shell scripts'
find . -name "*.sh" -print0 | \
  xargs -0 docker run --rm -v "$(pwd)":/code dcycle/shell-lint


