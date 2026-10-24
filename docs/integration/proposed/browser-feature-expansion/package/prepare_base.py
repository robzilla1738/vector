#!/usr/bin/env python3
"""Bind completed exact outputs into an inactive package recipe."""
import argparse,json,pathlib,importlib.util,sys
sys.dont_write_bytecode=True
P=pathlib.Path
import feature_package
m = feature_package.legacy
m.verify_frozen_native = feature_package.verify_guarded_native
p=argparse.ArgumentParser()
for name in ['baseline-app','native-receipt','daemon-receipt','source-pair','source','source-receipt','entry','entry-receipt','loader','pty','runtime-integration','runtime-evidence','output','recipe']:p.add_argument('--'+name,required=True)
a=p.parse_args();baseline=P(a.baseline_app).resolve();nr=P(a.native_receipt).resolve();dr=P(a.daemon_receipt).resolve();sr=P(a.source_receipt).resolve();er=P(a.entry_receipt).resolve()
build=json.loads(nr.read_text());link=json.loads(dr.read_text());source=json.loads(sr.read_text());entry=json.loads(er.read_text())
if not build['passed'] or not link['passed'] or not link['inputsUnchanged'] or not source['passed'] or not entry['passed']:raise ValueError('all exact builds/projections must pass')
m.verify_frozen_native(build)
m.pin(a.source,source['composedSha256']);m.pin(a.entry,entry['entrySha256']);m.pin(a.loader,entry['loaderSha256'])
if source['composedSha256']!=entry['sourceSha256'] or not source['coldRefusalPreserved'] or not entry['defaultEntryRefusalPreserved']:raise ValueError('source/entry mismatch')
# The final command pins the actual executable output directory and paired PTY module.
command=link['commands'][-1];daemon=P(command[command.index('-o')+1]);m.pin(daemon,link['executableSha256']);m.pin(a.pty,link['moduleSha256'])
native=P(build['appPath']).resolve();root=baseline/'Contents/Resources/aux';base='apps/daemon/Aux Daemon.app/Contents/'
items=[(base+'MacOS/aux-daemon',daemon,0o755),(base+'Resources/node-development/index.mjs',P(a.source),0o644),(base+'Resources/node-development/aux-native-entry.mjs',P(a.entry),0o644),(base+'Resources/native/aux-owned-native.cjs',P(a.loader),0o644),(base+'Resources/native/node-pty/prebuilds/darwin-arm64/pty.node',P(a.pty),0o755)]
replacements=[dict(path=rel,previousSha256=m.sha(root/rel),input=str(src.resolve()),sha256=m.sha(src),mode=mode) for rel,src,mode in items]
r=dict(format='aux.inactive-successor.recipe.v1',baselineApp=str(baseline),baselineInventorySha256=m.digest(m.inventory(baseline)),nativeApp=str(native),nativeInventorySha256=m.digest(m.inventory(native)),nativeReceipt=str(nr),nativeReceiptSha256=m.sha(nr),daemonReceipt=str(dr),daemonReceiptSha256=m.sha(dr),sourceReceiptSha256=m.sha(sr),entryReceiptSha256=m.sha(er),output=str(P(a.output).absolute()),replacements=replacements)
r.update(sourcePair=str(P(a.source_pair).resolve()),sourcePairSha256=m.sha(a.source_pair),sourceReceipt=str(sr),entryReceipt=str(er))
r['outerBoundary']=dict(path='Contents/Resources/package.json',input=str(baseline/'Contents/Resources/package.json'),sha256=m.sha(baseline/'Contents/Resources/package.json'),mode=0o644)
r.update(runtimeIntegrationManifest=str(P(a.runtime_integration).resolve()),runtimeIntegrationManifestSha256=m.sha(a.runtime_integration),runtimeIntegrationEvidence=str(P(a.runtime_evidence).resolve()),runtimeIntegrationEvidenceSha256=m.sha(a.runtime_evidence))
m.verify_pair(r)
m.runtime_changes(r)
with P(a.recipe).open('x') as f:f.write(json.dumps(r,indent=2)+'\n')
print('Prepared exact inactive recipe; not assembled or authorized')
