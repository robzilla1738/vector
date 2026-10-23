#!/usr/bin/env python3
import argparse,hashlib,json,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
parser=argparse.ArgumentParser()
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
output=args.output.resolve()
assert not output.exists()
subprocess.run(['python3',str(HERE/'verify.py')],check=True)
pins=json.loads((HERE/'inputs.json').read_text())
parent=REPO/'out/native-reuse-composition-aux-worker-app-submission/owner'
manifest=parent/'manifest.json'
assert sha(manifest)=='2bab7214042dbf2fead85cd9e1925cbbeaf3f56c0ce4ccbbd3b1d935f073bc76'
metadata=output.with_name(output.name+'-metadata.json')
metadata.write_text(json.dumps({'version':1,'files':[{'path':r['path'],'baselineSha256':r['inputSha256'],'outputSha256':r['outputSha256']}for r in pins['files']]},indent=2)+'\n')
subprocess.run(['python3',str(REPO/'scripts/extend-provided-native.py'),str(parent),'--patch',str(HERE/'followup.patch'),'--metadata',str(metadata),'--output',str(output),'--staged-base'],check=True)
result=output/'manifest.json';final=json.loads(result.read_text());before=json.loads(manifest.read_text())
assert len(final['files'])==808 and final['binaryAssets']==before['binaryAssets']
assert len(final['binaryAssets'])==23
review={'format':'aux.worker-identity.composition.v1','parentManifestSha256':sha(manifest),'composition':str(output),'compositionSha256':sha(result),'sourceRecords':808,'assets':23,'changedSources':[r['path']for r in pins['files']],'applied':False,'compiled':False,'appAccepted':False,'state2Authorized':False,'uiChanged':False}
(HERE/'composition-review.json').write_text(json.dumps(review,indent=2)+'\n')
print(json.dumps(review))
