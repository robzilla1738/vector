#!/bin/sh
set -eu
base="$1";headers="$2";output="$3"
here="$base/aux-macos-utility-node"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$here/source" -c "$here/source/AuxMacUtilityEnvironmentHost.cc" -o "$output/host.o"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$here/source" -c "$here/source/utility-module.cc" -o "$output/module.o"
set -- "$base/aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift" "$base/aux-native-macos-utilities/source/AuxOSJobCustody.swift" "$base/aux-native-macos-utilities/source/AuxMacOSUtilityCommandCore.swift" "$base/aux-native-macos-utilities/source/AuxUtilityCompletion.swift"
xcrun swiftc -target arm64-apple-macos13.0 -module-cache-path "$output/cache" -emit-library "$@" "$base/aux-native-macos-utilities/source/AuxAppKitUtilityBoundary.swift" "$here/source/AuxMacUtilityOwner.swift" "$output/host.o" "$output/module.o" -framework AppKit -framework QuickLookThumbnailing -framework ImageIO -Xlinker -undefined -Xlinker dynamic_lookup -Xlinker -lc++ -o "$output/aux-macos-utilities.node"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$here/source" -c "$here/tests/module.cc" -o "$output/fixture.o"
xcrun swiftc -target arm64-apple-macos13.0 -module-cache-path "$output/cache" -emit-library "$@" "$here/tests/CapturedUtilityOwner.swift" "$output/host.o" "$output/fixture.o" -Xlinker -undefined -Xlinker dynamic_lookup -Xlinker -lc++ -o "$output/fixture.node"

xcrun swiftc -target arm64-apple-macos13.0 -module-cache-path "$output/cache" -emit-library "$@" "$here/tests/CapturedUtilityOwner.swift" "$output/host.o" "$output/module.o" -Xlinker -undefined -Xlinker dynamic_lookup -Xlinker -lc++ -o "$output/route.node"
