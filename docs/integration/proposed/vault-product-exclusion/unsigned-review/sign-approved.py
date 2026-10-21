"""One owner-approved copied-daemon signing operation; never starts product code."""
import pathlib, json, hashlib, shutil, subprocess, plistlib, datetime, os, sys
if sys.argv[1:] != ["--owner-approved-single-daemon"]:
 raise SystemExit("Requires exact scoped owner authorization; existing outputs are never overwritten")
ROOT=pathlib.Path('/Users/rcourson/Documents/Vibe/web')
UNSIGNED=ROOT/'out/vault-exclusion-unsigned-review-20261021'
OUT=ROOT/'out/vault-exclusion-signed-review-20261021'
def sha(b): return hashlib.sha256(b).hexdigest()
def run(args): return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
def inventory(root):
 result=[]
 for p in sorted(root.rglob('*')):
  s=p.lstat(); rel=str(p.relative_to(root))
  if p.is_symlink(): result.append(dict(path=rel,mode=s.st_mode&0o777,type='symlink',target=os.readlink(p)))
  elif p.is_file(): result.append(dict(path=rel,mode=s.st_mode&0o777,type='file',sha256=sha(p.read_bytes()),bytes=s.st_size))
 return sorted(result,key=lambda x:x["path"])
reviewBytes=(UNSIGNED/'review.json').read_bytes()
assert sha(reviewBytes)=='981db79f17ed9e3bdb47dfa3719c8d4294dad9b0bbb0173836a128609fe85e38'
review=json.loads(reviewBytes); source=UNSIGNED/'Aux Daemon.app'
assert inventory(source)==sorted(review['after'],key=lambda x:x['path'])
identity='47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90'
assert identity in run(['/usr/bin/security','find-identity','-v','-p','codesigning']).decode()
OUT.mkdir(mode=0o700)
original=pathlib.Path(review['source'])
entBytes=run(['/usr/bin/codesign','-d','--entitlements',':-',str(original)])
ent=plistlib.loads(entBytes)
expected={'com.apple.application-identifier':'9F2JXY8TCK.dev.aux.browser.daemon','com.apple.developer.team-identifier':'9F2JXY8TCK','com.apple.security.cs.allow-dyld-environment-variables':True,'com.apple.security.cs.allow-jit':True,'com.apple.security.cs.allow-unsigned-executable-memory':True,'com.apple.security.cs.disable-library-validation':True,'keychain-access-groups':['9F2JXY8TCK.dev.aux.dp.dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476']}
assert ent==expected
(OUT/'entitlements.plist').write_bytes(plistlib.dumps(ent))
prior=json.loads((ROOT/'out/current-local-authority-v527/inputs.json').read_text())
request=dict(profilePath=str(source/'Contents/embedded.provisionprofile'),expectedProfileSha256=prior['profileSha256'],receiptPath=prior['cmsReceiptPath'],proposalPath=str(ROOT/'docs/integration/proposed/development-dp-signing/proposal.json'),role='daemon',testMacIdentifier=prior['testMacIdentifier'],now=datetime.datetime.now(datetime.timezone.utc).isoformat(),allowAppleTrustNetwork=True)
(OUT/'profile-request.json').write_text(json.dumps(request))
auth=run(['node',str(ROOT/'vendor/provided/authenticate-development-profile.mjs'),str(OUT/'profile-request.json')]); (OUT/'profile-authentication.json').write_bytes(auth)
assert json.loads(auth)['metadataClaimsMatch']
# Authenticate original nested code before copying; no recursive signing.
run(['/usr/bin/codesign','--verify','--deep','--strict',str(original)])
app=OUT/'Aux Daemon.app'; shutil.copytree(source,app,symlinks=True)
before=inventory(app)
assert before==inventory(source)
command=['/usr/bin/codesign','--force','--sign',identity,'--options','runtime','--timestamp=none','--entitlements',str(OUT/'entitlements.plist'),str(app)]
run(command)
run(['/usr/bin/codesign','--verify','--deep','--strict',str(app)])
assert plistlib.loads(run(['/usr/bin/codesign','-d','--entitlements',':-',str(app)]))==expected
verify=run(['/usr/bin/codesign','-d','--extract-certificates='+str(OUT/'signed-cert'),str(app)])
assert hashlib.sha1((OUT/'signed-cert0').read_bytes()).hexdigest().upper()==identity
after=inventory(app); a={x['path']:x for x in after}; b={x['path']:x for x in before}
changes=[dict(path=p,before=b.get(p),after=a.get(p)) for p in sorted(a.keys()|b.keys()) if a.get(p)!=b.get(p)]
assert {x['path'] for x in changes} <= {'Contents/MacOS/aux-daemon','Contents/_CodeSignature/CodeResources'}
receipt=dict(status='signed-and-static-verified-no-runtime',unsignedReviewSha256=sha(reviewBytes),app=str(app),identitySha1=identity,entitlements=expected,profileAuthenticationSha256=sha(auth),ownerAuthorization='Explicit scoped local daemon signing approval relayed by root 2026-10-21',command=command,changedBySigning=changes,finalInventory=after,finalInventorySha256=sha(json.dumps(after,sort_keys=True).encode()),allOtherLeavesPreserved=True,nestedSignatureVerification=True,provisioningPerformed=False,productRuntimeExecuted=False,keychainDataOperationsPerformed=False,privateKeySigningPerformed=True)
(OUT/'signing-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(dict(app=str(app),receiptSha256=sha((OUT/'signing-receipt.json').read_bytes()),signedExecutableSha256=a['Contents/MacOS/aux-daemon']['sha256'],changedLeaves=len(changes))))
