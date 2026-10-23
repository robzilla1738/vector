#!/usr/bin/env python3
from pathlib import Path
import argparse,json,hashlib,subprocess,tempfile
P=Path(__file__).resolve().parent;sha=lambda x:hashlib.sha256(x).hexdigest();m=json.loads((P/'manifest.json').read_text());a=argparse.ArgumentParser();a.add_argument('--artifact-root',type=Path,required=True);a.add_argument('--output',type=Path,required=True);o=a.parse_args();repo=o.artifact_root.resolve();parent=repo/m['parentComposition'];raw=(parent/'manifest.json').read_bytes();assert sha(raw)==m['parentCompositionSha256'];old=json.loads(raw);assert len(old['files'])==778 and len(old['binaryAssets'])==23;assert sha((repo/'scripts/extend-provided-native.py').read_bytes())==m['extenderSha256']
subprocess.run(['python3',str(P/'verify.py')],check=True)
with tempfile.TemporaryDirectory(prefix='aux-worker-compose-') as d:
 meta=Path(d)/'metadata.json';meta.write_text(json.dumps({'version':1,'files':[{'path':x['path'],'baselineSha256':x['baselineSha256'],'outputSha256':x['sourceSha256']} for x in m['files']]},indent=2)+'\n')
 subprocess.run(['python3',str(repo/'scripts/extend-provided-native.py'),str(parent),'--staged-base','--patch',str(P/'native.patch'),'--metadata',str(meta),'--output',str(o.output.resolve())],check=True)
 (o.output/'service-worker-start-admission.patch').write_bytes((P/'native.patch').read_bytes());(o.output/'service-worker-start-admission-metadata.json').write_bytes(meta.read_bytes())
p=o.output/'manifest.json';new=json.loads(p.read_text());new['steps'][-1]['patch']=str(o.output.resolve()/'service-worker-start-admission.patch');before={f['path']:f for f in old['files']};after={f['path']:f for f in new['files']};assert len(after)==len(new['files'])==781
for name,v in before.items():assert after[name]==v,name
assert new['binaryAssets']==old['binaryAssets'] and new['steps'][:-1]==old['steps'];p.write_text(json.dumps(new,indent=2)+'\n');print(json.dumps({'parentSourcesPreserved':778,'successorSources':781,'unchangedAssets':23,'successorManifestSha256':sha(p.read_bytes()),'nativeApplied':False,'workerStopped':False},indent=2))
