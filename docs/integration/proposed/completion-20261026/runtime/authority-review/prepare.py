#!/usr/bin/env python3
"""Read only completed atomic candidate; write a proposal, never sign or launch."""
from pathlib import Path
import argparse,copy,hashlib,json,plistlib
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
APP=ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
OLD=ROOT/'out/provided-candidate-local-completion-20261025-a38/Aux.app'
OLD_REVIEW=ROOT/'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/signing-review.json'
parser=argparse.ArgumentParser();parser.add_argument('--candidate-receipt',type=Path,default=APP.parent/'receipt.json');args=parser.parse_args()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ref=lambda p:{'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
RES=Path('Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources')
inputs={name:ref(OLD/RES/name) for name in ['AuxFreshBootstrapPolicy.json','native/aux-pdf.node','native/aux-macos-utilities.node','memory-helper/aux-memory','AuxMemoryHelperLaunchPolicy.json']}
cu=Path('Contents/Resources/aux/apps/computer-use/Aux Computer Use.app')
inputs['computerUseRawImage']=ref(OLD/cu/'Contents/MacOS/aux-computer-use')
packet={'format':'aux.completion.authority-input-packet.v1','acceptedApp':str(OLD),'proposedApp':str(APP),'inputs':inputs,
 'existingReview':ref(OLD_REVIEW),'policyConstructor':ref(ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-builtins/construct-policy.py'),
 'computerUsePolicyConstructor':ref(ROOT/'docs/integration/proposed/completion-20261026/integration/computer-use/launch-policy.mjs'),
 'unsignedV10Policy':ref(ROOT/'docs/integration/proposed/completion-20261026/integrator/policies/AuxFreshBootstrapPolicy.json'),
 'signedComputerUseDigest':None,'CUlaunchPolicyPending':True,'signed':False,'executed':False}
(HERE/'policy-inputs.json').write_text(json.dumps(packet,indent=2)+'\n')
if not APP.is_dir() or not args.candidate_receipt.is_file():raise SystemExit('Input packet ready; atomic candidate and completed receipt not present. No candidate/temp read.')
receipt_path=args.candidate_receipt.resolve();assert receipt_path.is_relative_to(APP.parent)
receipt=json.loads(receipt_path.read_text())
assert receipt['passed'] is True and receipt['app']==str(APP) and receipt['CUlaunchPolicyPending'] is True
rows={r['path']:r for r in receipt['files']}
prior=json.loads(OLD_REVIEW.read_text());targets=copy.deepcopy(prior['targetsInSigningOrder'])
new={'codeObject':str(cu),'executable':str(cu/'Contents/MacOS/aux-computer-use'),'identifier':'dev.aux.browser.computer-use','entitlements':None}
targets.insert(next(i for i,row in enumerate(targets) if row['identifier']=='dev.aux.browser.daemon'),new)
assert len(targets)==20
for order,row in enumerate(targets,1):
    executable=APP/row['executable'];row['sha256']=sha(executable);row['bytes']=executable.stat().st_size;row['order']=order
    assert rows[row['executable']]['sha256']==row['sha256']
    row['action']='preserve-and-verify' if row['identifier']=='dev.aux.browser.memory' else 'local-development-sign-and-verify'
    if row['entitlements']:assert sha(Path(row['entitlements']['path']))==row['entitlements']['sha256']
    if row['codeObject'].endswith('.app') or row['codeObject']=='.':
        info=APP/row['codeObject']/'Contents/Info.plist';row['infoPlist']=ref(info)
        assert plistlib.loads(info.read_bytes())['CFBundleIdentifier']==row['identifier']
    row['command']=None if row['action']=='preserve-and-verify' else ['/usr/bin/codesign','--force','--sign',prior['identitySha1'],'--options','runtime','--timestamp=none','--identifier',row['identifier']]+([] if not row['entitlements'] else ['--entitlements',row['entitlements']['path']])+[str(APP/row['codeObject'])]
    row['verificationCommand']=['/usr/bin/codesign','--verify','--strict','-R','anchor apple generic and identifier "'+row['identifier']+'" and certificate leaf[subject.OU] = "'+prior['team']+'"',str(APP/row['codeObject'])]
assert sha(APP/prior['existingPublicProfile']['target'])==prior['existingPublicProfile']['sha256']
preserve=[]
for name in ['native/aux-pdf.node','native/aux-macos-utilities.node','memory-helper/aux-memory','AuxMemoryHelperLaunchPolicy.json']:
    file=APP/RES/name;assert sha(file)==inputs[name]['sha256'];preserve.append(dict(relative=str(RES/name),**ref(file)))
raw=APP/cu/'Contents/MacOS/aux-computer-use';assert sha(raw)==inputs['computerUseRawImage']['sha256']
launch_policy=RES/'AuxComputerUseHelperLaunchPolicy.json';assert not (APP/launch_policy).exists()
assert sha(APP/RES/'AuxFreshBootstrapPolicy.json')==packet['unsignedV10Policy']['sha256']
review={
 'applyScript':ref(ROOT/'docs/integration/proposed/completion-20261026/runtime/authority-review/sign-reviewed.py'),
 'inventoryHelper':ref(ROOT/'docs/integration/proposed/profile-isolation-delivery/package/assemble.py'),
 'format':'aux.completion.local-development-authority-review.v1','approvalReady':True,'approvalObtained':False,'runtimeReady':False,
 'app':str(APP),'packageReceipt':ref(receipt_path),'candidateInventorySha256':receipt['inventorySha256'],'candidateLeaves':len(receipt['files']),
 'outerMinimumOS':plistlib.loads((APP/'Contents/Info.plist').read_bytes()).get('LSMinimumSystemVersion'),
 'preparationVerification':'Twenty actual executable hashes match completed atomic whole-inventory receipt; preserved leaves and public profile hash checked. Executor must recheck entire inventory before mutation.',
 'identity':prior['identity'],'identitySha1':prior['identitySha1'],'team':prior['team'],'identitySource':ref(OLD_REVIEW),'identityQueried':False,
 'existingPublicProfile':prior['existingPublicProfile'],'publicProfileActual':ref(APP/prior['existingPublicProfile']['target']),
 'targetCount':20,'signingActionCount':19,'preserveOnlyCodeObjectCount':1,'targetsInSigningOrder':targets,'preservedExactLeaves':preserve,
 'CUlaunchPolicyPending':True,'computerUsePolicy':{'relative':str(launch_policy),'constructor':packet['computerUsePolicyConstructor'],'rawSource':inputs['computerUseRawImage'],'format':'aux.computer-use.fixed-helper-launch.v1','signedSha256':None,'generatedOnlyAfterExactSignedImageVerification':True},
 'unsignedV10Policy':ref(APP/RES/'AuxFreshBootstrapPolicy.json'),'candidateBundleMetadata':ref(APP/'Contents/Resources/aux/bundle.json'),'activeMetadataSection':'currentCompletionIntegration',
 'orderedExecutionConditions':[
  'Separate explicit owner approval of this exact review hash is required before any signing, Keychain use, launch or provider request; this preparation does none.',
  'Verify whole candidate inventory, every executable/plist/entitlement/preserved leaf/profile and constructor preimage. Preserve a recoverable whole-candidate copy and failed bytes before mutation; refuse changed inputs.',
  'Use only the recorded existing local Apple Development identity/profile. No identity enumeration, certificate/profile creation/download, provisioning, timestamp service, EndpointSecurity entitlement, notarization, upload or release.',
  'Sign/verify recorded code objects inside out, skip preserved memory helper and all original addons. Sign CU app before daemon/outer seals; use no new CU entitlement or OS grant.',
  'After CU signing, invoke the pinned computerUseLaunchPolicy export with original A38 raw debc03 image and actual signed candidate bytes, verify identifier/team, then write only the exact CU launch resource. Never manufacture a future signed digest.',
  'Refresh actual active aux/bundle.json leaves for CU, CLI and daemon signatures, CU policy and all resulting code seal leaves. Mark pending false only after exact signed CU policy exists and matches. Preserve historical source evidence, memory policy and addon bytes. Seal daemon after its resource update, update active metadata after nested seals, then seal outer Aux.app last.',
  'Verify all exact target signatures/entitlements and unchanged protected leaves; record actual post-sign whole inventory and all modifications before any protected startup.',
  'Only after approved protected-startup checks and new-namespace receipt, launch the exact signed candidate with --use-mock-keychain into fresh disposable scope. That switch is not evidence that custom Keychain calls are confined.'
 ],
 'protectedStartupJustification':'Actual normal-window startup uses the retained installation-authentication and provider credential boundary. Unsigned/static builds passed but cannot establish authenticated helper/profile behavior. The proposal permits only scoped fresh installation authentication and focused disposable product journeys after separately approved local signatures.',
 'runtimeScope':{key:str(Path('/Users/rcourson/Library')/suffix/'Aux Browser Completion 20261026'/tail) for key,suffix,tail in [('support','Application Support',''),('data','Application Support','User Data'),('control','Application Support','Control'),('tasks','Application Support','Tasks'),('cache','Caches','')]},
 'runtimeScopeCondition':'Inspect namespace metadata only first. If any proposed root exists without this milestone first-creation receipt, stop unchanged before contents or Keychain access. No v9 adoption, migration, key/credential/provider copy or old-state deletion. Create only fresh disposable profiles in this exact namespace.',
 'proposedLaunchCommand':['/usr/bin/open','-n','-a',str(APP),'--args','--use-mock-keychain'],
 'localEndpoints':{'daemon':21520,'extensionBridge':21522,'secureBrowserCDP':45203,'condition':'Only this new Aux namespace; do not connect to, stop or replace Aside. Old A38 may quit normally for Aux port handoff.'},
 'keychainScope':{'accessGroup':prior['keychainAccessGroup'],'purpose':'Only installation/authentication and explicit temporary provider credential operations for this new installation/profile; no enumeration or read of old/Aside/owner credentials. Retain actual location/installation/account binding checks.','ownerOrAsideStateExcluded':True},
 'focusedChecks':{
  'J1':'Fresh startup; HTTPS/back/forward/full URL; CmdT/K/L commit/cancel; pins/folders/Spaces/Undo; Peek/quick promotion;3+splits; native CLI exact profile/URL routing.',
  'J2':'Two disposable profiles; active draft+TXT/image/PDF/HEIC attachment/read_file; separate windows/shared edits and protected live view; switch during work; missing-file/cancel; normal Quit/reopen verifies exact content and identities; one changed helper closure boundary.',
  'J3':'Only user-authorized temporary BYOK via actual credential UI/API; exact Muse model; one small real completed request, selected page/tab context, file context, cancellation, Tidy proposal/Undo, refresh/restart, disconnect. Eligible ChatGPT/vendor account flow only with genuine separate account authority; report unavailable honestly.',
  'J4':'Docked/hidden/hover/both panels/minimal/bookmarks, chat/settings warmup, theme cancel/apply, narrow/fullscreen/splits, keyboard, official disposable extension/autofill/native companion only within actual vendor authority, PiP, DevTools/capture. No new OS permissions; expected CU permission refusal remains a limitation.'},
 'aiBudget':{'model':'vercel-ai-gateway/meta/muse-spark-1.3-contributor','maximumAggregateSpendUSD':1,'maximumCompletedRequests':1,'maximumOutputTokens':128,'credentialEntry':'Actual provider credential UI/API only; no secrets in logs or review','cleanup':'Remove temporary provider credentials through actual credential API, disconnect temporary integration, verify scoped status without printing secrets; no Aux-hosted spend.'},
 'repairScope':'Only demonstrated failures within these exact19 signing targets, preserved20th memory object, recorded launch-policy/active metadata resources and new disposable namespace. Preserve failed bytes, review exact changed hashes before necessary same-scope resign. New code objects/entitlements/OS grants/owner access/architecture expansion require separate authority.',
 'oldA38MayQuitNormallyForPortHandoff':True,'oldA38AppAndStateOtherwisePreserved':True,
 'noOSGrantsAtThisPhase':['Accessibility','Screen Recording','Input Monitoring','Contacts','Automation/Apple Events','Full Disk Access','EndpointSecurity'],
 'provisioning':False,'identityQueryPerformed':False,'signingPerformed':False,'keychainOperationPerformed':False,'appExecuted':False,'newOSPermissions':False,'cloudChanges':False,'notarization':False,'distribution':False,'release':False,
 'remainingGates':['explicit exact-review owner approval','actual local signatures and exact CU launch policy','fresh protected startup and J1-J4 evidence','vendor/account/OS/Apple ES dependencies remain open where unsupported']}
(HERE/'signing-execution-review.json').write_text(json.dumps(review,indent=2)+'\n')
print(json.dumps({'review':str(HERE/'signing-execution-review.json'),'sha256':sha(HERE/'signing-execution-review.json'),'targets':20,'signingActions':19,'preparedOnly':True}))
