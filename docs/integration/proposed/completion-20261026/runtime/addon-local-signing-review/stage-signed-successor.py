#!/usr/bin/env python3
"""Stage and reseal only the explicitly approved two-addon matching cohort."""
import argparse, hashlib, importlib.util, json, os, plistlib, shutil, subprocess, sys
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
HERE=Path(__file__).resolve().parent
APP=ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
ADDON_APPROVAL='5138937e149f3ff805f70ed92e552b7cc444e2d8e697d0d5c82582f20695b037'
PARENT_APPROVAL='20572af30ef6613f1fc8bced01edada6d52f4b3f7c1f21dd97fb610ec2b257f2'
RES=Path('Contents/Resources/aux');MARKER=RES/'bundle.json'
def require(value,message):
 if not value:raise RuntimeError(message)
sha=lambda path:hashlib.sha256(Path(path).read_bytes()).hexdigest()
read=lambda path:json.loads(Path(path).read_text())
def pin(item):
 path=Path(item['path']);require(path.is_file() and not path.is_symlink() and sha(path)==item['sha256'],'Changed input: '+str(path));return path
def write_new(path,value):
 with Path(path).open('x') as stream:json.dump(value,stream,indent=2);stream.write('\n')
parser=argparse.ArgumentParser();parser.add_argument('--plan',type=Path,required=True);parser.add_argument('--plan-sha256',required=True);args=parser.parse_args()
require(sha(args.plan)==args.plan_sha256,'Exact staging plan required');plan=read(args.plan)
require(plan['format']=='aux.two-addon.matching-cohort-staging.v1' and plan['app']==str(APP) and plan['approvedReviewSha256']==ADDON_APPROVAL,'Wrong repair scope')
pin(plan['executor']);require(Path(plan['executor']['path'])==Path(__file__).resolve(),'Wrong executor')
addon_path=HERE/'review.json';require(sha(addon_path)==ADDON_APPROVAL,'Approved addon review changed');addon=read(addon_path)
require(read(HERE/'owner-approval.json')['reviewSha256']==ADDON_APPROVAL,'Addon approval missing')
parent_path=HERE.parent/'authority-review/signing-execution-review.json';require(sha(parent_path)==PARENT_APPROVAL,'Parent review changed');parent=read(parent_path)
helper=pin(parent['inventoryHelper']);spec=importlib.util.spec_from_file_location('addon_staging_inventory',helper);p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
previous=read(pin(plan['beforeReceipt']));require(previous['passed'],'Passed predecessor required')
before=p.inventory(APP);require(before==previous['files'] and p.digest(before)==previous['inventorySha256'],'Signed predecessor differs')
old={row['path']:row for row in before}
daemon=next(row for row in parent['targetsInSigningOrder'] if row['identifier']=='dev.aux.browser.daemon')
framework=next(row for row in parent['targetsInSigningOrder'] if row['codeObject'].endswith('.framework'))
outer=next(row for row in parent['targetsInSigningOrder'] if row['codeObject']=='.')
policy=Path(daemon['codeObject'])/'Contents/Resources/AuxFreshBootstrapPolicy.json'
addon_relatives={str(Path(row['input']).relative_to(APP)):row for row in addon['addons']}
expected=set(addon_relatives)|{daemon['executable'],framework['executable'],str(policy)}
require(len(plan['staging'])==5 and {row['relative'] for row in plan['staging']}==expected,'Only five reviewed replacements allowed')
for item in plan['sourceEvidence']:pin(item)
for row in plan['staging']:
 pin(row['source']);require(old[row['relative']]['type']=='file' and not (APP/row['relative']).is_symlink(),'Regular preimage required')
for relative,row in addon_relatives.items():
 require(sha(APP/relative)==row['rawSha256'] and sha(row['rawPreservationTarget'])==row['rawSha256'] and sha(row['acceptedA38Input'])==row['rawSha256'],'Raw originals changed')
new_policy=read(next(row['source']['path'] for row in plan['staging'] if row['relative']==str(policy)))
old_policy=read(APP/policy);expected_policy=json.loads(json.dumps(old_policy))
for row in addon['addons']:
 delivered=next(item for item in plan['staging'] if item['relative']==str(Path(row['input']).relative_to(APP)))
 expected_policy[row['key']]['sha256']=delivered['source']['sha256'];expected_policy[row['key']]['bytes']=Path(delivered['source']['path']).stat().st_size
require(new_policy==expected_policy and new_policy['format']=='aux.fresh.bootstrap.policy.v10','Descriptor authority expanded')
for row in [daemon,framework,outer]:
 if row.get('infoPlist'):pin(row['infoPlist'])
 if row['entitlements']:pin(row['entitlements'])
for item in parent['preservedExactLeaves']:
 if str(Path(item['path']).relative_to(APP)) not in addon_relatives:pin(item)
pin(parent['publicProfileActual'])
work=APP.parent/plan['receiptDirectory'];require(work.parent==APP.parent and not work.exists(),'Fresh confined staging directory required');work.mkdir(mode=0o700)
result={'format':'aux.two-addon.actual-matching-cohort.v1','approvedReviewSha256':ADDON_APPROVAL,'parentReviewSha256':PARENT_APPROVAL,
 'app':str(APP),'plan':{'path':str(args.plan.resolve()),'sha256':args.plan_sha256},'beforeInventorySha256':p.digest(before),
 'steps':[],'passed':False,'appExecuted':False,'runtimeAccepted':False,'newOSPermissions':False,'provisioning':False,'notarization':False,'release':False,'cloudChanges':False}
