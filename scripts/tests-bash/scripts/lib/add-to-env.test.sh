#!/bin/bash
set -e

echo ' => Testing ./scripts/lib/add-to-env.sh'
rm -rf ./do-not-commit/bash-test-add-to-env
mkdir -p ./do-not-commit/bash-test-add-to-env

TEMPFILENAME=./do-not-commit/bash-test-add-to-env/tempfile.txt

echo "Creating $TEMPFILENAME with"
echo "HELLO=old" > "$TEMPFILENAME"
cat "$TEMPFILENAME"

echo "Adding HELLO=new"
./scripts/lib/add-to-env.sh "$TEMPFILENAME" "HELLO" new
echo "Adding HELLO=new"
./scripts/lib/add-to-env.sh "$TEMPFILENAME" "HELLO" new
echo "Adding WORLD=new"
./scripts/lib/add-to-env.sh "$TEMPFILENAME" "WORLD" new
echo "Adding WORLD=something"
./scripts/lib/add-to-env.sh "$TEMPFILENAME" "WORLD" something

echo " => $TEMPFILENAME now contains"
cat "$TEMPFILENAME"

echo "HELLO=old should exist"
grep "HELLO=old" < "$TEMPFILENAME"
echo "HELLO=new should not exist"
! grep "HELLO=new" < "$TEMPFILENAME"
echo "WORLD=new should exist"
grep "WORLD=new" < "$TEMPFILENAME"

echo "We should have only two lines"
LINECOUNT=$(./scripts/lib/line-count.sh "$TEMPFILENAME")
if [ "$LINECOUNT" == 2 ]; then
  >&2 echo "Expecting 2 lines, we have $LINECOUNT. Moving on."
else
  >&2 echo "Expecting 2 lines, we have $LINECOUNT"
  exit 1
fi

echo "Cleaning up"
rm -rf ./do-not-commit/bash-test-add-to-env
