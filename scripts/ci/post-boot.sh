#!/bin/sh
set -eu

# Tartelet opens Terminal over SSH; SSH can answer before automatic login finishes.
attempt=0
until launchctl print "gui/$(id -u)" >/dev/null 2>&1 && pgrep -x Dock >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 90 ]; then
    echo 'The CI desktop session did not become ready within three minutes.' >&2
    exit 1
  fi
  sleep 2
done
