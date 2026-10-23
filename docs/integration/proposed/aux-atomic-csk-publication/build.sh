#!/bin/sh
set -eu
proposal="$1"
headers="$2"
output="$3"
for source in "$proposal/aux-owned-napi-adapter/source/aux-owned-napi-adapter.cc" "$proposal/aux-atomic-csk-publication/tests/fixture-module.cc"; do
 name=$(basename "$source" .cc)
 xcrun clang++ -std=c++17 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -DAUX_ATOMIC_CSK_DISPATCH -Wall -Wextra -Werror -fPIC -I "$headers" -c "$source" -o "$output/$name.o"
done
xcrun swiftc -target arm64-apple-macos13.0 -module-name AuxAtomicCskFixture -D AUX_MINIMAL_RUNTIME_DISPATCH -D AUX_SCOPED_SECURE_STORE_DISPATCH -D AUX_ATOMIC_CSK_DISPATCH -emit-library \
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
 "$proposal/aux-atomic-csk-publication/source/AuxAccountsCskCoordinator.swift" \
 "$proposal/aux-scoped-secure-dispatch/source/ScopedAuxCommandContext.swift" \
 "$proposal/aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift" \
 "$proposal/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift" \
 "$proposal/aux-atomic-csk-publication/tests/AtomicSyntheticOwner.swift" \
 "$output/FixtureHome.swift" \
 "$output/aux-owned-napi-adapter.o" "$output/fixture-module.o" -Xlinker -undefined -Xlinker dynamic_lookup -Xlinker -lc++ \
 -o "$output/aux-atomic-csk-fixture.node"
