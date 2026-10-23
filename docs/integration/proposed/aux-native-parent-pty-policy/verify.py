#!/usr/bin/env python3
from pathlib import Path
import hashlib
import json
here=Path(__file__).resolve().parent
repo=here.parents[3]
pins=json.loads((here/'inputs.json').read_text())
for section in ('files','baseline'):
    for name,expected in pins[section].items():
        assert hashlib.sha256((repo/name).read_bytes()).hexdigest()==expected,name
base=(repo/'docs/integration/proposed/aux-native-parent-cold-launch/source/AuxAuthenticatedChildParentPolicyReader.swift').read_text()
source=(here/'source/AuxAuthenticatedChildParentPolicyReader.swift').read_text()
old='            guard policy.role == .daemon, policy.embeddedDaemon else { return -1 }'
new='''            let format = try strictEnvelopeObject(bytes)["format"] as? String
            guard policy.role == .daemon, policy.embeddedDaemon,
                  format == "aux.fresh.bootstrap.policy.v2" || format == "aux.fresh.bootstrap.policy.v3",
                  format != "aux.fresh.bootstrap.policy.v3" || policy.ptyArtifacts != nil
            else { return -1 }'''
assert source.count(new)==1 and source.replace(new,old)==base
assert source.count('@_cdecl("AuxCopyAuthenticatedFreshChildParentDescriptor")')==1
assert source.count('@_cdecl("AuxValidateEmbeddedNativeDaemonLaunchPolicy")')==1
assert (here/'source/AuxFreshBootstrapPolicy.swift').read_bytes()==(repo/'docs/integration/proposed/aux-native-embedded-pty-policy/source/AuxFreshBootstrapPolicy.swift').read_bytes()
# New format is interpreted by the actual strict decoder, not a parent bool.
assert 'let ptyVersion=object["format"] as? String=="aux.fresh.bootstrap.policy.v3"' in (here/'source/AuxFreshBootstrapPolicy.swift').read_text()
print('PASS: exact c0bd parent wrapper+guest proof with strict v2/v3 decoder pairing; uncompiled/unexecuted')
