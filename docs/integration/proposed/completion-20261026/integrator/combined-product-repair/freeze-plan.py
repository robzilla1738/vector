#!/usr/bin/env python3
"""Freeze exact replacement inputs and receipt; does not modify or sign the app."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
APP=ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
BASE='Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/'
def pin(path):
 p=Path(path).resolve();assert p.is_file();return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
p=argparse.ArgumentParser()
for name in ['framework','index','entry','signed-receipt','receipt-directory','out']:p.add_argument('--'+name,required=True)
p.add_argument('--extension-manifest');p.add_argument('--background');p.add_argument('--tabsearch');p.add_argument('--source-evidence',action='append',required=True)
a=p.parse_args();assert Path(a.receipt_directory).name==a.receipt_directory
receipt_pin=pin(a.signed_receipt);receipt=json.loads(Path(a.signed_receipt).read_text());assert receipt['passed']
rows={r['path']:r for r in receipt['files']}
inputs=[('Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework',a.framework),(BASE+'index.mjs',a.index),(BASE+'aux-native-entry.mjs',a.entry)]
if a.tabsearch:inputs.append(('Contents/Resources/aux/apps/extension/dist/assets/tabsearch-3k_2hgil.js',a.tabsearch))
if a.background:inputs.append(('Contents/Resources/aux/apps/extension/dist/background.js',a.background))
if a.extension_manifest:inputs.append(('Contents/Resources/aux/apps/extension/dist/manifest.json',a.extension_manifest))
replacements=[]
for target,source in inputs:
 assert rows[target]['type']=='file' and not (APP/target).is_symlink()
 assert pin(APP/target)['sha256']==rows[target]['sha256']
 replacements.append({'target':target,'input':pin(source),'beforeSha256':rows[target]['sha256']})
executor=Path(__file__).resolve().with_name('repair-combined.py')
plan={'format':'aux.combined-product.same-scope-repair.v1','app':str(APP),'approvedReviewSha256':'20572af30ef6613f1fc8bced01edada6d52f4b3f7c1f21dd97fb610ec2b257f2','executor':pin(executor),'signedReceipt':receipt_pin,'replacements':replacements,'sourceEvidence':[pin(x) for x in a.source_evidence],'receiptDirectory':a.receipt_directory}
with Path(a.out).open('x') as f:json.dump(plan,f,indent=2);f.write('\n')
print(json.dumps(pin(a.out)))
