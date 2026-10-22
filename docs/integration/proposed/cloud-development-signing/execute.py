"""Exact copied-cloud signing executor. Default is plan inspection only.
The apply flag is usable only after the human approves the pinned plan.
Never provisions, launches product code or opens the approved state home.
"""
from pathlib import Path
import datetime,hashlib,json,os,plistlib,struct,subprocess,sys
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
REVIEW=ROOT/'out/cloud-development-signing-review'
PLAN_SHA='43415d770be82878ab4a5ef0ded4ac525b0f0c8f667246ed652464c42af5d5a9'
RECEIPT=ROOT/'out/cloud-development-signing-execution'
IDENTITY='47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90'
def sha(b):return hashlib.sha256(b).hexdigest()
def regular(p):
 assert p.is_file() and not p.is_symlink() and p.resolve()==p
 st=p.stat();assert st.st_uid==os.getuid() and not(st.st_mode&0o022)
 return p.read_bytes()
def run(args):return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=120,env={'PATH':'/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin','LC_ALL':'C'})
def inventory(root):
 result=[]
 for directory,dirs,files in os.walk(root,followlinks=False):
  for name in files+dirs:
   p=Path(directory)/name;st=p.lstat();rel=str(p.relative_to(root))
   if p.is_symlink():
    assert root in p.resolve().parents,'Candidate link escapes app'
    result.append(dict(path=rel,type='symlink',mode=st.st_mode&0o777,target=os.readlink(p)))
   elif p.is_file():result.append(dict(path=rel,type='file',mode=st.st_mode&0o777,bytes=st.st_size,sha256=sha(regular(p))))
 return sorted(result,key=lambda x:x['path'])
def code_sections(file):
 b=regular(file);assert struct.unpack_from('<I',b)[0]==0xfeedfacf
 result={};at=32
 for _ in range(struct.unpack_from('<I',b,16)[0]):
  cmd,size=struct.unpack_from('<II',b,at);assert size>=8 and at+size<=len(b)
  if cmd==0x19:
   segment=b[at+8:at+24].rstrip(b'\0').decode();count=struct.unpack_from('<I',b,at+64)[0]
   for n in range(count):
    offset=at+72+n*80;assert offset+80<=at+size
    name=b[offset:offset+16].rstrip(b'\0').decode();address,length=struct.unpack_from('<QQ',b,offset+32);start=struct.unpack_from('<I',b,offset+48)[0]
    if not start:continue
    assert start+length<=len(b);key=segment+'/'+name;assert key not in result;result[key]=dict(address=address,bytes=length,sha256=sha(b[start:start+length]))
  at+=size
 return result

def write_receipt(value):
 path=RECEIPT/'receipt.json';temp=RECEIPT/'receipt.next.json'
 temp.write_text(json.dumps(value,indent=2)+'\n');os.replace(temp,path)
def allowed_delta(before,after,allowed):
 b={x['path']:x for x in before};a={x['path']:x for x in after}
 changes=[dict(path=p,before=b.get(p),after=a.get(p)) for p in sorted(a.keys()|b.keys()) if a.get(p)!=b.get(p)]
 assert all(x['path'] in allowed for x in changes),'Unexpected change outside signature leaves'
 return changes

