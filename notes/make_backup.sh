#!/bin/sh
# Run from dronesoundtv parent, archives everything but cache
STAMP=`date '+%m%d%Y' | xargs`
zip -r dronetv-$STAMP.zip sonicmonkeypi/ -x sonicmonkeypi/cache/*
