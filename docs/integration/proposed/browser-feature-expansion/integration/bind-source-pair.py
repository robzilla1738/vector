#!/usr/bin/env python3
"""Bind successful feature sources to the unchanged native ABI and full app."""
import argparse,hashlib,json,sys
from pathlib import Path
sys.dont_write_bytecode=True
here=Path(__file__).resolve().parent
root=here.parents[4]
sys.path.insert(0,str(here.parent/'package'))
import feature_package as package
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--native-receipt',required=True)
p.add_argument('--source-composition',required=True)
p.add_argument('--output',required=True)
a=p.parse_args()
sha=lambda path:hashlib.sha256(Path(path).read_bytes()).hexdigest()
read=lambda path:json.loads(Path(path).read_text())
protected=root/'docs/integration/proposed/profile-isolation-protected-startup/integration'
prior_path=protected/'source-pair.json';prior=read(prior_path)
composition_path=Path(a.source_composition).resolve();composition=read(composition_path)
if not composition['passed'] or composition['predecessorSourcePairSha256']!=sha(prior_path):raise RuntimeError('Exact source predecessor required')
link_path=protected/'daemon-link.json';link=read(link_path)
inputs_path=protected/'daemon-inputs.json';inputs=read(inputs_path)
if not link['passed'] or not link['inputsUnchanged'] or link['signed'] or sha(inputs_path)!=link['manifestSha256']:raise RuntimeError('Successful unchanged unsigned native daemon link required')
for path,value in inputs['frozenFiles'].items():
 if sha(path)!=value:raise RuntimeError('Native ABI link input changed: '+path)
for name in ['daemon','pty','loader']:
 if sha(prior[name])!=prior[name+'Sha256']:raise RuntimeError('Native artifact changed: '+name)
native_path=Path(a.native_receipt).resolve();native=read(native_path)
package.verify_feature_native(native,read(here/'composition.json'))
source_receipt_path=composition_path.parent/'source-receipt.json'
entry_receipt_path=composition_path.parent/'projected-entry/results.json'
source=read(source_receipt_path);entry=read(entry_receipt_path)
if not source['passed'] or not entry['passed'] or not source['coldRefusalPreserved'] or not entry['defaultEntryRefusalPreserved']:raise RuntimeError('Dormant exact source projection required')
if source['compositionReceiptSha256']!=sha(composition_path) or entry['sourceReceiptSha256']!=sha(source_receipt_path):raise RuntimeError('Projection evidence changed')
rows={item['kind']:item for item in composition['files']}
for item in rows.values():
 if sha(item['input'])!=item['beforeSha256'] or sha(item['output'])!=item['afterSha256']:raise RuntimeError('Composed source changed')
source_path=Path(rows['source']['output'])
entry_path=entry_receipt_path.parent/'aux-native-entry.mjs'
loader_path=entry_receipt_path.parent/'aux-owned-native.cjs'
if sha(source_path)!=source['composedSha256'] or entry['sourceSha256']!=source['composedSha256'] or sha(entry_path)!=entry['entrySha256'] or sha(entry_path)!=rows['entry']['afterSha256'] or sha(loader_path)!=entry['loaderSha256'] or sha(loader_path)!=prior['loaderSha256']:raise RuntimeError('Source/native entry/loader pairing differs')
result=dict(prior)
result.update(source=str(source_path),sourceSha256=sha(source_path),entry=str(entry_path),entrySha256=sha(entry_path),loader=str(loader_path),loaderSha256=sha(loader_path),
 predecessorSourcePairSha256=sha(prior_path),nativeBrowserReceiptSha256=sha(native_path),nativeBrowserBuildPending=False,uiModified=True,featureProfile='desktop-v1',
 sourceCompositionReceiptSha256=sha(composition_path),sourceReceiptSha256=sha(source_receipt_path),entryReceiptSha256=sha(entry_receipt_path),
 daemonReceiptSha256=sha(link_path),nativeAbiChanged=False,coldFeatureEnabled=False,runtimeAuthorityGranted=False)
out=Path(a.output).resolve()
with out.open('x') as file:file.write(json.dumps(result,indent=2)+'\n')
print(json.dumps({'passed':True,'sourcePair':str(out),'nativeAbiChanged':False,'productExecuted':False}))
