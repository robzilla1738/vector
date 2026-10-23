#!/usr/bin/env python3
"""Pure parser fixture only; no Security API or file-root admission is executed."""
import hashlib,json,pathlib,subprocess,tempfile
here=pathlib.Path(__file__).resolve().parent
root=here.parents[4]
files=[root/'docs/integration/proposed/aux-native-parent-strict-json/source/chrome/browser/aux/native_peer_policy/AuxStrictEnvelopeObject.swift',here/'source/AuxFreshBootstrapPolicy.swift',here/'source/policy-check.swift']
pins={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
with tempfile.TemporaryDirectory(prefix='aux-contained-policy-') as directory:
    main=pathlib.Path(directory)/'main.swift'
    main.write_bytes(b'\n'.join(p.read_bytes() for p in files))
    run=subprocess.run(['/usr/bin/xcrun','swift',str(main)],capture_output=True,text=True)
    unchanged=all(hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()==h for p,h in pins.items())
    evidence={'passed':run.returncode==0 and unchanged,'exitCode':run.returncode,'stdout':run.stdout,'stderr':run.stderr,'inputs':pins,'inputsUnchanged':unchanged,'liveSecurityCalls':False,'protectedIO':False,'moduleLoaded':False}
    (here/'evidence/policy-check.json').write_text(json.dumps(evidence,indent=2)+'\n')
    print(json.dumps({'passed':evidence['passed'],'stdout':run.stdout,'stderr':run.stderr}))
    raise SystemExit(0 if evidence['passed'] else 1)
