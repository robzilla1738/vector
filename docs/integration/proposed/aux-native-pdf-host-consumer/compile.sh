#!/bin/bash
set -euo pipefail
proposal="$1";headers="$2";output="$3"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -fPIC -c "$proposal/aux-native-pdf-host-consumer/source/AuxLoadedPdfLifetime.cc" -o "$output/pdf-lifetime.o"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$proposal/aux-owned-napi-adapter/source" -c "$proposal/aux-development-worker-host/source/AuxDevelopmentWorkerHost.cc" -o "$output/worker.o"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -DAUX_PDF_HOST_CONSUMER_FIXTURE -fPIC -I "$headers" -c "$proposal/aux-native-pdf-host-consumer/tests/fixture.cc" -o "$output/fixture.o"
xcrun clang++ -arch arm64 -mmacosx-version-min=13.0 -bundle -undefined dynamic_lookup "$output/pdf-lifetime.o" "$output/fixture.o" -o "$output/Probe.app/Contents/Resources/native/consumer.node"
