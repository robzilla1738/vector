import json,hashlib,subprocess,sys,time
from pathlib import Path
W='/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/completion-20261026/runtime/addon-local-signing-review/actual-signed-source-a1/'
d=json.load(open(W+'build-receipt.json'))
sha=lambda p:hashlib.sha256(open(p,'rb').read()).hexdigest()
bad=[]
for p,h in d['inputPins'].items():
    try:
        if sha(p)!=h: bad.append(p)
    except FileNotFoundError: bad.append('MISSING '+p)
print('pin mismatches',len(bad),bad[:5])
mode=sys.argv[1]
argv=list(d['commands'][2]['argv'])
oldw='/private/tmp/aux-completion-final-daemon-20261026-a1/worker-host.o'
out_old='/private/tmp/aux-two-addon-local-signing-20261026-a1/successor/build-a2/Aux Daemon'
outdir=Path(f'/private/tmp/aux-pdf-abi-daemon-relink-20261026-{mode}');outdir.mkdir()
if mode=='new':
    i=argv.index(oldw);argv[i]='/private/tmp/aux-completion-final-daemon-pdf-abi-20261026-a1/worker-host.o'
i=argv.index(out_old);argv[i]=str(outdir/'Aux Daemon')
# swiftc may write intermediate files next to -o; also any other build-a2 outputs referenced
others=[x for x in argv if 'build-a2' in x and not x.endswith(('pdf-lifetime.o','utility-lifetime.o'))]
print('other build-a2 refs',others)
t=time.monotonic()
with open(outdir/'link.log','wb') as log: r=subprocess.run(argv,cwd=d['commands'][2]['cwd'],stdout=log,stderr=subprocess.STDOUT)
print('exit',r.returncode,round(time.monotonic()-t),'s')
if r.returncode==0: print('daemon',sha(outdir/'Aux Daemon'),'expected-original',d['outputs'][out_old])
json.dump({'argv':argv,'exit':r.returncode},open(outdir/'link-receipt.json','w'),indent=1)
