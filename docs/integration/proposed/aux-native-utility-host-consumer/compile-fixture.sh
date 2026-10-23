#!/bin/sh
set -eu
base="$1";headers="$2";output="$3";here="$base/aux-native-utility-host-consumer"
# Build only the existing captured utility producer; never actual AppKit owner.
sh "$base/aux-macos-utility-node/build-drain-fixture.sh" "$base" "$headers" "$output"
cp "$output/drain-fixture.node" "$output/Probe.app/Contents/Resources/native/aux-macos-utilities.node"
python3 - "$here" "$output" <<'PY'
from pathlib import Path
import hashlib,sys,json
here,out=map(Path,sys.argv[1:]);raw=(out/'drain-fixture.node').read_bytes();source=(here/'source/AuxLoadedUtilityLifetime.cc').read_text()
old='7aff7611505145a5629cf42496be506200e7c1026087b2e397057e646d220e5e';assert source.count(old)==1;assert source.count('393720')==2
source=source.replace(old,hashlib.sha256(raw).hexdigest()).replace('393720',str(len(raw)))
(out/'CapturedUtilityLifetime.cc').write_text(source)
(out/'projection.json').write_text(json.dumps({'fixtureOnly':True,'projectedHash':hashlib.sha256(raw).hexdigest(),'projectedBytes':len(raw),'hashReplacementCount':1,'sizeReplacementCount':2,'productionSourceUnmodified':True},indent=2)+'\n')
PY
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -fPIC -I "$here/source" -c "$output/CapturedUtilityLifetime.cc" -o "$output/consumer.o"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -DAUX_UTILITY_HOST_CONSUMER_FIXTURE -fPIC -I "$headers" -c "$here/tests/fixture.cc" -o "$output/consumer-fixture.o"
xcrun clang++ -arch arm64 -mmacosx-version-min=13.0 -bundle -undefined dynamic_lookup "$output/consumer.o" "$output/consumer-fixture.o" -o "$output/Probe.app/Contents/Resources/native/consumer.node"
# Changed actual WorkerHost TU compile, without linking/invoking its factory.
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$base/aux-owned-napi-adapter/source" -c "$base/aux-development-worker-host/source/AuxDevelopmentWorkerHost.cc" -o "$output/worker-compile-only.o"
