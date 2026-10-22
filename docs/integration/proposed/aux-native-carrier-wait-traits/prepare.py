#!/usr/bin/env python3
"""Prepare two exact blocking-wait task-trait edits; no native mutation."""
import argparse,hashlib,importlib.util,json,subprocess,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
def sha(x):return hashlib.sha256(x).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--artifact-root',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
 repo=a.artifact_root.resolve();out=a.output.resolve();pins=json.loads((HERE/'inputs.json').read_text())
 parent=repo/'out/native-reuse-composition-aux-carrier-custody-style-repair';raw=(parent/'manifest.json').read_bytes()
 if sha(raw)!=pins['parentSha256']:raise ValueError('Parent differs')
 manifest=json.loads(raw);native=Path(manifest['sourceRoot'])
 if out.exists() or out==native or native in out.parents:raise ValueError('Fresh output required')
 if sha((repo/'scripts/extend-provided-native.py').read_bytes())!=pins['extenderSha256']:raise ValueError('Extender differs')
 spec=importlib.util.spec_from_file_location('extend',repo/'scripts/extend-provided-native.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
 before={};after={}
 for item in pins['edits']:
  name=Path(item['path']);before[name]=e.read_source(native,name)
  if sha(before[name])!=item['sourceSha256']:raise ValueError('Native source differs')
  text=before[name].decode()
  if text.count(item['find'])!=1:raise ValueError('Trait anchor differs')
  after[name]=text.replace(item['find'],item['replace']).encode()
 records=[{'path':str(n),'baselineSha256':sha(before[n]),'outputSha256':sha(after[n])} for n in before]
 with tempfile.TemporaryDirectory(prefix='aux-carrier-traits-') as temp:
  temp=Path(temp);patch=e.cumulative_patch(before,after);(temp/'traits.patch').write_bytes(patch);(temp/'metadata.json').write_text(json.dumps({'version':1,'files':records},indent=2)+'\n')
  subprocess.run(['python3',str(repo/'scripts/extend-provided-native.py'),str(parent),'--patch',str(temp/'traits.patch'),'--metadata',str(temp/'metadata.json'),'--output',str(out)],check=True)
  (out/'traits.patch').write_bytes(patch);(out/'traits-metadata.json').write_bytes((temp/'metadata.json').read_bytes())
  result=json.loads((out/'manifest.json').read_text());result['steps'][-1]['patch']=str(out/'traits.patch');(out/'manifest.json').write_text(json.dumps(result,indent=2)+'\n')
 for n in before:
  for kind,data in [('review-before',before[n]),('review-after',after[n])]:
   target=out/kind/n;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 receipt={'version':1,'parentCompositionSha256':sha(raw),'successorCompositionSha256':sha((out/'manifest.json').read_bytes()),'verifiedSources':len(result['files']),'binaryAssetsUnchanged':len(result['binaryAssets']),'changedSources':2,'countPerEdit':1,'appliedToNative':False,'compiled':False,'fixturesExecuted':False,'backupMapping':[{**r,'backup':str(Path('review-before')/r['path'])} for r in records]}
 (out/'review-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
if __name__=='__main__':main()
