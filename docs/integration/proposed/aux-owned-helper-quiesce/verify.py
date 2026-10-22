import pathlib,json,hashlib,difflib,sys
base=pathlib.Path(__file__).resolve().parent;manifest=json.loads((base/'manifest.json').read_text());root=pathlib.Path(manifest['nativeSourceRoot']);patch=''
for record in manifest['files']:
 oldfile=base/'baseline'/record['path'];newfile=base/'source'/record['path'];old=oldfile.read_bytes() if oldfile.exists() else b'';new=newfile.read_bytes()
 assert hashlib.sha256(new).hexdigest()==record['sourceSha256'];assert (hashlib.sha256(old).hexdigest() if old else None)==record['baselineSha256'];assert (old!=new)==record['changed']
 if '--live' in sys.argv:
  live=root/record['path'];assert (live.read_bytes() if live.exists() else b'')==old,record['path']
 if record['changed']:patch+=''.join(difflib.unified_diff(old.decode().splitlines(keepends=True),new.decode().splitlines(keepends=True),fromfile='a/'+record['path'] if old else '/dev/null',tofile='b/'+record['path']))
for record in manifest['anchors']:
 oldfile=base/'baseline'/record['path'];old=oldfile.read_text() if oldfile.exists() else '';new=(base/'source'/record['path']).read_text();assert old.count(record['anchor'])==record['baselineCount'];assert new.count(record['anchor'])==record['sourceCount']
old=(base/'baseline/chrome/browser/aux/daemon_supervisor.h').read_text();block=old[old.index('// This result never attests'):old.index('\nstruct BundlePaths')];assert block in (base/'source/chrome/browser/aux/direct_daemon_quiesce_result.h').read_text()
assert (base/'native.patch').read_text()==patch;assert hashlib.sha256(patch.encode()).hexdigest()==manifest['patchSha256'];assert not manifest['allWriterCustodyClaimed']
print('PASS:5 changed native files/2 unchanged dependencies, exact anchors+patch+verbatim scoped result; no checkout mutation/build')
