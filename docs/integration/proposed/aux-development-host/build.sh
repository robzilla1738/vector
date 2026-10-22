#!/bin/sh
set -eu
proposal="$1"
headers="$2"
output="$3"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -fPIC -c "$proposal/aux-clean-host-preflight/source/AuxCleanHostImports.cc" -o "$output/imports.o"
xcrun clang++ -std=c++17 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$proposal/aux-owned-napi-adapter/source" -c "$proposal/aux-owned-napi-adapter/source/aux-owned-napi-adapter.cc" -o "$output/adapter.o"
xcrun clang++ -std=c++17 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$proposal/aux-owned-napi-adapter/source" -c "$proposal/aux-development-host/source/aux-development-host-attach.cc" -o "$output/attach.o"
set -- \
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
 "$proposal/aux-development-host/source/AuxDevelopmentPolicy.swift" \
 "$proposal/aux-development-host/source/AuxSignedDevelopmentPolicyLoader.swift" \
 "$proposal/aux-development-host/source/AuxSignedDevelopmentOwner.swift"
xcrun swiftc -target arm64-apple-macos13.0 -module-cache-path "$output/cache" -module-name AuxSignedDevelopmentRuntime -D AUX_MINIMAL_RUNTIME_DISPATCH -D AUX_SCOPED_SECURE_STORE_DISPATCH -D AUX_MACOS_UTILITY_DISPATCH -framework AppKit -framework QuickLookThumbnailing -framework ImageIO -emit-library "$@" "$output/imports.o" "$output/adapter.o" "$output/attach.o" -Xlinker -undefined -Xlinker dynamic_lookup -Xlinker -lc++ -o "$output/aux-runtime-owned.node"
xcrun swiftc -target arm64-apple-macos13.0 -module-cache-path "$output/cache" -D AUX_MINIMAL_RUNTIME_DISPATCH -D AUX_SCOPED_SECURE_STORE_DISPATCH -D AUX_MACOS_UTILITY_DISPATCH -framework AppKit -framework QuickLookThumbnailing -framework ImageIO "$@" "$proposal/aux-development-host/tests/main.swift" "$output/imports.o" -o "$output/public-fixture"
