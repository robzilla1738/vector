#!/bin/sh
set -eu
# Deferred queued recipe successor. The original, never-executed recipe is pinned
# in aux-native-fresh-target-cohort-lease/baseline/queued-typecheck.sh.
repo=$(git rev-parse --show-toplevel)
exec sh "$repo/docs/integration/proposed/aux-native-fresh-target-cohort-lease/typecheck.sh"
