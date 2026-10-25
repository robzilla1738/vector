from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
REL=Path('docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42')
sha=lambda b:hashlib.sha256(b).hexdigest()
rows=[];patch=[]
def emit(native_relative,changes,expected):
 path=NATIVE/native_relative;b=path.read_text();assert sha(b.encode())==expected
 a=b;anchors=[]
 for old,new in changes:
  assert a.count(old)==1,(path.name,old[:70],a.count(old));a=a.replace(old,new,1);anchors.append({'before':old,'after':new,'count':1})
 output=HERE/native_relative;output.parent.mkdir(parents=True,exist_ok=True);output.write_text(a)
 baseline=HERE/'baseline'/native_relative;baseline.parent.mkdir(parents=True,exist_ok=True);baseline.write_text(b)
 rows.append({'nativeRelative':native_relative,'input':str(path),'inputSha256':sha(b.encode()),'output':str(ROOT/REL/'browser-peer-identity-reuse-source'/native_relative),'outputSha256':sha(a.encode()),'anchors':anchors})
 patch.extend(difflib.unified_diff(b.splitlines(True),a.splitlines(True),fromfile='a/'+native_relative,tofile='b/'+native_relative))
cpp='chrome/browser/aux/AuxNativePeerTransport.cc'
b=(NATIVE/cpp).read_text()
oldops=b.split('struct NativeOperations {',1)[1].split('NativeSendRight::NativeSendRight',1)[0]
template=(ROOT/REL/'peer-identity-reuse-b-source/AuxNativePeerTransport.cc').read_text()
newops=template.split('struct NativeOperations {',1)[1].split('NativeSendRight::NativeSendRight',1)[0]
newops=newops.replace('memcmp(&*state.guest_audit, &token, sizeof(token)) == 0','std::bit_cast<std::array<uint8_t, sizeof(audit_token_t)>>(*state.guest_audit) ==\n            std::bit_cast<std::array<uint8_t, sizeof(audit_token_t)>>(token)')
newops=newops.replace('    state.guest_code.reset();\n    state.guest_audit.reset();','    state.guest_static_code.reset();\n    state.guest_code.reset();\n    state.guest_audit.reset();')
newops=newops.replace('    policy.data_->guest_code.reset();','    policy.data_->guest_static_code.reset();\n    policy.data_->guest_code.reset();')
oldstatic='''    OSStatus result;
    SecStaticCodeRef code = nullptr;
    result = SecCodeCopyStaticCode(guest, kSecCSDefaultFlags, &code);
    if (result != errSecSuccess || !code) { if (code) CFRelease(code); InvalidateGuestLocked(policy); return -1; }
'''
newstatic='''    if (!policy.data_->guest_static_code) {
      SecStaticCodeRef created = nullptr;
      const auto result = SecCodeCopyStaticCode(guest, kSecCSDefaultFlags, &created);
      OwnedGuestStaticCode owned(created);
      if (result != errSecSuccess || !owned) { InvalidateGuestLocked(policy); return -1; }
      policy.data_->guest_static_code.reset(owned.release());
    }
    SecStaticCodeRef code = policy.data_->guest_static_code.get();
'''
assert newops.count(oldstatic)==1;newops=newops.replace(oldstatic,newstatic).replace('    CFRelease(code);\n    if (status != 0)', '    if (status != 0)')
extra='''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
struct ReleaseGuestCode {
  const pid_t process = getpid();
  void operator()(SecCodeRef code) const { if (getpid() == process && code) CFRelease(code); }
};
struct ReleaseGuestStaticCode {
  const pid_t process = getpid();
  void operator()(SecStaticCodeRef code) const { if (getpid() == process && code) CFRelease(code); }
};
using OwnedGuestCode = std::unique_ptr<std::remove_pointer_t<SecCodeRef>, ReleaseGuestCode>;
using OwnedGuestStaticCode = std::unique_ptr<std::remove_pointer_t<SecStaticCodeRef>, ReleaseGuestStaticCode>;
#endif
'''
fields='''#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
  // One real Security object pair per actual kernel audit identity. No cached
  // success/admission; every native and Swift validation still runs.
  mutable std::mutex guest_mutex;
  mutable std::optional<audit_token_t> guest_audit;
  mutable OwnedGuestCode guest_code;
  mutable OwnedGuestStaticCode guest_static_code;
#endif
'''
emit(cpp,[('using OwnedRequirement = std::unique_ptr<std::remove_pointer_t<SecRequirementRef>, ReleaseRequirement>;\n','using OwnedRequirement = std::unique_ptr<std::remove_pointer_t<SecRequirementRef>, ReleaseRequirement>;\n'+extra),('  std::vector<uint8_t> cd_hash;\n','  std::vector<uint8_t> cd_hash;\n'+fields),('struct NativeOperations {'+oldops,'#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP\nstruct NativeOperations {'+newops+'#else\nstruct NativeOperations {'+oldops+'#endif\n')],'e24dd9886408bda5e3e18cdcf2edf45085163b4252db21570fff1aedb483a016')
loader=(ROOT/REL/'startup-identity-reuse-b4-source/AuxSignedFreshBootstrapPolicyLoader.swift').read_text()
fileclass=loader.split('    private final class OrdinaryFileBinding {',1)[1].split('    private final class OrdinaryCurrentCode {',1)[0]
helper='''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    private final class OrdinaryFileBinding {'''+fileclass+'''    private final class OrdinaryGuestFiles {
        let code:SecStaticCode
        let expectedHash:Data
        let files:[OrdinaryFileBinding]
        init(code:SecStaticCode,expectedHash:Data)throws {
            var rawPath:CFURL?
            let status=SecCodeCopyPath(code,[],&rawPath)
            guard status==errSecSuccess,let rawPath else{throw AuxFreshBootstrapPolicyError.signature(status)}
            let bundle=(rawPath as URL).path
            let info=try signingInfo(code),captured=try signature(info)
            guard let role=[AuxFreshBootstrapPolicyContents.Role.daemon,.cli].first(where:{$0.identifier==captured.identifier}),
                  let executable=info[kSecCodeInfoMainExecutable as String] as? URL,
                  executable.path==bundle+"/Contents/MacOS/"+role.executable else{throw AuxFreshBootstrapPolicyError.identity}
            var paths=[executable.path,bundle+"/Contents/Info.plist",bundle+"/Contents/_CodeSignature/CodeResources",
                       bundle+"/Contents/Resources/"+AuxFreshBootstrapIdentity.resource]
            if role == .daemon {
                paths.append(bundle+"/Contents/Resources/node-development/index.mjs")
                paths.append(bundle+"/Contents/Resources/node-development/aux-native-entry.mjs")
            }
            self.code=code;self.expectedHash=expectedHash
            files=try paths.map{try OrdinaryFileBinding($0)}
        }
        func revalidate()throws {for file in files{try file.revalidate()}}
        func matches(_ other:SecStaticCode,_ hash:Data)->Bool {
            Unmanaged.passUnretained(code).toOpaque()==Unmanaged.passUnretained(other).toOpaque() && expectedHash==hash
        }
    }
    private static let ordinaryProcess=getpid()
    private static let ordinaryFilesLock=NSLock()
    private static var ordinaryFiles:OrdinaryGuestFiles?
    private static func retainedOrdinaryFiles(_ code:SecStaticCode,_ hash:Data)throws->OrdinaryGuestFiles {
        guard getpid()==ordinaryProcess else{throw AuxFreshBootstrapPolicyError.identity}
        ordinaryFilesLock.lock();defer{ordinaryFilesLock.unlock()}
        if let current=ordinaryFiles,current.matches(code,hash) {try current.revalidate();return current}
        ordinaryFiles=nil
        let current=try OrdinaryGuestFiles(code:code,expectedHash:hash)
        try current.revalidate();ordinaryFiles=current;return current
    }
    private static func invalidateOrdinaryFiles(_ code:SecStaticCode,_ hash:Data) {
        guard getpid()==ordinaryProcess else{return}
        ordinaryFilesLock.lock();defer{ordinaryFilesLock.unlock()}
        if ordinaryFiles?.matches(code,hash)==true{ordinaryFiles=nil}
    }
#endif
'''
swift='chrome/browser/aux/native_peer_policy/AuxAuthenticatedChildParentPolicyReader.swift'
emit(swift,[('    private static func canonical(_ path:String)throws->String {\n',helper+'    private static func canonical(_ path:String)throws->String {\n'),('        guard [20, 32].contains(expectedCdHash.count) else { throw AuxFreshBootstrapPolicyError.identity }\n','''        guard [20, 32].contains(expectedCdHash.count) else { throw AuxFreshBootstrapPolicyError.identity }
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        var finished=false
        defer{if !finished{invalidateOrdinaryFiles(code,expectedCdHash)}}
        let retained=try retainedOrdinaryFiles(code,expectedCdHash)
#endif
'''),('        returned = true\n        return descriptor','''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        try retained.revalidate()
        finished=true
#endif
        returned = true
        return descriptor''')],'c1cc8b051fcc3bf431a9b8db1bff92b65146ed991e68d536e0aa70b4ce59c58d')
projection={'format':'aux.browser-peer-security-handles.v1','files':rows,'sourceCount':len(rows),'anchorCount':sum(len(r['anchors']) for r in rows),'originalValidityCallsFlagsAndResourcesPreserved':True,'oneAuditEntryPerNativePolicy':True,'oneHeldFileEntryPerSwiftProcess':True,'noCachedAdmission':True,'compiled':False,'productExecuted':False}
(HERE/'projection.json').write_text(json.dumps(projection,indent=2)+'\n');(HERE/'browser-peer-identity-reuse.patch').write_text(''.join(patch));print(json.dumps({'sources':len(rows),'anchors':projection['anchorCount']}))
