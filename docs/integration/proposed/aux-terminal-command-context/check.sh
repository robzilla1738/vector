#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
proposal="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-terminal-context.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun swiftc -target arm64-apple-macos13.0 \
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
 "$proposal/aux-terminal-command-context/tests/main.swift" \
 -o "$output/check"
"$output/check"
