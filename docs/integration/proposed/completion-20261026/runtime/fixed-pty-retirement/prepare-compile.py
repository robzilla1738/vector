#!/usr/bin/env python3
"""Freeze actual historical compiler flags for two root-only object checks."""
from pathlib import Path
import copy,hashlib,json
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-pty-retirement'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
worker_recipe=ROOT/'docs/integration/proposed/completion-20261026/runtime/final-daemon/daemon-recipe.json'
pty_receipt=ROOT/'docs/integration/proposed/aux-pty-module-artifact/evidence/artifact-receipt.json'
w=json.loads(worker_recipe.read_text());p=json.loads(pty_receipt.read_text())
out='/private/tmp/aux-fixed-pty-retirement-compile-20261026-a1'
wc=copy.deepcopy(w['commands'][0]);assert wc.count('-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1')==1;wc[wc.index('-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1')]='-DAUX_BROWSER_ONLY_NATIVE_STARTUP=0';source=next(x for x in wc if x.endswith('.cc'));wc[wc.index(source)]=str(TARGET/'source/AuxDevelopmentWorkerHost.cc');wc.insert(1,'-I'+str(TARGET/'source'))
for flag,name in [('-o','worker-host.o'),('-MF','worker-host.d')]:wc[wc.index(flag)+1]=out+'/'+name
pc=copy.deepcopy(next(c for c in p['commands'] if '-c' in c));source=next(x for x in pc if x.endswith('.cc'));pc[pc.index(source)]=str(TARGET/'source/pty-linked.cc');pc.insert(1,'-I'+str(ROOT/'docs/integration/proposed/aux-node-pty-direct-child/source'));pc[pc.index('-o')+1]=out+'/pty-linked.o';pc+=['-MMD','-MF',out+'/pty-linked.d']
pins={str(worker_recipe):sha(worker_recipe),str(pty_receipt):sha(pty_receipt)}
pins.update(w['headerAndIncludePins']);pins.update(w['closureInputHashes'])
roots={'workspace':ROOT,'node':ROOT/'out/aux-node-static-26.5.0/node-v26.5.0','addon':Path('/private/tmp/aux-node-pty-build-deps-20261023/node_modules/node-addon-api')}
for item in p['inputs']:
 path=roots[item['root']]/item['path'];assert sha(path)==item['sha256'],str(path);pins[str(path)]=item['sha256']
for path in (HERE/'source').iterdir():pins[str(TARGET/'source'/path.name)]=sha(path)
pins[str(ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-pty-linked/source/AuxFixedPtyLinked.inc')]=sha(HERE.parent/'fixed-pty-linked/source/AuxFixedPtyLinked.inc')
# Quote include for unchanged registration resolves through this explicit frozen lane.
wc.insert(1,'-I'+str(ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-pty-linked/source'))
for command in [pc,wc]:pins[command[0]]=sha(Path(command[0]))
value={'format':'aux.fixed-pty-retirement-object-only-recipe.v1','output':out,'commands':[pc,wc],'inputHashes':pins,'sourceLineage':{'pty':str(pty_receipt),'worker':str(worker_recipe)},'linked':False,'activated':False,'EntitlementRequired':True,'candidateChanged':False,'reviewChanged':False,'workerProofVariant':{'inheritedActualFlag':'-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1','objectOnlyFlag':'-DAUX_BROWSER_ONLY_NATIVE_STARTUP=0','reason':'Type-check the genuine supervised linked/retirement paths; no link/projection/activation, frozen browser-only candidate untouched'}}
(HERE/'compile-recipe.json').write_text(json.dumps(value,indent=2)+'\n')
