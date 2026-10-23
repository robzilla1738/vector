#!/bin/sh
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo=$(git -C "$here" rev-parse --show-toplevel)
out=$(mktemp -d /tmp/aux-async-profile-admission.XXXXXX)
trap 'rm -rf "$out"' EXIT
mkdir -p "$out/include/chrome/browser/profiles"
ln -s "$here/source/aux_async_profile_creation_admission.h" "$out/include/chrome/browser/profiles/aux_async_profile_creation_admission.h"
python3 "$repo/scripts/native-build.py" xcrun clang++ -std=c++20 -Wall -Wextra -Werror -pthread -I "$out/include" "$here/source/aux_async_profile_creation_admission.cc" "$here/tests/admission.cc" -o "$out/admission"
"$out/admission" close
"$out/admission" observation
printf '%s\n' 'PASS: actual production admission and initialization observers; concurrent close and sticky unknown, no native profile/OS actions'
