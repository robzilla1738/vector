#!/usr/bin/env python3
"""Register the two new owned-helper headers in an unapplied composition."""
from pathlib import Path
import importlib.util,json,hashlib,tempfile,subprocess
root=Path(__file__).resolve().parents[4]
parent=root/'out/native-reuse-composition-aux-owned-helper-drain'
out=root/'out/native-reuse-composition-aux-owned-helper-drain-gn'
sha=lambda x:hashlib.sha256(x).hexdigest()
assert sha((parent/'manifest.json').read_bytes())=='c3b9a90bd381fe36469289739df5083f1cc814a973c612e3aabc107e42923147'
spec=importlib.util.spec_from_file_location('e',root/'scripts/extend-provided-native.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
native=Path(json.loads((parent/'manifest.json').read_text())['sourceRoot']);name=Path('chrome/browser/aux/BUILD.gn');before=e.read_source(native,name)
a='    "daemon_supervisor.h",\n';b=a+'    "direct_daemon_quiesce_result.h",\n    "owned_direct_helper_quiesce.h",\n'
assert before.decode().count(a)==1
after=before.decode().replace(a,b).encode()
with tempfile.TemporaryDirectory(prefix='aux-helper-gn-') as raw:
 t=Path(raw);patch=e.cumulative_patch({name:before},{name:after});meta={'version':1,'files':[{'path':str(name),'baselineSha256':sha(before),'outputSha256':sha(after)}]};(t/'gn.patch').write_bytes(patch);(t/'metadata.json').write_text(json.dumps(meta,indent=2)+'\n')
 subprocess.run(['python3',str(root/'scripts/extend-provided-native.py'),str(parent),'--staged-base','--patch',str(t/'gn.patch'),'--metadata',str(t/'metadata.json'),'--output',str(out)],check=True)
 (out/'gn.patch').write_bytes(patch);(out/'gn-metadata.json').write_text(json.dumps(meta,indent=2)+'\n');m=json.loads((out/'manifest.json').read_text());m['steps'][-1]['patch']=str(out/'gn.patch');(out/'manifest.json').write_text(json.dumps(m,indent=2)+'\n')
 for kind,data in [('review-before',before),('review-after',after)]:
  target=out/kind/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 result={'format':'aux.owned-helper.gn-review.v1','parentSha256':sha((parent/'manifest.json').read_bytes()),'successorSha256':sha((out/'manifest.json').read_bytes()),'gnBeforeSha256':sha(before),'gnAfterSha256':sha(after),'exactOneAnchor':True,'registeredHeaders':['direct_daemon_quiesce_result.h','owned_direct_helper_quiesce.h'],'sources':len(m['files']),'unchangedArt':len(m['binaryAssets']),'applied':False,'compiled':False}
 (out/'gn-review.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
