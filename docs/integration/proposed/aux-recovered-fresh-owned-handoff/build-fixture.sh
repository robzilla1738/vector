#!/bin/sh
set -eu
proposal="$1"
headers="$2"
output="$3"
xcrun clang++ -std=c++17 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -Wall -Wextra -Werror -fPIC -I "$headers" -c "$proposal/aux-owned-napi-adapter/source/aux-owned-napi-adapter.cc" -o "$output/adapter.o"
xcrun clang++ -std=c++17 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -Wall -Wextra -Werror -fPIC -I "$headers" -c "$proposal/aux-owned-napi-adapter/tests/fixture-module.cc" -o "$output/module.o"
xcrun swiftc -target arm64-apple-macos13.0 -module-name AuxRecoveredNapiFixture -D AUX_RECOVERED_FRESH_DISPATCH -emit-library \
 "$proposal/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$proposal/aux-native-p256-envelope-port/source/RecoveredP256Authority.swift" \
 "$proposal/aux-native-p256-envelope-port/source/AuxNativeEnvelopeV2.swift" \
 "$proposal/aux-native-p256-envelope-port/source/LegacyNativeEnvelopeReader.swift" \
 "$proposal/aux-native-pq-continuation/source/PqEnvelopeRecords.swift" \
 "$proposal/aux-native-pq-continuation/source/RecoveredPqAuthority.swift" \
 "$proposal/aux-native-pq-continuation/source/LegacyNativePqEnvelopeReader.swift" \
 "$proposal/aux-native-signing-port/source/RecoveredP256SigningAuthority.swift" \
 "$proposal/aux-native-signing-port/source/RecoveredPqSigningAuthority.swift" \
 "$proposal/aux-native-install-storage-port/source/RecoveredInstallStorageQueries.swift" \
 "$proposal/aux-native-four-row-preparation/source/CapturedInstallation.swift" \
 "$proposal/aux-installation-additive-transaction/source/AdditiveInstallationTransaction.swift" \
 "$proposal/aux-installation-security-executor/source/InstallationSecurityExecutor.swift" \
 "$proposal/aux-installation-journal-store/source/PrivateInstallationJournalStore.swift" \
 "$proposal/aux-installation-command-core/source/AuxInstallationCommandCore.swift" \
 "$proposal/aux-fresh-installation-factory/source/AuxFreshInstallationFactory.swift" \
 "$proposal/aux-fresh-four-row-preparation/source/AuxFreshFourRowPreparation.swift" \
 "$proposal/aux-fresh-installation-journal/source/FreshInstallationJournal.swift" \
 "$proposal/aux-fresh-installation-journal/source/PrivateFreshInstallationJournalStore.swift" \
 "$proposal/aux-terminal-command-context/source/CapturedTerminalCommandContext.swift" \
 "$proposal/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift" \
 "$proposal/aux-fresh-secure-recovery/source/FreshSecureStage.swift" \
 "$proposal/aux-secure-stage-binding-store/source/PrivateFreshSecureStageBindingStore.swift" \
 "$proposal/aux-fresh-security-coordinator/source/FreshDataProtectionBoundary.swift" \
 "$proposal/aux-fresh-security-coordinator/source/FreshSecurityStepCoordinator.swift" \
 "$proposal/aux-fresh-security-coordinator/source/RecoveredFreshTerminalCommandContext.swift" \
 "$proposal/aux-recovered-fresh-owned-handoff/tests/SyntheticRecoveredOwner.swift" \
 "$output/adapter.o" "$output/module.o" -Xlinker -undefined -Xlinker dynamic_lookup -Xlinker -lc++ \
 -o "$output/aux-synthetic-fixture.node"
