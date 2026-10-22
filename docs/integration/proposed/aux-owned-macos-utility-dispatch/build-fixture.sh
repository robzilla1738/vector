#!/bin/sh
set -eu
proposal="$1"
headers="$2"
output="$3"
xcrun clang++ -std=c++17 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -Wall -Wextra -Werror -fPIC -I "$headers" -c "$proposal/aux-owned-napi-adapter/source/aux-owned-napi-adapter.cc" -o "$output/adapter.o"
xcrun clang++ -std=c++17 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -Wall -Wextra -Werror -fPIC -I "$headers" -c "$proposal/aux-owned-macos-utility-dispatch/tests/fixture-module.cc" -o "$output/module.o"
xcrun swiftc -target arm64-apple-macos13.0 -module-name AuxOwnedUtilityFixture -D AUX_MINIMAL_RUNTIME_DISPATCH -D AUX_SCOPED_SECURE_STORE_DISPATCH -D AUX_MACOS_UTILITY_DISPATCH -emit-library -framework AppKit -framework QuickLookThumbnailing -framework ImageIO \
 "$proposal/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$proposal/aux-native-p256-envelope-port/source/RecoveredP256Authority.swift" \
 "$proposal/aux-native-p256-envelope-port/source/AuxNativeEnvelopeV2.swift" \
 "$proposal/aux-native-pq-continuation/source/PqEnvelopeRecords.swift" \
 "$proposal/aux-native-pq-continuation/source/RecoveredPqAuthority.swift" \
 "$proposal/aux-native-signing-port/source/RecoveredP256SigningAuthority.swift" \
 "$proposal/aux-native-signing-port/source/RecoveredPqSigningAuthority.swift" \
 "$proposal/aux-installation-command-core/source/AuxInstallationCommandCore.swift" \
 "$proposal/aux-runtime-target-capture/source/AuxRuntimeTargetCapture.swift" \
 "$proposal/aux-native-secure-store/source/AuxSecureStore.swift" \
 "$proposal/aux-scoped-secure-dispatch/source/ScopedAuxCommandContext.swift" \
 "$proposal/aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift" \
 "$proposal/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift" \
 "$proposal/aux-native-macos-utilities/source/AuxOSJobCustody.swift" \
 "$proposal/aux-native-macos-utilities/source/AuxMacOSUtilityCommandCore.swift" \
 "$proposal/aux-native-macos-utilities/source/AuxUtilityCompletion.swift" \
 "$proposal/aux-native-macos-utilities/source/AuxAppKitUtilityBoundary.swift" \
 "$proposal/aux-owned-macos-utility-dispatch/tests/RuntimeUtilitySyntheticOwner.swift" \
 "$output/adapter.o" "$output/module.o" -Xlinker -undefined -Xlinker dynamic_lookup -Xlinker -lc++ \
 -o "$output/aux-synthetic-fixture.node"
