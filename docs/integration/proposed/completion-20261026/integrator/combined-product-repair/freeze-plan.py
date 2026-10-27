#!/usr/bin/env python3
"""Freeze exact replacement inputs and receipt; does not modify or sign the app."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[6]
APP=ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
BASE='Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/'
def pin(path):
 p=Path(path).resolve();assert p.is_file();return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
p=argparse.ArgumentParser()
for name in ['index','entry','signed-receipt','receipt-directory','out']:p.add_argument('--'+name,required=True)
p.add_argument('--framework');p.add_argument('--daemon-executable');p.add_argument('--session-route')
p.add_argument('--shortcut-capture');p.add_argument('--extension-manifest');p.add_argument('--background');p.add_argument('--tabsearch');p.add_argument('--source-evidence',action='append',required=True)
p.add_argument('--framework-resources-pak')
p.add_argument('--resource',action='append',default=[],help='TARGET=SOURCE for an extension script or daemon skill leaf')
p.add_argument('--remove',action='append',default=[],help='enumerated legacy leaf to delete')
a=p.parse_args();assert Path(a.receipt_directory).name==a.receipt_directory
receipt_pin=pin(a.signed_receipt);receipt=json.loads(Path(a.signed_receipt).read_text());assert receipt['passed']
rows={r['path']:r for r in receipt['files']}
inputs=[(BASE+'index.mjs',a.index),(BASE+'aux-native-entry.mjs',a.entry)]
if a.framework:inputs.insert(0,('Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework',a.framework))
if a.framework_resources_pak:assert a.framework;inputs.append(('Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Resources/resources.pak',a.framework_resources_pak))
if a.daemon_executable:inputs.insert(0,('Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon',a.daemon_executable))
if a.session_route:inputs.append(('Contents/Resources/aux/apps/extension/dist/assets/_sessionId-ClN_BWh5.js',a.session_route))
if a.tabsearch:inputs.append(('Contents/Resources/aux/apps/extension/dist/assets/tabsearch-3k_2hgil.js',a.tabsearch))
if a.background:inputs.append(('Contents/Resources/aux/apps/extension/dist/background.js',a.background))
if a.extension_manifest:inputs.append(('Contents/Resources/aux/apps/extension/dist/manifest.json',a.extension_manifest))
if a.shortcut_capture:inputs.append(('Contents/Resources/aux/apps/extension/dist/assets/use-shortcut-capture-DGr8Ws5Z.js',a.shortcut_capture))
for item in a.resource:
 target,source=item.split('=',1);assert target not in {t for t,_ in inputs};inputs.append((target,source))
replacements=[]
for target,source in inputs:
 assert rows[target]['type']=='file' and not (APP/target).is_symlink()
 assert pin(APP/target)['sha256']==rows[target]['sha256']
 replacements.append({'target':target,'input':pin(source),'beforeSha256':rows[target]['sha256']})
executor=Path(__file__).resolve().with_name('repair-combined.py')
removals=[{'target':x,'beforeSha256':rows[x]['sha256']} for x in a.remove]
plan={'format':'aux.combined-product.same-scope-repair.v1','app':str(APP),'approvedReviewSha256':'20572af30ef6613f1fc8bced01edada6d52f4b3f7c1f21dd97fb610ec2b257f2','executor':pin(executor),'signedReceipt':receipt_pin,'replacements':replacements,'removals':removals,'sourceEvidence':[pin(x) for x in a.source_evidence],'receiptDirectory':a.receipt_directory}
with Path(a.out).open('x') as f:json.dump(plan,f,indent=2);f.write('\n')
print(json.dumps(pin(a.out)))
