#!/usr/bin/env python3
"""PROPOSAL: exact reviewed local signing only; never launch, grant or provision."""
import argparse,copy,hashlib,importlib.util,json,os,plistlib,subprocess,sys
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
APP=ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
RES=Path('Contents/Resources/aux')
MARKER=RES/'bundle.json'
CU=Path('Contents/Resources/aux/apps/computer-use/Aux Computer Use.app')
CU_EXE=CU/'Contents/MacOS/aux-computer-use'
CU_POLICY=Path('Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/AuxComputerUseHelperLaunchPolicy.json')

def require(value,message):
    if not value:raise RuntimeError(message)
def sha(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as source:
        for chunk in iter(lambda:source.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()
def read(path):return json.loads(Path(path).read_text())
def pin(item):
    p=Path(item['path']);require(p.is_file() and not p.is_symlink() and sha(p)==item['sha256'],'Reviewed input changed: '+str(p))
    if 'bytes' in item:require(p.stat().st_size==item['bytes'],'Reviewed size changed: '+str(p))
    return p

def safe_relative(value):
    p=Path(value);require(not p.is_absolute() and '..' not in p.parts and str(p)==value,'Invalid reviewed path')
    require((APP/p).resolve().is_relative_to(APP),'Code object escapes reviewed app')
    return p

def write_new(path,value,mode=0o644):
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,mode)
    with os.fdopen(fd,'w') as stream:
        stream.write(json.dumps(value,indent=2,sort_keys=True)+'\n');stream.flush();os.fsync(stream.fileno())

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--owner-approved-review-sha256',required=True);args=parser.parse_args()
    review_path=HERE/'signing-execution-review.json'
    require(len(args.owner_approved_review_sha256)==64 and sha(review_path)==args.owner_approved_review_sha256,'Exact separately owner-approved review hash required')
    r=read(review_path);pin(r['applyScript']);require(Path(r['applyScript']['path'])==Path(__file__).resolve(),'Wrong reviewed executor')
    require(r['approvalReady'] is True and r['signingPerformed'] is False and r['targetCount']==20 and r['signingActionCount']==19,'Exact inactive twenty-object review required')
    require(r['app']==str(APP) and APP.resolve()==APP and APP.is_dir(),'Only exact copied successor may be signed')
    helper=pin(r['inventoryHelper']);require(helper==ROOT/'docs/integration/proposed/profile-isolation-delivery/package/assemble.py','Only pinned existing inventory helper allowed');spec=importlib.util.spec_from_file_location('reviewed_inventory',helper);p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
    package=read(pin(r['packageReceipt']));before=package['files']
    require(package['passed'] is True and package['app']==str(APP) and p.digest(before)==package['inventorySha256']==r['candidateInventorySha256'],'Current completed inventory receipt required')
    require(p.inventory(APP)==before,'Whole candidate differs from approved review')
    pin(r['publicProfileActual']);pin(r['candidateBundleMetadata']);pin(r['unsignedV10Policy'])
    require(Path(r['publicProfileActual']['path'])==APP/r['existingPublicProfile']['target'] and Path(r['candidateBundleMetadata']['path'])==APP/MARKER,'Exact candidate profile/metadata paths required')
    prior=read(pin(r['identitySource']))
    require((r['identitySha1'],r['team'],r['identity'])==(prior['identitySha1'],prior['team'],prior['identity']),'Only exact existing public identity allowed')
    expected=[dict(row) for row in prior['targetsInSigningOrder']]
    expected.insert(next(i for i,row in enumerate(expected) if row['identifier']=='dev.aux.browser.daemon'),{'codeObject':str(CU),'executable':str(CU_EXE),'identifier':'dev.aux.browser.computer-use','entitlements':None})
    targets=r['targetsInSigningOrder'];require(len(targets)==20,'Exactly twenty code objects required')
    for actual,wanted in zip(targets,expected):
        require(all(actual[key]==wanted[key] for key in ['codeObject','executable','identifier','entitlements']),'Signing target/entitlement expansion refused')
        safe_relative(actual['codeObject']);exe=APP/safe_relative(actual['executable'])
        require(not exe.is_symlink() and sha(exe)==actual['sha256'] and exe.stat().st_size==actual['bytes'],'Reviewed executable changed')
        if actual.get('infoPlist'):pin(actual['infoPlist'])
        if actual['entitlements']:pin(actual['entitlements'])
        action='preserve-and-verify' if actual['identifier']=='dev.aux.browser.memory' else 'local-development-sign-and-verify'
        require(actual['action']==action,'Preserved memory helper must not be signed')
    for item in r['preservedExactLeaves']:pin(item)
    policy_spec=r['computerUsePolicy'];constructor=pin(policy_spec['constructor']);raw=pin(policy_spec['rawSource'])
    require(constructor==ROOT/'docs/integration/proposed/completion-20261026/integration/computer-use/launch-policy.mjs' and raw==ROOT/'out/provided-candidate-local-completion-20261025-a38/Aux.app'/CU_EXE and sha(raw)=='debc03deb3f94eb7e8b50fa88d25e617f970b75f1e515b757b131655ad3dde51','Only original A38 CU and pinned finite constructor allowed')
    require(policy_spec['relative']==str(CU_POLICY) and not (APP/CU_POLICY).exists() and sha(APP/CU_EXE)==sha(raw),'Exact raw CU and absent policy required')
    require(read(APP/Path(r['unsignedV10Policy']['path']).relative_to(APP))['format']=='aux.fresh.bootstrap.policy.v10','Explicit current v10 resource required')
    backup=APP.parent/'before-local-development-signing';output=HERE/'actual-local-signing.json'
    require(not backup.exists() and not output.exists(),'Fresh backup and execution receipt required')
    result={'format':'aux.completion.actual-local-signing.v1','approvedReviewSha256':sha(review_path),'app':str(APP),'beforeInventorySha256':p.digest(before),'backup':str(backup),'steps':[],
      'passed':False,'appExecuted':False,'runtimeAccepted':False,'newOSPermissions':False,'identityQueryPerformed':False,'provisioning':False,'cloudChanges':False,'notarization':False,'distribution':False,'release':False}
    signed=[]
    def run(command,kind):
        done=subprocess.run(command,capture_output=True)
        result['steps'].append({'kind':kind,'command':command,'exitCode':done.returncode,'stdout':done.stdout.decode(errors='replace')[-5000:],'stderr':done.stderr.decode(errors='replace')[-5000:]})
        require(done.returncode==0,'Local signing/verification failed: '+kind)
        return done
    def verify(row):
        target=APP/row['codeObject']
        requirement='anchor apple generic and identifier "'+row['identifier']+'" and certificate leaf[subject.OU] = "'+r['team']+'"'
        run(['/usr/bin/codesign','--verify','--strict','-R',requirement,str(target)],'verify '+row['codeObject'])
        ent=run(['/usr/bin/codesign','--display','--entitlements',':-',str(target)],'entitlements '+row['codeObject']).stdout.strip()
        actual=plistlib.loads(ent) if ent else {}
        wanted=plistlib.loads(Path(row['entitlements']['path']).read_bytes()) if row['entitlements'] else {}
        require(actual==wanted,'Unexpected actual entitlements: '+row['codeObject'])
    def make_cu_policy():
        # Pure pinned JS factory reads original and delivered bytes; no app/native module is loaded.
        program="import fs from 'node:fs';import{pathToFileURL}from'node:url';const[m,a,b]=process.argv.slice(1);const{computerUseLaunchPolicy}=await import(pathToFileURL(m).href);process.stdout.write(JSON.stringify(computerUseLaunchPolicy(fs.readFileSync(a),fs.readFileSync(b))));"
        done=run(['/usr/bin/env','node','--input-type=module','-e',program,str(constructor),str(raw),str(APP/CU_EXE)],'derive exact signed CU policy')
        policy=json.loads(done.stdout)
        require(policy=={'format':'aux.computer-use.fixed-helper-launch.v1','sourceSha256':sha(raw),'sha256':sha(APP/CU_EXE),'bytes':(APP/CU_EXE).stat().st_size,'identifier':'dev.aux.browser.computer-use','team':r['team']},'Signed CU policy differs from actual verified image')
        write_new(APP/CU_POLICY,policy);result['computerUsePolicy']={'path':str(APP/CU_POLICY),'sha256':sha(APP/CU_POLICY),'content':policy}
    seal_prefixes=[];seal_leaves=set()
    for row in targets:
        if row['action']=='preserve-and-verify':continue
        obj=row['codeObject']
        if obj=='.' or obj.endswith('.app'):
            prefix='' if obj=='.' else obj+'/'
            seal_prefixes.append(prefix+'Contents/_CodeSignature/');seal_leaves.add(prefix+'Contents/CodeResources')
        elif obj.endswith('.framework'):
            seal_prefixes.append(str(Path(row['executable']).parent/'_CodeSignature')+'/')
    allowed={row['executable'] for row in targets if row['action']!='preserve-and-verify'}|{str(MARKER),str(CU_POLICY)}|seal_leaves
    def allowed_change(name):return name in allowed or any(name.startswith(prefix) for prefix in seal_prefixes)
    def refresh_metadata():
        marker=APP/MARKER;bundle=read(marker);records={row['path']:copy.deepcopy(row) for row in bundle['files']};require(len(records)==len(bundle['files']),'Duplicate active metadata row')
        active=[]
        for row in p.inventory(APP/RES):
            name=row['path']
            if name=='bundle.json':continue
            old=records.get(name)
            require(old is not None or allowed_change(str(RES/name)),'Unexpected new package leaf')
            item=old or {'path':name,'source':'approved local development signature/CU launch policy','changeKinds':['integration']}
            item['mode']=row['mode']
            if row['type']=='file':
                item.update(type='file',sha256=row['sha256'],bytes=(APP/RES/name).stat().st_size);item.pop('linkTarget',None);item.pop('target',None)
            else:
                item.update(type='symlink',linkTarget=row['target']);item.pop('sha256',None);item.pop('bytes',None);item.pop('target',None)
            active.append(item)
        delivered={row['path'] for row in active}
        require(all(name in delivered or allowed_change(str(RES/name)) for name in records),'Unreviewed package leaf removed')
        current=bundle['currentCompletionIntegration'];require(current['format']=='aux.completion.current-package.v1','Current completion metadata required')
        current.update(CUlaunchPolicyPending=False,CUtestable=False,productSigned=True,appExecuted=False,runtimeAccepted=False,activeManifestSha256=p.digest(active),activeManifestLeaves=len(active),wholeAppInventoryReceipt=str(output))
        current['localDevelopmentSigning']={'reviewSha256':sha(review_path),'identitySha1':r['identitySha1'],'signedObjects':19,'memoryHelperPreserved':True,'computerUsePolicySha256':sha(APP/CU_POLICY),'runtimeAcceptance':False}
        bundle['files']=active;bundle.update(productionReady=False,runtimeAccepted=False)
        temporary=marker.with_name('.aux-local-signing-bundle.json.part');require(not temporary.exists(),'Unexpected metadata stage')
        write_new(temporary,bundle,marker.stat().st_mode&0o777);os.replace(temporary,marker)
        parent=os.open(marker.parent,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
        try:os.fsync(parent)
        finally:os.close(parent)
    try:
        backup.mkdir(mode=0o700)
        subprocess.run(['/bin/cp','-cRpP',str(APP),str(backup/'Aux.app')],check=True)
        require(p.inventory(backup/'Aux.app')==before,'Recoverable pre-sign backup differs')
        for row in targets:
            if row['identifier']=='dev.aux.browser.daemon':make_cu_policy()
            if row['codeObject']=='.':refresh_metadata()
            if row['action']!='preserve-and-verify':
                command=['/usr/bin/codesign','--force','--sign',r['identitySha1'],'--options','runtime','--timestamp=none','--identifier',row['identifier']]
                if row['entitlements']:command+=['--entitlements',row['entitlements']['path']]
                command.append(str(APP/row['codeObject']));require(command==row['command'],'Reviewed command differs')
                run(command,'sign '+row['codeObject']);signed.append(row['codeObject'])
            verify(row)
        after=p.inventory(APP);old={row['path']:row for row in before};new={row['path']:row for row in after}
        changed=[row for row in after if row!=old.get(row['path'])];removed=sorted(set(old)-set(new))
        require(all(allowed_change(row['path']) for row in changed) and all(allowed_change(name) for name in removed),'Unreviewed post-sign delta')
        for item in r['preservedExactLeaves']:pin(item)
        pin(r['publicProfileActual'])
        marker=read(APP/MARKER);actual={row['path']:row for row in p.inventory(APP/RES) if row['path']!='bundle.json'}
        require(set(actual)=={row['path'] for row in marker['files']},'Active manifest coverage differs')
        for row in marker['files']:
            observed=actual[row['path']]
            require(row['mode']==observed['mode'] and (row.get('sha256')==observed.get('sha256') if observed['type']=='file' else row.get('linkTarget')==observed['target']),'Active manifest leaf differs')
        require(len(signed)==19,'Exactly nineteen signing actions required')
        result.update(passed=True,signedObjects=signed,preservedMemoryHelper=True,files=after,inventorySha256=p.digest(after),changedLeaves=changed,removedLeaves=removed,activeManifestSha256=p.digest(marker['files']),CUlaunchPolicyPending=False)
    except Exception as error:
        result['error']=str(error)
        raise
    finally:
        write_new(output,result,0o600)
    print(json.dumps({'receipt':str(output),'sha256':sha(output),'signedObjects':19,'preservedMemoryHelper':True,'appExecuted':False,'runtimeAccepted':False}))
if __name__=='__main__':main()
