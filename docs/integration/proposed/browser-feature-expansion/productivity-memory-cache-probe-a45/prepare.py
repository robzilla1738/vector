#!/usr/bin/env python3
"""One exact paired-source adaptation; no daemon, native or credential execution."""
from pathlib import Path
import argparse, hashlib, json, tempfile
HERE=Path(__file__).resolve().parent
PACKAGE=Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development')
PINS={'index.mjs':'6585ab560a1f987940141c870105e2db2b160b7e465d55490be2c6c12c0b4f9f','aux-native-entry.mjs':'9827a7833c9f42905363aa0207da5f11c9a621347dadd13c0fcceb3d424d8cee'}
BEFORE='if(this.options.kind===`runtime`&&process.platform===`darwin`){let ti=path.join(ei,`aux-memory`),ni=!0;'
PREDICATE=(HERE/'predicate.mjs').read_text().removeprefix('export ').strip()
AFTER='if(this.options.kind===`runtime`&&process.platform===`darwin`&&!('+PREDICATE+")(()=>process._linkedBinding('aux_owned_native'))){let ti=path.join(ei,`aux-memory`),ni=!0;"
def sha(data):return hashlib.sha256(data).hexdigest()
parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);args=parser.parse_args()
if args.output:output=args.output;output.mkdir(parents=True,exist_ok=False)
else:output=Path(tempfile.mkdtemp(prefix='aux-memory-cache-probe-a45-',dir='/private/tmp'))
rows=[]
for leaf,pin in PINS.items():
 source=PACKAGE/leaf;original=source.read_bytes()
 if sha(original)!=pin:raise SystemExit(f'Input changed: {source}')
 text=original.decode()
 if text.count(BEFORE)!=1:raise SystemExit(f'Anchor count changed: {source}')
 result=text.replace(BEFORE,AFTER).encode();target=output/leaf;target.write_bytes(result)
 # Exact reverse replay additionally proves there is no collateral source delta.
 if result.decode().replace(AFTER,BEFORE).encode()!=original:raise SystemExit('Reverse replay mismatch')
 rows.append({'input':str(source),'inputSha256':pin,'output':str(target),'outputSha256':sha(result),'anchors':[{'before':BEFORE,'after':AFTER,'count':1}]})
plan={'format':'aux.memory.unused-cache-probe-adaptation.v1','predicateInput':{'path':str(HERE/'predicate.mjs'),'sha256':sha((HERE/'predicate.mjs').read_bytes())},'files':rows,'ordinaryFixedHelperOnly':True,'absentBindingUsesOriginalProbe':True,'nativeValidationChanged':False,'generalExecEnabled':False,'productExecuted':False}
(HERE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
print(json.dumps({'outputDirectory':str(output),'files':[{k:r[k] for k in ['output','outputSha256']}for r in rows]}))