def run(command,kind):
 done=subprocess.run(command,capture_output=True)
 result['steps'].append({'kind':kind,'command':command,'exitCode':done.returncode,'stdout':done.stdout.decode(errors='replace')[-4000:],'stderr':done.stderr.decode(errors='replace')[-4000:]})
 require(done.returncode==0,'Signing/verification failed: '+kind);return done
def verify(path,identifier,wanted):
 requirement='=anchor apple generic and identifier = "'+identifier+'" and certificate leaf[subject.OU] = "'+parent['team']+'"'
 run(['/usr/bin/codesign','--verify','--strict','-R',requirement,str(path)],'verify '+identifier)
 raw=run(['/usr/bin/codesign','--display','--entitlements',':-',str(path)],'entitlements '+identifier).stdout.strip()
 require((plistlib.loads(raw) if raw else {})==wanted,'Unexpected entitlements')
def reseal(row):
 require(row['command'][0]=='/usr/bin/codesign' and row['command'][-1]==str(APP/row['codeObject']),'Unexpected parent signing command')
 run(row['command'],'sign '+row['identifier'])
 wanted=plistlib.loads(pin(row['entitlements']).read_bytes()) if row['entitlements'] else {}
 verify(APP/row['codeObject'],row['identifier'],wanted)
try:
 subprocess.run(['/bin/cp','-cRpP',str(APP),str(work/'before-repair.app')],check=True)
 require(p.inventory(work/'before-repair.app')==before,'Recoverable predecessor backup differs')
 for row in plan['staging']:
  source=pin(row['source']);target=APP/row['relative'];temporary=target.with_name(target.name+'.approved-addon-stage')
  require(not temporary.exists(),'Fresh staging leaf required');shutil.copyfile(source,temporary);temporary.chmod(old[row['relative']]['mode'])
  require(sha(temporary)==row['source']['sha256'],'Copied artifact changed');os.replace(temporary,target)
 for relative,row in addon_relatives.items():verify(APP/relative,row['identifier'],{})
 reseal(daemon);reseal(framework)
 marker=APP/MARKER;bundle=read(marker);records={row['path']:row for row in bundle['files']};actual=p.inventory(APP/RES)
 require(set(records)=={row['path'] for row in actual if row['path']!='bundle.json'},'Unexpected packaged leaf coverage')
 for leaf in actual:
  if leaf['path']=='bundle.json':continue
  row=records[leaf['path']];require(row['mode']==leaf['mode'],'Unplanned resource permission change')
  if leaf['type']=='file':row.update(sha256=leaf['sha256'],bytes=(APP/RES/leaf['path']).stat().st_size)
  else:require(row['linkTarget']==leaf['target'],'Unplanned resource symlink change')
 bundle['files']=list(records.values());bundle['currentCompletionIntegration'].update(addonSigningReview={'path':str(addon_path),'sha256':ADDON_APPROVAL},
  addonMatchingRepair=result['plan'],activeManifestSha256=p.digest(bundle['files']),wholeAppInventoryReceipt=str(work/'receipt.json'),appExecuted=False,runtimeAccepted=False)
 temporary=marker.with_name(marker.name+'.approved-addon-stage');write_new(temporary,bundle);temporary.chmod(old[str(MARKER)]['mode']);os.replace(temporary,marker)
 reseal(outer)
 after=p.inventory(APP);new={row['path']:row for row in after};allowed=expected|{outer['executable'],str(MARKER)}
 prefixes=['Contents/_CodeSignature/',str(Path(daemon['codeObject'])/'Contents/_CodeSignature')+'/',str(Path(framework['executable']).parent/'_CodeSignature')+'/']
 valid=lambda name:name in allowed or any(name.startswith(prefix) for prefix in prefixes)
 changed=[row for row in after if old.get(row['path'])!=row];removed=sorted(set(old)-set(new))
 require(all(valid(row['path']) for row in changed) and all(valid(name) for name in removed),'Unreviewed whole-package delta')
 for item in parent['preservedExactLeaves']:
  if str(Path(item['path']).relative_to(APP)) not in addon_relatives:pin(item)
 pin(parent['publicProfileActual']);pin(plan['executor'])
 for item in plan['sourceEvidence']:pin(item)
 require(sha(args.plan)==args.plan_sha256 and sha(addon_path)==ADDON_APPROVAL and sha(parent_path)==PARENT_APPROVAL,'Frozen reviews/plan changed')
 result.update(passed=True,files=after,inventorySha256=p.digest(after),changedLeaves=changed,removedLeaves=removed,
  rawOriginalAddonsPreserved=True,nativeAddonCodeUnchanged=True,otherCandidateLeavesPreserved=True,CUlaunchPolicyPending=False,
  newlySignedObjects=2,parentObjectsResealed=3,sourceEvidence=plan['sourceEvidence'])
except Exception as error:
 result['error']=str(error);raise
finally:write_new(work/'receipt.json',result)
print(json.dumps({'passed':True,'receipt':str(work/'receipt.json'),'inventorySha256':result['inventorySha256']}))
