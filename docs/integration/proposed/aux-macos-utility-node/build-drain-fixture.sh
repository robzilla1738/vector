#!/bin/sh
set -eu
base="$1";headers="$2";output="$3";here="$base/aux-macos-utility-node"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$here/source" -c "$here/source/AuxMacUtilityEnvironmentHost.cc" -o "$output/host.o"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$here/source" -c "$here/tests/module.cc" -o "$output/fixture.o"
xcrun swiftc -target arm64-apple-macos13.0 -module-cache-path "$output/cache" -emit-library "$base/aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift" "$base/aux-native-macos-utilities/source/AuxOSJobCustody.swift" "$base/aux-native-macos-utilities/source/AuxMacOSUtilityCommandCore.swift" "$base/aux-native-macos-utilities/source/AuxUtilityCompletion.swift" "$here/tests/CapturedUtilityOwner.swift" "$output/host.o" "$output/fixture.o" -Xlinker -undefined -Xlinker dynamic_lookup -Xlinker -lc++ -o "$output/drain-fixture.node"
