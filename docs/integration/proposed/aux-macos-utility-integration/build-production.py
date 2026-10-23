#!/usr/bin/env python3
"""Retain the actual production-only utility image; never load it or build fixtures."""
import hashlib,json,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[4]
proposal=root/'docs/integration/proposed';source=proposal/'aux-macos-utility-node'
output=root/'out/aux-macos-utility-integration'
if output.exists(): raise SystemExit('Refusing existing production output')
recipe=(source/'build.sh').read_text();marker='xcrun clang++ -std=c++20 -arch arm64 -mmacosx-version-min=13.0 -DNAPI_VERSION=8 -fPIC -I "$headers" -I "$here/source" -c "$here/tests/module.cc"'
assert recipe.count(marker)==1
production=recipe[:recipe.index(marker)]
assert 'tests/' not in production and production.count('xcrun swiftc')==1
output.mkdir();(output/'build-production.sh').write_text(production)
headers=root/'out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node'
subprocess.run(['sh',str(output/'build-production.sh'),str(proposal),str(headers),str(output)],check=True,cwd=root)
image=output/'aux-macos-utilities.node';data=image.read_bytes()
inputs=[*sorted(source.glob('source/*.cc')),*sorted(source.glob('source/*.h')),source/'source/AuxMacUtilityOwner.swift',proposal/'aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift',*[proposal/'aux-native-macos-utilities/source'/f for f in ['AuxOSJobCustody.swift','AuxMacOSUtilityCommandCore.swift','AuxUtilityCompletion.swift','AuxAppKitUtilityBoundary.swift']]]
receipt={'format':'aux.macos.utility.production-build.v1','productionOnly':True,'moduleLoaded':False,'fixturesBuiltOrRun':False,'signingPerformed':False,'image':{'path':str(image.relative_to(root)),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()},'recipeSha256':hashlib.sha256(production.encode()).hexdigest(),'inputs':[{'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in inputs]}
(output/'build-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
for p in output.glob('*.o'):p.unlink()
print(json.dumps({'productionImage':receipt['image'],'moduleLoaded':False,'fixturesRun':0}))
