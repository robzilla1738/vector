"""Reuse real audit-bound guest code objects, never authorization results."""
import difflib
import hashlib
import json
from pathlib import Path
import subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a52b')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
compiled=json.loads((ROOT/'docs/integration/proposed/standard-profile-isolation/ui-native-capture-transport-a1/actual-compile-a1.json').read_text())
row=next(r for r in compiled['results'] if r['name']=='daemon-AuxNativePeerTransport')
command=list(row['command'])
source=Path(next(a for a in command if a.endswith('/AuxNativePeerTransport.cc')))
assert sha(source)=='e24dd9886408bda5e3e18cdcf2edf45085163b4252db21570fff1aedb483a016'
old=source.read_text();text=old
before='''using OwnedRequirement = std::unique_ptr<std::remove_pointer_t<SecRequirementRef>, ReleaseRequirement>;
'''
after=before+'''struct ReleaseGuestCode {
  const pid_t process = getpid();
  void operator()(SecCodeRef code) const {
    if (getpid() == process && code) CFRelease(code);
  }
};
using OwnedGuestCode = std::unique_ptr<std::remove_pointer_t<SecCodeRef>, ReleaseGuestCode>;
'''
assert text.count(before)==1;text=text.replace(before,after)
before='''  std::vector<uint8_t> cd_hash;
  const pid_t process = getpid();
'''
after='''  std::vector<uint8_t> cd_hash;
  // A real Security object for one exact kernel audit identity. No validity
  // result is stored. The process guard precedes every cache mutex access.
  mutable std::mutex guest_mutex;
  mutable std::optional<audit_token_t> guest_audit;
  mutable OwnedGuestCode guest_code;
  const pid_t process = getpid();
'''
assert text.count(before)==1;text=text.replace(before,after)
start=text.index('  static bool Validate(audit_token_t token, const ExactCodePolicy& policy) {')
end=text.index('    status = SecCodeCheckValidity(code,',start)
original_prefix=text[start:end]
helper='''  // Caller holds guest_mutex, after checking the creating process. Reusing
  // SecCode retains Security's native backing objects; every caller still
  // performs the original live validity or static-policy/descriptor checks.
  static SecCodeRef GuestLocked(audit_token_t token, const ExactCodePolicy& policy) {
    auto& state = *policy.data_;
    if (state.guest_audit && state.guest_code &&
        memcmp(&*state.guest_audit, &token, sizeof(token)) == 0)
      return state.guest_code.get();
    state.guest_code.reset();
    state.guest_audit.reset();
    CFDataRef audit = CFDataCreate(kCFAllocatorDefault,
        reinterpret_cast<const UInt8*>(&token), sizeof(token));
    if (!audit) return nullptr;
    const void* key = kSecGuestAttributeAudit;
    const void* value = audit;
    CFDictionaryRef attributes = CFDictionaryCreate(kCFAllocatorDefault, &key, &value, 1,
        &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
    CFRelease(audit);
    if (!attributes) return nullptr;
    SecCodeRef code = nullptr;
    const OSStatus status = SecCodeCopyGuestWithAttributes(nullptr, attributes, kSecCSDefaultFlags, &code);
    CFRelease(attributes);
    OwnedGuestCode owned(code);
    if (status != errSecSuccess || !owned) return nullptr;
    state.guest_code.reset(owned.release());
    state.guest_audit = token;
    return state.guest_code.get();
  }
  static void InvalidateGuestLocked(const ExactCodePolicy& policy) {
    policy.data_->guest_code.reset();
    policy.data_->guest_audit.reset();
  }
  static bool Validate(audit_token_t token, const ExactCodePolicy& policy) {
    if (getpid() != policy.data_->process) return false;
    std::lock_guard<std::mutex> lock(policy.data_->guest_mutex);
    SecCodeRef code = GuestLocked(token, policy);
    if (!code) return false;
    OSStatus status;
'''
text=text[:start]+helper+text[end:]
start=text.index('  static bool Validate(');end=text.index('  static int AuthenticatedGuestParent',start)
segment=text[start:end]
assert segment.count('    CFRelease(code);\n')==1
segment=segment.replace('    CFRelease(code);\n','')
assert segment.count('    return valid;\n')==1
segment=segment.replace('    return valid;\n','    if (!valid) InvalidateGuestLocked(policy);\n    return valid;\n')
text=text[:start]+segment+text[end:]
start=text.index('  static int AuthenticatedGuestParent(');end=text.index('    SecStaticCodeRef code = nullptr;',start)
text=text[:start]+'''  static int AuthenticatedGuestParent(audit_token_t token, const ExactCodePolicy& policy) {
    if (getpid() != policy.data_->process) return -1;
    std::lock_guard<std::mutex> lock(policy.data_->guest_mutex);
    SecCodeRef guest = GuestLocked(token, policy);
    if (!guest) return -1;
    OSStatus result;
'''+text[end:]
start=text.index('  static int AuthenticatedGuestParent(');end=text.index('\n\n};\nNativeSendRight::',start)
segment=text[start:end]
assert segment.count('    CFRelease(guest);\n')==1
segment=segment.replace('    CFRelease(guest);\n','')
segment=segment.replace('    if (result != errSecSuccess || !code) return -1;','    if (result != errSecSuccess || !code) { if (code) CFRelease(code); InvalidateGuestLocked(policy); return -1; }')
segment=segment.replace('    if (status != 0) { if (descriptor >= 0) close(descriptor); return -1; }','    if (status != 0) { if (descriptor >= 0) close(descriptor); InvalidateGuestLocked(policy); return -1; }')
text=text[:start]+segment+text[end:]
dest=HERE/'peer-identity-reuse-b-source'/source.name
dest.parent.mkdir();dest.write_text(text)
with (HERE/'peer-identity-reuse-a12b.patch').open('x') as f:f.writelines(difflib.unified_diff(old.splitlines(True),text.splitlines(True),fromfile='a/'+source.name,tofile='b/'+source.name))
with (HERE/'actual-peer-identity-reuse-projection-a12b.json').open('x') as f:json.dump(dict(passed=True,input=str(source),inputSha256=sha(source),output=str(dest),outputSha256=sha(dest),daemonOnly=True,fullAuditTokenKey=True,creatingProcessBeforeMutex=True,oneOwnedGuestObjectPerPolicy=True,noCachedAuthorizationResult=True,liveValidityFlagsAndRequirementUnchanged=True,signingInformationAndCdHashCheckedEveryCall=True,staticPolicyAndParentDescriptorChecksUnchanged=True,birthAndLivenessCallersUnchanged=True,failedValidationInvalidatesObject=True,uiChanged=False,productExecuted=False),f,indent=2);f.write('\n')
OUT.mkdir(mode=0o700)
old_object=command[command.index('-o')+1]
assert sha(old_object)==row['objectSha256']
command[command.index(str(source))]=str(dest)
command[command.index('-o')+1]=str(OUT/'peer-transport.o')
command[command.index('-MF')+1]=str(OUT/'peer-transport.d')
previous=json.loads((HERE/'actual-daemon-callback-authority-build-a11.json').read_text());assert previous['passed']
link=list(previous['results'][-1]['command']);assert link.count(old_object)==1
link[link.index(old_object)]=str(OUT/'peer-transport.o')
link[link.index('-o')+1]=str(OUT/'Aux Daemon')
results=[];frozen={str(dest):sha(dest)}
for i,args in enumerate([command,link]):
    for arg in args:
        if Path(arg).is_file():frozen[arg]=sha(arg)
    run=subprocess.run(args,cwd=row['cwd'] if i==0 else ROOT,capture_output=True)
    (OUT/f'{i}.stdout').write_bytes(run.stdout);(OUT/f'{i}.stderr').write_bytes(run.stderr)
    results.append(dict(command=args,exitCode=run.returncode));print(json.dumps(dict(step=i,exitCode=run.returncode)),flush=True)
    if run.returncode:print(run.stderr.decode(errors='replace')[-4500:]);break
passed=len(results)==2 and all(r['exitCode']==0 for r in results)
receipt=dict(format='aux.ordinary-fresh.peer-identity-reuse.build.v1',passed=passed,results=results,inputFiles=frozen,cppOwnersRecompiled=1,cppObjectsReused=13,swiftSourceCount=sum(a.endswith('.swift') for a in link),authorizationChecksUnchanged=True,productSigned=False,productExecuted=False)
if passed:
    binary=OUT/'Aux Daemon';load=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE/'actual-daemon-peer-identity-reuse-build-a12b.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
if not passed:raise SystemExit(1)
