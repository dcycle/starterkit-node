# Get line count of a file.
# See https://stackoverflow.com/a/35053635/1207752
#

wc -l < "$1" | tr -d ' '
