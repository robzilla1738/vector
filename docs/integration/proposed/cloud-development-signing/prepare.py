"""Prepare a copied cloud candidate and exact review. Never sign, launch or read a state home."""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,plistlib,sys
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
FRESH=ROOT/'out/provided-candidate-cloud-development'
BASE=ROOT/'out/provided-candidate-local-browser-pass/Aux.app'
OUT=ROOT/'out/cloud-development-signing-review'
P='Contents/Resources/aux/'
DAEMON=P+'apps/daemon/Aux Daemon.app'
CLI=P+'apps/cli/Aux CLI.app'
CARRIER=P+'native/Aux Native Carrier.app'
roots=[DAEMON,CLI,P+'apps/computer-use/Aux Computer Use.app',CARRIER,P+'native/libaux-native-boundary.dylib']
changes=[DAEMON+'/Contents/MacOS/aux-daemon',DAEMON+'/Contents/Resources/node-development/index.mjs',CLI+'/Contents/MacOS/aux-cli-sea']
def sha(b):return hashlib.sha256(b).hexdigest()
def inventory(root):
 result=[]
 for directory,dirs,files in os.walk(root,followlinks=False):
  for name in files+dirs:
   p=Path(directory)/name;s=p.lstat();rel=str(p.relative_to(root))
   if p.is_symlink():result.append(dict(path=rel,type='symlink',mode=s.st_mode&0o777,target=os.readlink(p)))
   elif p.is_file():result.append(dict(path=rel,type='file',mode=s.st_mode&0o777,bytes=s.st_size,sha256=sha(p.read_bytes())))
 return sorted(result,key=lambda x:x['path'])
def run(args):return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
resume=sys.argv[1:]==['--resume-own-incomplete']
assert sys.argv[1:]==[] or resume
assert (not OUT.exists()) or (resume and not (OUT/'review.json').exists()),'Existing complete review is never replaced'
cacheBytes=(ROOT/'out/signed-aux-resources-v589/cache.json').read_bytes()
assert sha(cacheBytes)=='b39e4b998398864ae0ae49c8a9772af19e85794cbe0c5fd2f016b621e5870814'
proofs={p['path'].removeprefix('Aux.app/'):p for p in json.loads(cacheBytes)['parentFinalProofs']}
metadata=json.loads((FRESH/'package.json').read_text());assert metadata['signed'] is False and metadata['cloudPolicy']['mode']=='development'
assert json.loads((ROOT/'out/provided-candidate-local-browser-pass/package.json').read_text())['nativeReceiptSha256']==metadata['nativeReceiptSha256']
OUT.mkdir(mode=0o700,exist_ok=resume);app=OUT/'Aux.app'
# Clone only project-owned generated apps, retaining runtime/native symlinks verbatim.
if not resume:run(['/bin/cp','-cR',str(FRESH/'Aux.app'),str(app)])
else:
 expected={x['path']:x for x in inventory(FRESH/'Aux.app')}
 for rel in roots:
  expected={p:x for p,x in expected.items() if p!=rel and not p.startswith(rel+'/')}
  source=BASE/rel
  if source.is_dir():
   for x in inventory(source):
    x={**x,'path':rel+'/'+x['path']};expected[x['path']]=x
  else:
   st=source.stat();expected[rel]=dict(path=rel,type='file',mode=st.st_mode&0o777,bytes=st.st_size,sha256=sha(source.read_bytes()))
 fresh={x['path']:x for x in inventory(FRESH/'Aux.app')}
 for rel in changes:expected[rel]=fresh[rel]
 assert inventory(app)==sorted(expected.values(),key=lambda x:x['path']),'Incomplete copy differs from exact generated preparation' 
retained=[]
for rel in roots:
 source=BASE/rel;dest=app/rel
 if dest.is_dir():shutil.rmtree(dest)
 else:dest.unlink()
 if source.is_dir():shutil.copytree(source,dest,symlinks=True,copy_function=shutil.copy2)
 else:shutil.copy2(source,dest)
 retained.append(dict(path=rel,source=str(source)))
for rel in changes:shutil.copy2(FRESH/'Aux.app'/rel,app/rel)
# Unchanged signed helpers must still independently verify after the copy.
unchanged=[CLI+'/Contents/MacOS/aux-cli',CLI+'/Contents/Resources/native/aux-native-guard.node',DAEMON+'/Contents/Resources/native/aux-native-guard.node',P+'apps/computer-use/Aux Computer Use.app',CARRIER,P+'native/libaux-native-boundary.dylib']
for rel in unchanged:run(['/usr/bin/codesign','--verify','--strict','--all-architectures',str(app/rel)])
identity='47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90';targets=[]
for rel in [CLI,DAEMON]:
 ent=run(['/usr/bin/codesign','-d','--entitlements',':-',str(BASE/rel)])
 parsed=plistlib.loads(ent);assert parsed==proofs[rel]['entitlements'];assert parsed['com.apple.developer.team-identifier']=='9F2JXY8TCK'
 sourceCode=BASE/('Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea' if rel==CLI else rel+'/Contents/MacOS/aux-daemon')
 assert sha(sourceCode.read_bytes())==proofs[rel]['sha256']
 entPath=OUT/('cli-entitlements.plist' if rel==CLI else 'daemon-entitlements.plist');entPath.write_bytes(ent)
 profile=app/rel/'Contents/embedded.provisionprofile';assert profile.read_bytes()==(BASE/rel/'Contents/embedded.provisionprofile').read_bytes();assert sha(profile.read_bytes())==proofs[rel]['profileSha256']
 targets.append(dict(path=rel,signer='existing-Apple-Development',identitySha1=identity,entitlements=parsed,entitlementsSha256=sha(ent),profileSha256=sha(profile.read_bytes())))
targets.append(dict(path='.',signer='adhoc',purpose='Renew enclosing browser resource seal only'))
actual=inventory(app);fresh=inventory(FRESH/'Aux.app');byFresh={x['path']:x for x in fresh};byActual={x['path']:x for x in actual}
restored=[dict(path=p,before=byFresh.get(p),after=byActual.get(p)) for p in sorted(byFresh.keys()|byActual.keys()) if byFresh.get(p)!=byActual.get(p)]
assert all(any(x['path']==r or x['path'].startswith(r+'/') for r in roots) for x in restored)
review=dict(version=1,kind='unsigned-cloud-copied-development-review',candidate=str(app),sourcePackage=str(FRESH),sourcePackageReportSha256=sha((FRESH/'package.json').read_bytes()),cloudPolicy=metadata['cloudPolicy'],targets=targets,retainedSources=retained,unchangedHelpersVerified=unchanged,cloudCodeOverlays=changes,restoredHelperLeaves=restored,inventory=actual,inventorySha256=sha(json.dumps(actual,sort_keys=True).encode()),signed=False,launched=False,newProvisioning=False,ownerStateRead=False,privateKeysUsed=False,scope='Existing disposable Aux scope only; no new OS grants or owner profiles',remaining=['Owner approval for these exact new cloud bytes','Revalidate existing embedded profiles/signing capabilities, sign exactly the reviewed targets and verify final complete inventory','Disposable startup, real sign-in, funded ZDR inference/dictation and sync acceptance'])
(OUT/'review.json').write_text(json.dumps(review,indent=2)+'\n')
print(json.dumps(dict(candidate=str(app),reviewSha256=sha((OUT/'review.json').read_bytes()),targets=len(targets),unchangedHelpersVerified=len(unchanged),signed=False)))
