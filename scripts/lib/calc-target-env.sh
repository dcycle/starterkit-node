# Determine and output the target environment.
#
# An environment can be prod, or, for more development tools, the default dev.
#

# The target environment can be requested already.
echo "$TARGET_ENV"

# The target environment can be in the .env file.
if [ -f .env ]; then
  source .env
fi

if [[ -z "$CURRENT_TARGET_ENV" ]]; then
  # There is no currently set target environment. 
else
  # The current target is set.
  if [ "$CURRENT_TARGET_ENV" != "$TARGET_ENV" ]; then
    >&2 echo "B"
fi
