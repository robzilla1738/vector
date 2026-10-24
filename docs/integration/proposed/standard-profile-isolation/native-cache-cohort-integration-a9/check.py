"""One exact source replay, not native/product execution or acceptance."""
import hashlib,json,subprocess,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()
plan=json.loads((HERE/'source-plan.json').read_text());root=Path(plan['nativeRoot'])
tree=Path(tempfile.mkdtemp(prefix='aux-native-cache-cohort-replay-',dir='/private/tmp'))
git=lambda *args:subprocess.run(['git','-C',str(tree),*map(str,args)],check=True,capture_output=True)
for row in plan['files']:
 if row.get('create'):
  assert not (root/row['path']).exists()
  assert sha((HERE/'source'/row['path']).read_bytes())==row['outputSha256']
  continue
 data=(root/row['path']).read_bytes();assert sha(data)==row['inputSha256']
 current=data.decode()
 for anchor in row['anchors']:
  assert current.count(anchor['find'])==anchor['count']==1
  current=current.replace(anchor['find'],anchor['replace'])
 assert sha(current.encode())==row['outputSha256']
 assert (HERE/'source'/row['path']).read_bytes()==current.encode()
 p=tree/row['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
git('init','-q');git('add','--all');git('apply','--check',HERE/'native.patch');git('apply',HERE/'native.patch')
for row in plan['files']:assert sha((tree/row['path']).read_bytes())==row['outputSha256']
git('apply','--reverse','--check',HERE/'native.patch');git('diff','--check')
for row in plan['files']:
 assert (not(root/row['path']).exists()) if row.get('create') else sha((root/row['path']).read_bytes())==row['inputSha256']
result={'format':'aux.native-cache-cohort.source-check.actual.v1','passed':True,
 'sourcePlanSha256':sha((HERE/'source-plan.json').read_bytes()),'patchSha256':sha((HERE/'native.patch').read_bytes()),
 'files':len(plan['files']),'countedAnchors':sum(len(row['anchors']) for row in plan['files']),
 'replayDirectory':str(tree),'exactReplayPassed':True,'reverseCheckPassed':True,
 'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False}
(HERE/'actual-source-check-a9.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
