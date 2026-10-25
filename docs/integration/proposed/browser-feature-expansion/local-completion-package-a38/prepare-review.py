"""Prepare the exact local signing/state review; never execute it."""
from pathlib import Path
import importlib.util
import json
import os
import pwd
import sys

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
H=HERE.parent/'fresh-startup-milestone-a42'
spec=importlib.util.spec_from_file_location('package_helpers',HERE.parents[1]/'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
OUT=ROOT/'out/provided-candidate-local-completion-20261025-a38'
APP=OUT/'Aux.app'
RES='Contents/Resources/aux/'
DAEMON=RES+'apps/daemon/Aux Daemon.app/Contents/'
MEMORY=DAEMON+'Resources/memory-helper/aux-memory'
HELPER_POLICY=DAEMON+'Resources/AuxMemoryHelperLaunchPolicy.json'

def main():
    receipt=p.read(OUT/'receipt.json')
    p.require(receipt['passed'] and not receipt['productSigned'] and not receipt['testable'],'Exact inactive package required')
    p.require(p.inventory(APP)==receipt['files'],'Candidate changed before review')
    old=p.read(H/'signing-review.json')
    targets=[]
    for item in old['targetsInSigningOrder']:
        if item['identifier']=='dev.aux.browser.daemon':
            targets.extend([
                dict(codeObject=MEMORY,executable=MEMORY,identifier='dev.aux.browser.memory',entitlements=None),
                dict(codeObject=RES+'apps/cli/Aux CLI.app',executable=RES+'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli',identifier='dev.aux.browser.cli',entitlements=None)])
        targets.append({key:item[key] for key in ['codeObject','executable','identifier','entitlements']})
    for item in targets:
        item['sha256']=p.sha(APP/item['executable'])
        if item['entitlements']:p.pin(item['entitlements'])
    p.require(len(targets)==19,'Exact nineteen local objects required')
    profile=DAEMON+'embedded.provisionprofile'
    p.require(p.sha(APP/profile)==old['existingPublicProfile']['sha256'],'Existing approved wildcard profile differs')
    native_home=pwd.getpwuid(os.geteuid()).pw_dir
    p.require(os.getuid()==os.geteuid()!=0 and native_home.startswith('/'),'Native OS user facts required')
    roots=dict(support=native_home+'/Library/Application Support/Aux Browser',
        data=native_home+'/Library/Application Support/Aux Browser/User Data',
        control=native_home+'/Library/Application Support/Aux Browser/Control',
        tasks=native_home+'/Library/Application Support/Aux Browser/Tasks',
        cache=native_home+'/Library/Caches/Aux Browser')
    review=dict(format='aux.local-completion.signing-review.v1',approvalReady=True,
        app=str(APP),packageReceipt=p.ref(OUT/'receipt.json'),
        candidateInventorySha256=receipt['inventorySha256'],applyScript=p.ref(HERE/'sign-reviewed.py'),
        identity=old['identity'],identitySha1=old['identitySha1'],team=old['team'],
        existingPublicProfile=dict(target=profile,sha256=p.sha(APP/profile),expires=old['existingPublicProfile']['expires']),
        targetCount=19,targetsInSigningOrder=targets,signingOptions=['runtime'],timestamp='none',
        generatedHelperPolicy=dict(path=HELPER_POLICY,format='aux.memory.fixed-helper-launch.v1',
            sourceSha256=receipt['memoryHelperSourceSha256'],identifier='dev.aux.browser.memory',team=old['team'],
            modelDescriptorSha256='2001e15f1ea3e79468db44b6ad772d05978b2787e1f414044cb0efb8c4bc78bc',
            signedSha256AndBytes='Derived only from this separately signed and verified exact copied helper, before daemon/app sealing'),
        nativeStartupPolicySha256=receipt['policySha256'],runtimeScope=roots,
        runtimeScopeCondition='Inspect only namespace metadata first. If any root already exists without this milestone first-creation receipt, stop unchanged before reading its contents. Initialize and inspect only newly created disposable Aux profiles and their scoped installation/authentication entries.',
        keychainAccessGroup='9F2JXY8TCK.dev.aux.local',
        focusedChecks=['startup/navigation','two isolated disposable profiles','active-work profile switching',
            'multiple windows and draft/TXT persistence','sidebar/chat/settings/popup appearance',
            'CmdT/K/L palette commit/cancel','native CLI URL/profile dispatch',
            'fixed sandboxed memory indexing/search/close','normal Quit and same-package restart'],
        boundedRepairScope='Only these same19 code objects and this newly owned namespace, after demonstrated failures in the listed focused checks; preserve the accepted UI and failed bytes, and record exact changes/hashes before necessary local re-signs. No new objects, entitlements, OS grants, legacy migration, feature expansion or architecture expansion.',
        acceptedAppExcluded=True,ownerProfilesExcluded=True,realProviderAccountsExcluded=True,
        existingA25MayBeClosedNormallyForPortHandoff=True,
        signingPerformed=False,appExecuted=False,newEntitlements=False,provisioning=False,
        newOSPermissions=False,cloudChanges=False,notarization=False,distribution=False,release=False)
    p.write_new(HERE/'signing-review.json',review)
    # Paths are fixed reviewed project paths, quoted for spaces by a literal
    # generated wrapper, never evaluated while preparing the review.
    script='#!/bin/zsh\ncd "'+str(ROOT)+'"\nexec /opt/homebrew/bin/node scripts/aux.mjs --app "'+str(APP)+'"\n'
    launcher=OUT/'Launch Aux.command';launcher.write_text(script);launcher.chmod(0o700)
    print(json.dumps(dict(approvalReady=True,targetCount=19,review=str(HERE/'signing-review.json'),sha256=p.sha(HERE/'signing-review.json'),app=str(APP),signingPerformed=False)))

if __name__=='__main__':main()
