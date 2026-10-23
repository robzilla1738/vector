#!/usr/bin/env python3
"""Compile the paired daemon bridge without rechecking unrelated units."""
import argparse,hashlib,json,pathlib,subprocess
H=pathlib.Path(__file__).resolve().parent;P=H.parents[1]
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--authorized',required=True);p.add_argument('--output',required=True);a=p.parse_args()
A=pathlib.Path(a.authorized).resolve();O=pathlib.Path(a.output).resolve();D=A/'source/chrome/browser/aux'
receipt=json.loads((A/'receipt.json').read_text())
if not receipt['passed'] or not all(sha(p)==v for p,v in receipt['inputHashes'].items()):raise SystemExit('authorized graph changed/unverified')
if O.exists():raise SystemExit('fresh output required')
O.mkdir(mode=0o700)
old=P/'profile-isolation-next/browser-roots/evidence/native-compile.json'
prior=json.loads(old.read_text());base=next(x['command'] for x in prior['commands'] if x['name']=='daemon-AuxNativeParentConnectionBridge');base=base[:base.index('-c')]
base[1:1]=['-I',str(D)]
source=P/'profile-isolation-next/browser-roots/source/AuxNativeParentConnectionBridge.cc'
# Put the source beside the selected headers so quote-include lookup cannot
# select its historical source-folder siblings before the new include path.
staged=O/source.name;staged.write_bytes(source.read_bytes())
header=source.with_suffix('.h');paired=O/header.name;paired.write_bytes(header.read_bytes())
command=base+['-c',str(staged),'-o',str(O/'daemon-parent-bridge.o')]
frozen={str(p):sha(p) for p in [A/'receipt.json',old,source,staged,header,paired,H/'compile-bridge.py',pathlib.Path(base[0]),*(p for p in D.iterdir() if p.is_file())]}
run=subprocess.run(command,cwd=O,capture_output=True,text=True);(O/'compile.log').write_text(run.stdout+run.stderr)
unchanged=all(sha(p)==v for p,v in frozen.items())
r={'format':'aux.browser.authorized-daemon-bridge.compile.v1','passed':run.returncode==0 and unchanged,'exitCode':run.returncode,'command':command,'inputs':frozen,'inputsUnchanged':unchanged,'linked':False,'executed':False,'signed':False}
if (O/'daemon-parent-bridge.o').exists():r['objectSha256']=sha(O/'daemon-parent-bridge.o')
(O/'receipt.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'passed':r['passed'],'receipt':str(O/'receipt.json')}))
if not r['passed']:raise SystemExit(1)
