#!/usr/bin/env python3
"""Pinned paired account bootstrap adaptation. Never run a product."""
from pathlib import Path
import argparse,hashlib,json,tempfile
HERE=Path(__file__).resolve().parent
PACKAGE=Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development')
PINS={'index.mjs':'e51c0d9f8df78f50b576421a9695b1572aee793d746a6c1e740432321e5c8e78','aux-native-entry.mjs':'e7e20d7690a886af1ac124c503a155aa4f74b999a47f743138a4fbfaf82f15a5'}
BEFORE='function initAccountDirectory(Cn){mkdirSync(auxControlAccountRoot(Cn),{recursive:!0});'
HELPER=(HERE/'account-directories.js').read_text()
AFTER=HELPER+'\nfunction initAccountDirectory(Cn){auxEnsurePrivateMemoryAccountDirectories(Cn);mkdirSync(auxControlAccountRoot(Cn),{recursive:!0});'
def sha(data):return hashlib.sha256(data).hexdigest()
parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);args=parser.parse_args()
if args.output:output=args.output;output.mkdir(parents=True,exist_ok=False)
else:output=Path(tempfile.mkdtemp(prefix='aux-memory-account-directories-a46-',dir='/private/tmp'))
rows=[]
for leaf,pin in PINS.items():
 src=PACKAGE/leaf;data=src.read_bytes()
 if sha(data)!=pin:raise SystemExit(f'Input changed: {src}')
 text=data.decode()
 if text.count(BEFORE)!=1:raise SystemExit('Account bootstrap anchor count changed')
 result=text.replace(BEFORE,AFTER).encode();dst=output/leaf;dst.write_bytes(result)
 if result.decode().replace(AFTER,BEFORE).encode()!=data:raise SystemExit('Reverse replay differs')
 rows.append({'input':str(src),'inputSha256':pin,'output':str(dst),'outputSha256':sha(result),'anchors':[{'before':BEFORE,'after':AFTER,'count':1}]})
plan={'format':'aux.memory.private-account-bootstrap.v1','helperInput':{'path':str(HERE/'account-directories.js'),'sha256':sha((HERE/'account-directories.js').read_bytes())},'files':rows,'nativeGuardChanged':False,'ownerFilesRead':False,'productExecuted':False}
(HERE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');print(json.dumps({'directory':str(output),'files':[{k:r[k] for k in ['output','outputSha256']}for r in rows]}))
