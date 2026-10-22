#!/bin/sh
set -eu
proposal="$1"
headers="$2"
output="$3"
here="$proposal/aux-development-worker-host"
xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$proposal/aux-owned-napi-adapter/source" -c "$here/source/AuxDevelopmentWorkerHost.cc" -o "$output/worker.o"
# Keep upstream fixtures untouched; generate an exact source-path successor of
# the existing minimal build list, replacing only its TEST module object.
python3 - "$proposal" "$output" <<'PY'
import pathlib,sys
p,o=map(pathlib.Path,sys.argv[1:])
def with_drain_type(s):
    a='"$proposal/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift"'
    b='"$proposal/aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift"'
    assert s.count(a)==1
    if s.count(b)==1:
        assert s.index(b)<s.index(a)
        return s
    assert s.count(b)==0
    return s.replace(a,b+' '+a)
s=with_drain_type((p/'aux-minimal-owned-node/build-fixture.sh').read_text())
a='"$proposal/aux-scoped-secure-dispatch/tests/fixture-module.cc"'
b='"$proposal/aux-development-worker-host/tests/fixture-module.cc"'
assert s.count(a)==1
s=s.replace(a,b).replace('-I "$headers" -c "$proposal/aux-development-worker-host/tests/fixture-module.cc"','-I "$headers" -I "$proposal/aux-development-worker-host/source" -c "$proposal/aux-development-worker-host/tests/fixture-module.cc"')
assert s.count('"$output/adapter.o" "$output/module.o"')==1
s=s.replace('"$output/adapter.o" "$output/module.o"','"$output/FixtureOwnerDrain.swift" "$proposal/aux-development-worker-host/tests/BlockingLease.swift" "$output/adapter.o" "$output/module.o" "$output/worker.o"')
(o/'fixture-build.sh').write_text(s)
drain=(p/'aux-development-worker-host/source/AuxDevelopmentOwnerDrain.swift').read_text()
a='@_cdecl("AuxCloseDevelopmentOwnerOSAdmission")'
assert drain.count(a)==1
(o/'FixtureOwnerDrain.swift').write_text(drain.replace(a,'@_cdecl("AuxFixtureActualOwnerOSAdmission")'))
# Production graph includes original signed-policy loader + real factory; no
# TEST symbols, substitute new native callback seam for old direct attach.
s=with_drain_type((p/'aux-development-host/build.sh').read_text())
s=s[:s.index('xcrun swiftc -target',s.index('xcrun swiftc -target')+1)]
s=s.replace('"$output/attach.o" -Xlinker','"$proposal/aux-development-worker-host/source/AuxDevelopmentOwnerDrain.swift" "$output/attach.o" "$output/worker.o" -Xlinker')
(o/'source-build.sh').write_text(s)
PY
sh "$output/source-build.sh" "$proposal" "$headers" "$output"
sh "$output/fixture-build.sh" "$proposal" "$headers" "$output"
