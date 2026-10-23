#!/usr/bin/env python3
"""Execute only pure Swift parser/captured metadata fixtures with the Swift interpreter."""
from pathlib import Path
import hashlib,json,subprocess,tempfile
here=Path(__file__).resolve().parent
repo=here.parents[3]
pins=json.loads((here/'inputs.json').read_text())
for name,expected in pins['files'].items():
    assert hashlib.sha256((repo/name).read_bytes()).hexdigest()==expected,name
loader=(here/'source/AuxSignedFreshBootstrapPolicyLoader.swift').read_text()
assert loader.count('try validateFreshBootstrapRebuiltDaemonRoute(policy)')==2
assert loader.index('try validateFreshBootstrapRebuiltDaemonRoute(policy)') < loader.index('try images(bundle:bundle,policy:policy,requirement:requirement,preparing:preparing)')
with tempfile.TemporaryDirectory(prefix='aux-pty-policy-pure-') as raw:
    source=Path(raw)/'main.swift'
    source.write_bytes(b'\n'.join((repo/name).read_bytes() for name in pins['pureSwiftSources']))
    command=['xcrun','swift',str(source)]
    result=subprocess.run(command,text=True,capture_output=True)
    print(result.stdout,end='')
    print(result.stderr,end='')
    evidence={'format':'aux.rebuilt.pty.policy.pure-check.v1','sourcePins':pins['files'],'interpreter':['xcrun','swift','<private-temporary-main.swift>'],'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr,'liveSecurityCalls':False,'moduleLoaded':False,'signed':False,'activePolicyChanged':False}
    (here/'evidence/pure-check.json').write_text(json.dumps(evidence,indent=2)+'\n')
    raise SystemExit(result.returncode)
