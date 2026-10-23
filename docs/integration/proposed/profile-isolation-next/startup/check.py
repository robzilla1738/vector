#!/usr/bin/env python3
"""Hash-pinned source check / actual 46/47-input Swift typecheck; no execution."""
import hashlib,json,pathlib,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parents[5]
HERE=pathlib.Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
v5='--v5' in sys.argv
pins=json.loads((HERE/('integration-v5.json' if v5 else 'integration.json')).read_text())
paired=json.loads((HERE/'paired-dispatcher.json').read_text()) if v5 and (HERE/'paired-dispatcher.json').exists() else None
for row in pins['replacements']:
    assert sha(ROOT/row['before'])==row['beforeSha256'],row['before']
    assert sha(ROOT/row['after'])==row['afterSha256'],row['after']
for row in pins.get('addedSources',[]):assert sha(ROOT/row['path'])==row['sha256']
inputs=json.loads((ROOT/'docs/integration/proposed/final-completion/native-build/inputs.json').read_text())
link=inputs['link'];sources=[p for p in link if p.endswith('.swift')]
assert len(sources)==46 and len(set(sources))==46
replacements={pathlib.Path(r['before']).name:str(ROOT/r['after']) for r in pins['replacements']}
sources=[replacements.get(pathlib.Path(p).name,p) for p in sources]
if paired:
    assert sha(paired['before'])==paired['beforeSha256'] and sha(paired['after'])==paired['afterSha256']
    assert sources.count(paired['before'])==1
    sources=[paired['after'] if p==paired['before'] else p for p in sources]
if v5:sources += [str(ROOT/r['path']) for r in pins['addedSources']]
assert len(sources)==(47 if v5 else 46)
assert len([p for p in sources if str(HERE/('v5-source' if v5 else 'source')) in p])==(6 if v5 else 4)
before={p:sha(p) for p in sources}
result={'pairedDispatcher':paired,'format':'aux.profile-isolation.startup.typecheck.v1','swiftSourceCount':len(sources),'successorSourceCount':6 if v5 else 4,'sourceSha256':before,'protectedRuntimeExecuted':False,'linked':False,'signed':False}
if '--typecheck' in sys.argv:
    out=pathlib.Path('/private/tmp/aux-profile-startup-typecheck-20261023'+('-v5' if v5 else ''));out.mkdir(exist_ok=True)
    sdk=link[link.index('-sdk')+1]
    flags=[]
    for i,arg in enumerate(link):
        if arg=='-D':flags.extend(['-D',link[i+1]])
    command=[link[0],'-frontend','-typecheck','-sdk',sdk,'-target','arm64-apple-macos13.5','-module-name','AuxNativeDaemonExecutable','-module-cache-path',str(out/'swift-cache'),*flags,*sources]
    result['command']=command
    with (out/'typecheck.log').open('w') as log:
        result['exitCode']=subprocess.call(command,stdout=log,stderr=subprocess.STDOUT)
    result['logSha256']=sha(out/'typecheck.log')
    result['inputsPreserved']=all(sha(p)==h for p,h in before.items())
    (out/'results.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k not in ['command','sourceSha256']},indent=2))
    raise SystemExit(result['exitCode'] or (0 if result['inputsPreserved'] else 1))
print(f'{len(pins["replacements"])} exact replacements verified; {len(sources)} actual Swift graph sources available. No compiler/runtime invoked.')