def main():
 apply=sys.argv[1:]==['--apply-approved-plan',PLAN_SHA]
 assert sys.argv[1:]==[] or apply,'Usage: execute.py [--apply-approved-plan EXACT_PLAN_SHA256]'
 plan_bytes=regular(REVIEW/'signing-plan.json');assert sha(plan_bytes)==PLAN_SHA
 plan=json.loads(plan_bytes);review_bytes=regular(REVIEW/'review.json');assert sha(review_bytes)==plan['unsignedReviewSha256']
 review=json.loads(review_bytes);app=Path(plan['candidate']);assert app==REVIEW/'Aux.app' and app.resolve()==app
 assert plan['minimumTargets']==3 and plan['privateKeySigningCommands']==2 and plan['adHocCommands']==1
 assert not any(plan[k] for k in ['provisioning','release','ownerProfileAccess','newOSGrants','signingPerformed'])
 expected=[]
 for target,label in zip(review['targets'][:2],['cli','daemon']):
  assert target['identitySha1']==IDENTITY
  ent=REVIEW/(label+'-entitlements.plist');assert sha(regular(ent))==target['entitlementsSha256'];assert plistlib.loads(regular(ent))==target['entitlements']
  expected.append(['/usr/bin/codesign','--force','--sign',IDENTITY,'--timestamp=none','--options','runtime','--entitlements',str(ent),str(app/target['path'])])
 expected.append(['/usr/bin/codesign','--force','--sign','-','--timestamp=none',str(app)])
 assert plan['commands']==expected
 if not apply:
  print(json.dumps(dict(mode='plan-inspection-only',planSha256=PLAN_SHA,commands=3,signingPerformed=False,productLaunched=False)));return
 assert not RECEIPT.exists(),'Execution/partial receipts are never replaced'
 assert inventory(app)==review['inventory'],'Prepared candidate changed'
 assert sha(json.dumps(review['inventory'],sort_keys=True).encode())==plan['inventorySha256']
 for rel in review['unchangedHelpersVerified']:run(['/usr/bin/codesign','--verify','--strict','--all-architectures',str(app/rel)])
 assert IDENTITY in run(['/usr/bin/security','find-identity','-v','-p','codesigning']).stdout.decode()
 RECEIPT.mkdir(mode=0o700)
 receipt=dict(version=1,kind='exact-local-cloud-signing-execution',planSha256=PLAN_SHA,unsignedReviewSha256=plan['unsignedReviewSha256'],sourceSha256=sha(regular(Path(__file__).resolve())),candidate=str(app),status='validating-profiles',signed=False,signingAttempted=False,attemptedCommands=[],completedCommands=[],productLaunched=False,provisioning=False,keychainDataOperations=False,newOSGrants=False)
 write_receipt(receipt)
 try:
  prior=json.loads(regular(ROOT/'out/current-local-authority-v527/inputs.json'))
  authenticated={}
  def authenticate(target,role):
   profile=app/target['path']/'Contents/embedded.provisionprofile';assert sha(regular(profile))==target['profileSha256']
   request=dict(profilePath=str(profile),expectedProfileSha256=target['profileSha256'],receiptPath=prior['cmsReceiptPath'],proposalPath=str(ROOT/'docs/integration/proposed/development-dp-signing/proposal.json'),role=role,testMacIdentifier=prior['testMacIdentifier'],now=datetime.datetime.now(datetime.timezone.utc).isoformat(),allowAppleTrustNetwork=True)
   request_path=RECEIPT/(role+'-profile-request.json');request_path.write_text(json.dumps(request));request_path.chmod(0o600)
   result=run(['node',str(ROOT/'vendor/provided/authenticate-development-profile.mjs'),str(request_path)]).stdout
   proof=json.loads(result);assert proof['metadataClaimsMatch'] and proof['onlinePositiveRevocationVerified'] and proof['cmsSha256']==target['profileSha256']
   (RECEIPT/(role+'-profile-authentication.json')).write_bytes(result)
   authenticated[role]=proof
  for target,role in zip(review['targets'][:2],['cli','daemon']):authenticate(target,role)
  # All review inputs and the complete candidate are rechecked before the first key use.
  assert sha(regular(REVIEW/'signing-plan.json'))==PLAN_SHA
  assert inventory(app)==review['inventory']
  code_paths=[t['path']+'/Contents/MacOS/'+('aux-cli-sea' if i==0 else 'aux-daemon') for i,t in enumerate(review['targets'][:2])]+['Contents/MacOS/Aux']
  original_sections={rel:code_sections(app/rel) for rel in code_paths}
  receipt['status']='signing';write_receipt(receipt)
  for index,command in enumerate(expected):
   if index<2:
    role=['cli','daemon'][index];evaluated=datetime.datetime.fromisoformat(authenticated[role]['evaluatedAt'].replace('Z','+00:00'))
    if (datetime.datetime.now(datetime.timezone.utc)-evaluated).total_seconds()>60:authenticate(review['targets'][index],role)
   for target,label in zip(review['targets'][:2],['cli','daemon']):assert sha(regular(REVIEW/(label+'-entitlements.plist')))==target['entitlementsSha256']
   assert sha(regular(REVIEW/'signing-plan.json'))==PLAN_SHA
   receipt['signingAttempted']=True;receipt['attemptedCommands'].append(command);write_receipt(receipt)
   run(command);receipt['completedCommands'].append(command);write_receipt(receipt)
  proofs=[]
  for target,label in zip(review['targets'][:2],['cli','daemon']):
   bundle=app/target['path'];run(['/usr/bin/codesign','--verify','--deep','--strict','--all-architectures',str(bundle)])
   ent=plistlib.loads(run(['/usr/bin/codesign','-d','--entitlements',':-',str(bundle)]).stdout);assert ent==target['entitlements']
   display=run(['/usr/bin/codesign','-dvv',str(bundle)]).stderr.decode();assert 'flags=0x10000(runtime)' in display and 'TeamIdentifier=9F2JXY8TCK' in display and 'Identifier=dev.aux.browser.'+label in display
   prefix=RECEIPT/(label+'-certificate-');run(['/usr/bin/codesign','-d','--extract-certificates='+str(prefix),str(bundle)]);assert hashlib.sha1(regular(Path(str(prefix)+'0'))).hexdigest().upper()==IDENTITY
   assert sha(regular(bundle/'Contents/embedded.provisionprofile'))==target['profileSha256']
   proofs.append(dict(path=target['path'],identitySha1=IDENTITY,entitlements=ent,profileSha256=target['profileSha256'],hardenedRuntime=True))
  for rel in review['unchangedHelpersVerified']:run(['/usr/bin/codesign','--verify','--strict','--all-architectures',str(app/rel)])
  run(['/usr/bin/codesign','--verify','--deep','--strict','--all-architectures',str(app)])
  outer=run(['/usr/bin/codesign','-dvv',str(app)]).stderr.decode();assert 'flags=0x2(adhoc)' in outer and 'Identifier=dev.aux.browser' in outer
  for rel,sections in original_sections.items():assert code_sections(app/rel)==sections,'Signing changed native code/data or the reviewed SEA payload'
  final=inventory(app);changes=allowed_delta(review['inventory'],final,set(plan['allowedSigningChanges']))
  receipt.update(status='signed-and-static-verified-no-runtime',signed=True,proofs=proofs,changedLeaves=changes,finalInventory=final,finalInventorySha256=sha(json.dumps(final,sort_keys=True).encode()),untargetedLeavesPreserved=True,nativeCodeDataAndSeaPayloadPreserved=True)
  write_receipt(receipt);print(json.dumps(dict(status=receipt['status'],receiptSha256=sha(regular(RECEIPT/'receipt.json')),changedLeaves=len(changes),productLaunched=False)))
 except BaseException as error:
  receipt.update(status='failed-partial-signatures-possible' if receipt['signingAttempted'] else 'refused-before-signing',signed=None if receipt['signingAttempted'] else False,errorType=type(error).__name__);write_receipt(receipt);raise
if __name__=='__main__':main()
