#!/bin/bash
#
# Display a user link.
#
set -e

source ./config/docs/versioned
echo ""
echo "Visit http://0.0.0.0:$DOCKERPORT to see the documentation site locally."
echo ""
echo "Use ./scripts/docs/destroy.sh to completely stop the local Docker development environment."
echo ""
