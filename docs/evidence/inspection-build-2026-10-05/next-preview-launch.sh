#!/bin/sh
# Next launch only. Do not execute while the current inspection owner is alive.
# Existing native-slot wrapper supplies the inherited token to App and AX clients.
exec /opt/homebrew/Cellar/node/26.7.0/bin/node \
  /private/tmp/aux-browser-runtime-builder-native352-source-001/scripts/native-slot.mjs -- \
  /opt/homebrew/Cellar/node/26.7.0/bin/node \
  /private/tmp/aux-builder-native352-preparation-001/visible-native352-preview-001.mjs
