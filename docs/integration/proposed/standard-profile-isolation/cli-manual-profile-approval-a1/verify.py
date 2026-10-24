#!/usr/bin/env python3
"""Source-only evidence, never invokes LocalAuthentication or a compiler."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
original=HERE.parent/'cli-native-embedding-a1/source/common/AuxCliIngress.h'
find='  friend class BrowserInvocation;';replacement=find+'\n  friend class ManualProfileApprovalRequest;\n  friend class ApprovedCliInvocation;'
assert original.read_text().count(find)==1
assert (HERE/'source/AuxCliIngress.h').read_text()==original.read_text().replace(find,replacement)
rows=[]
for p in sorted((HERE/'source').iterdir()):
 rows.append({'source':str(p),'path':'chrome/browser/aux/cli/'+p.name,'outputSha256':sha(p),'input':str(original)if p.name=='AuxCliIngress.h'else None,'inputSha256':sha(original)if p.name=='AuxCliIngress.h'else None,'anchors':[{'find':find,'replace':replacement,'count':1}]if p.name=='AuxCliIngress.h'else[]})
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.cli-manual-profile-approval.sources.v1','files':rows,'overlays':1,'anchors':1,'nativeCheckoutChanged':False,'packageSelected':False},indent=2)+'\n')
inputs=['chrome/browser/aux/profile_identity.h','chrome/browser/aux/profile_identity.cc','chrome/browser/aux/AuxSelectedStateHome.h','chrome/browser/profiles/profile.h','chrome/browser/profiles/profile_attributes_entry.h','chrome/browser/profiles/profile_attributes_storage.h','chrome/browser/profiles/profile_manager.h','chrome/browser/ui/browser_window/public/browser_window_interface.h','ui/base/base_window.h','ui/gfx/native_ui_types.h','base/apple/owned_objc.h','device/fido/mac/touch_id_context.mm']
pins=[{'path':str(ROOT/name),'sha256':sha(ROOT/name)}for name in inputs]
for p in [original,HERE.parent/'cli-native-embedding-a1/source/common/AuxCliIngress.cc',HERE.parent/'cli-native-embedding-a1/source/base/process/mac/aux_browser_descendant_engine.h',Path('/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/System/Library/Frameworks/LocalAuthentication.framework/Headers/LAContext.h')]:pins.append({'path':str(p),'sha256':sha(p)})
(HERE/'dependency-pins.json').write_text(json.dumps({'format':'aux.cli-manual-profile-approval.dependencies.v1','files':pins},indent=2)+'\n')
s=(HERE/'source/AuxCliManualProfileApproval.mm').read_text()
assert s.count('new ApprovedCliInvocation(')==1
assert '[s.context evaluatePolicy:LAPolicyDeviceOwnerAuthentication' in s
assert 'touchIDAuthenticationAllowableReuseDuration = 0' in s
assert 'GetProfileCookieBindingEpoch' in s and 'GetProfileCookieRestoreEpoch' in s
assert s.count('CliClientMembership::managed')==3
assert 'kPromptLimit = base::Seconds(60)'in s and 'kApprovalLifetime = base::Seconds(15)'in s
assert 's.weak.InvalidateWeakPtrs()'in s and '[state_->context invalidate]'in s
assert 'ui->PostTask' in s and 'PollPendingInvocation' in s
checks=['exact one-anchor ingress successor; three source hashes/destinations','actual Profile/cookie/window/SDK source dependencies pinned','single private grant construction follows internal direct OS authentication result and native revalidation','managed-client refusals, finite timeout/lease, weak callback cancellation and definite no-start paths present']
receipt={'format':'aux.cli-manual-profile-approval.static-check.v1','passed':True,'checks':checks,'sourceCount':len(rows),'dependencyCount':len(pins),'compilerRun':False,'nativeApiExecuted':False,'localAuthenticationInvoked':False,'productExecuted':False,'signed':False,'packageSelected':False,'runtimeAcceptance':False}
(HERE/'static-check.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items()if k!='checks'}))
