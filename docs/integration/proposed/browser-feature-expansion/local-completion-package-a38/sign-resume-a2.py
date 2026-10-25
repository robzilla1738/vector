"""Execute only the exact owner-approved nineteen-object local review.

No provisioning, release or app launch. Preparation alone never invokes this.
"""
from pathlib import Path
import importlib.util
import json
import subprocess
import sys

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
spec=importlib.util.spec_from_file_location('package_helpers',HERE.parents[1]/'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)

def main():
    if len(sys.argv)!=3 or sys.argv[1]!='--owner-approved-review-sha256':
        raise SystemExit('Explicit owner approval and exact review SHA256 required; no action taken.')
    review_path=HERE/'signing-review.json'
    p.require(p.sha(review_path)==sys.argv[2],'Exact owner-reviewed manifest required')
    r=p.read(review_path);p.pin(r['applyScript'])
    p.require(r['approvalReady'] and r['targetCount']==19 and not r['signingPerformed'],'Exact inactive review required')
    app=Path(r['app'])
    p.require(app==ROOT/'out/provided-candidate-local-completion-20261025-a38/Aux.app' and app.resolve()==app,'Only reviewed candidate allowed')
    before=p.read(p.pin(r['packageReceipt']))
    p.require(before['inventorySha256']==r['candidateInventorySha256'],'Original inventory differs from review')
    snapshot=app.parent/'before-local-signing'/'Aux.app'
    p.require(p.inventory(snapshot)==before['files'],'Preserved original snapshot differs')
    current=p.inventory(app);old={row['path']:row for row in before['files']}
    first=r['targetsInSigningOrder'][0]
    changed=[row for row in current if row!=old.get(row['path'])]
    p.require(len(changed)==1 and changed[0]['path']==first['executable'],'Only the first approved signature may already exist')
    p.require(len(current)==len(before['files']),'Unexpected candidate resources')
    repair=p.read(HERE/'signing-repair-a2.json')
    p.require(p.sha(HERE/'sign-resume-a2.py')==repair['resumeScriptSha256'],'Repair executor differs')
    p.require(p.sha(app/first['executable'])==repair['preservedSignedFirstObjectSha256'],'First signed object differs')
    p.require(p.sha(HERE/'failed-first-object-a1')==repair['preservedSignedFirstObjectSha256'],'Preserved failed object differs')
    p.require(p.sha(HERE/'actual-local-signing.json')==repair['failedReceiptSha256'],'Original failure receipt differs')
    profile=app/r['existingPublicProfile']['target']
    p.require(p.sha(profile)==r['existingPublicProfile']['sha256'],'Existing profile changed')
    identities=subprocess.run(['/usr/bin/security','find-identity','-v','-p','codesigning'],check=True,capture_output=True,text=True)
    p.require(r['identitySha1'] in identities.stdout,'Reviewed existing identity unavailable')
    for target in r['targetsInSigningOrder']:
        if target is not r['targetsInSigningOrder'][0]:p.require(p.sha(app/target['executable'])==target['sha256'],'Reviewed executable changed')
        if target['entitlements']:p.pin(target['entitlements'])
    # The complete original snapshot and the first signed bytes were preserved before this repair.
    resource='Contents/Resources/aux/'
    marker=app/resource/'bundle.json'
    bundle=p.read(marker);records={row['path']:row for row in bundle['files']}
    helper_spec=r['generatedHelperPolicy'];helper_path=app/next(row['executable'] for row in r['targetsInSigningOrder'] if row['identifier']==helper_spec['identifier'])
    steps=[];output=HERE/'actual-local-signing-a2.json'
    p.require(not output.exists(),'Fresh signing execution receipt required')
    result=dict(passed=False,approvedReviewSha256=p.sha(review_path),app=str(app),steps=steps,
        appExecuted=False,provisioning=False,newOSGrants=False,notarization=False,release=False)
    try:
        for target in r['targetsInSigningOrder']:
            if target is r['targetsInSigningOrder'][0]:
                requirement='=anchor apple generic and identifier "'+target['identifier']+'" and certificate leaf[subject.OU] = "'+r['team']+'"'
                checked=subprocess.run(['/usr/bin/codesign','--verify','--strict','-R',requirement,str(app/target['codeObject'])],capture_output=True,text=True)
                steps.append(dict(verification=target['codeObject'],alreadySigned=True,exitCode=checked.returncode,diagnostic=checked.stderr[-2000:]))
                p.require(checked.returncode==0,'Previously applied signature does not verify')
                continue
            if target['identifier']=='dev.aux.browser.daemon':
                policy={key:helper_spec[key] for key in ['format','sourceSha256','identifier','team','modelDescriptorSha256']}
                policy.update(sha256=p.sha(helper_path),bytes=helper_path.stat().st_size)
                path=app/helper_spec['path'];p.require(not path.exists(),'Unexpected helper launch policy refused')
                path.write_text(json.dumps(policy,indent=2,sort_keys=True)+'\n');path.chmod(0o644)
                records[helper_spec['path'].removeprefix(resource)]=dict(path=helper_spec['path'].removeprefix(resource),type='file',mode=0o644,sha256=p.sha(path),changeKinds=['integration'],source='approved fixed helper signed-image policy')
                bundle['localCompletionIntegration'].update(memoryHelperPolicyPending=False,
                    memoryHelperPolicySha256=p.sha(path),runtimeAcceptance=False)
            if target['codeObject']=='.':
                for prefix in ['apps/daemon/Aux Daemon.app/','apps/cli/Aux CLI.app/']:
                    for path in sorted((app/resource/prefix).rglob('*')):
                        if not path.is_file() or path.is_symlink():continue
                        name=str(path.relative_to(app/resource))
                        record=records.get(name) or dict(path=name,type='file',mode=path.stat().st_mode&0o7777,changeKinds=['integration'],source='approved local development signature')
                        record['sha256']=p.sha(path);records[name]=record
                bundle['files']=list(records.values())
                marker.write_text(json.dumps(bundle,indent=2)+'\n')
            command=['/usr/bin/codesign','--force','--sign',r['identitySha1'],'--options','runtime','--timestamp=none','--identifier',target['identifier']]
            if target['entitlements']:command+=['--entitlements',str(p.pin(target['entitlements']))]
            command.append(str(app/target['codeObject']))
            done=subprocess.run(command,capture_output=True,text=True)
            steps.append(dict(codeObject=target['codeObject'],command=command,exitCode=done.returncode,diagnostic=done.stderr[-2000:]))
            p.require(done.returncode==0,'Local signing failed: '+target['codeObject'])
            requirement='=anchor apple generic and identifier "'+target['identifier']+'" and certificate leaf[subject.OU] = "'+r['team']+'"'
            checked=subprocess.run(['/usr/bin/codesign','--verify','--strict','-R',requirement,str(app/target['codeObject'])],capture_output=True,text=True)
            steps.append(dict(verification=target['codeObject'],exitCode=checked.returncode,diagnostic=checked.stderr[-2000:]))
            p.require(checked.returncode==0,'New signature does not match exact reviewed identity')
        after=p.inventory(app);old={row['path']:row for row in before['files']}
        changed=[row for row in after if row!=old.get(row['path'])]
        allowed={row['executable'] for row in r['targetsInSigningOrder']}|{resource+'bundle.json',helper_spec['path']}
        prefixes=['Contents/_CodeSignature/']
        for target in r['targetsInSigningOrder']:
            name=target['codeObject']
            if name.endswith('.app'):prefixes.append(name+'/Contents/_CodeSignature/')
            elif name.endswith('.framework'):prefixes.append(name+'/Versions/155.0.8059.85/_CodeSignature/')
        p.require(all(row['path'] in allowed or any(row['path'].startswith(prefix) for prefix in prefixes) for row in changed),'Unreviewed resource changed during signing')
        p.require(set(old).issubset({row['path'] for row in after}),'Existing resource disappeared')
        result.update(passed=True,files=after,inventorySha256=p.digest(after),changedLeaves=changed,
            signedObjects=19,uiPreserved=True,runtimeAcceptance=False)
    finally:
        p.write_new(output,result)
    print(json.dumps(dict(passed=result['passed'],signedObjects=19,appExecuted=False,runtimeAcceptance=False)))

if __name__=='__main__':main()
