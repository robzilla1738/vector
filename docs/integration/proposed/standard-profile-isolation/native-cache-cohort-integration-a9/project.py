"""Counted native A9 composition; actual native tree is read-only input."""
import difflib,hashlib,json,runpy
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda data:hashlib.sha256(data).hexdigest()
rows=[]
for name in ['header.py','namespace.py','actors.py','async.py','renderer.py']:
 scope=runpy.run_path(str(HERE/name))
 rows.extend(scope['ROWS'])
files=[];patch=[]
for path,edits in rows:
 original=(ROOT/path).read_bytes();text=original.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:100],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 target=HERE/'source'/path
 assert target.read_bytes()==text.encode(),path
 files.append({'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':anchors})
 patch.extend(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
for name in ['aux_ui_cache_cohort.h','aux_ui_cache_cohort.cc']:
 path='components/services/storage/dom_storage/'+name
 assert not (ROOT/path).exists()
 target=HERE/'source'/path;data=target.read_bytes()
 files.append({'path':path,'inputSha256':None,'outputSha256':sha(data),'output':str(target),'create':True,'anchors':[]})
 patch.extend(difflib.unified_diff([],data.decode().splitlines(True),fromfile='/dev/null',tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-cache-cohort-integration.source.v1','nativeRoot':str(ROOT),'files':files,
 'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,
 'newPersistedMapTargetImplemented':False,'restartLeaseRecoveryImplemented':False,
 'directoryDurabilityProven':False,'activationAuthorized':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(files),'countedAnchors':sum(len(row['anchors']) for row in files)}))
