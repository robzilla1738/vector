"""Retain real signing handles in ordinary mode without caching admission."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parents[1] / 'standard-profile-isolation/ordinary-fresh-browser-startup-a1/source/AuxSignedFreshBootstrapPolicyLoader.swift'
EXPECTED = '4d8db5a663a765e17508b6792a70dad25f89238431252fed99539c38284e5a7c'
sha = lambda data: hashlib.sha256(data).hexdigest()
original = SOURCE.read_bytes()
assert sha(original) == EXPECTED
text = original.decode()
anchors = []


def replace(before, after):
    global text
    assert text.count(before) == 1
    text = text.replace(before, after)
    anchors.append(dict(before=before, after=after, count=1))


before = '''    private static let flags=SecCSFlags(rawValue:kSecCSStrictValidate|kSecCSCheckAllArchitectures|kSecCSCheckNestedCode|kSecCSRestrictSymlinks|UInt32(1<<29))
'''
after = before + '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    // Keep Apple's actual code objects alive so their successful validation is
    // reusable. Every caller still runs the same native validity, live-image,
    // sealed-policy and private-root checks. No admission result is cached.
    private final class OrdinaryFileBinding {
        let path:String
        let descriptor:Int32
        let captured:stat
        init(_ path:String)throws {
            guard try canonical(path)==path else{throw AuxFreshBootstrapPolicyError.path}
            let fd=open(path,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC)
            guard fd>=0 else{throw AuxFreshBootstrapPolicyError.path}
            do {
                let value=try metadata(fd,directory:false,maximumSize:Int64.max)
                self.path=path;descriptor=fd;captured=value
            } catch {close(fd);throw error}
        }
        private func matches(_ value:stat)->Bool {
            captured.st_dev==value.st_dev && captured.st_ino==value.st_ino &&
            captured.st_mode==value.st_mode && captured.st_nlink==value.st_nlink &&
            captured.st_uid==value.st_uid && captured.st_gid==value.st_gid &&
            captured.st_flags==value.st_flags && captured.st_size==value.st_size &&
            captured.st_mtimespec.tv_sec==value.st_mtimespec.tv_sec &&
            captured.st_mtimespec.tv_nsec==value.st_mtimespec.tv_nsec &&
            captured.st_ctimespec.tv_sec==value.st_ctimespec.tv_sec &&
            captured.st_ctimespec.tv_nsec==value.st_ctimespec.tv_nsec
        }
        func revalidate()throws {
            let held=try metadata(descriptor,directory:false,maximumSize:Int64.max)
            var named=stat()
            guard matches(held),try canonical(path)==path,lstat(path,&named)==0,
                  matches(named) else{throw AuxFreshBootstrapPolicyError.identity}
        }
        deinit{close(descriptor)}
    }
    private final class OrdinaryCurrentCode {
        let process=getpid()
        let dynamic:SecCode
        let code:SecStaticCode
        let requirement:SecRequirement
        let executablePath:String
        let files:[OrdinaryFileBinding]
        init()throws {
            var own:SecCode?
            let ownStatus=SecCodeCopySelf([],&own)
            guard ownStatus==errSecSuccess,let own else{throw AuxFreshBootstrapPolicyError.signature(ownStatus)}
            var disk:SecStaticCode?
            let diskStatus=SecCodeCopyStaticCode(own,[],&disk)
            guard diskStatus==errSecSuccess,let disk else{throw AuxFreshBootstrapPolicyError.signature(diskStatus)}
            let executable=try AuxSignedFreshBootstrapPolicyLoader.executable()
            let bundle=URL(fileURLWithPath:executable).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().path
            let names=[executable,bundle+"/Contents/Info.plist",
                bundle+"/Contents/_CodeSignature/CodeResources",
                bundle+"/Contents/Resources/"+AuxFreshBootstrapIdentity.resource,
                bundle+"/Contents/Resources/node-development/index.mjs",
                bundle+"/Contents/Resources/node-development/aux-native-entry.mjs"]
            let bindings=try names.map{try OrdinaryFileBinding($0)}
            dynamic=own;code=disk;requirement=try AuxSignedFreshBootstrapPolicyLoader.requirement()
            executablePath=executable;files=bindings
            try revalidate()
        }
        func revalidate()throws {
            guard getpid()==process else{throw AuxFreshBootstrapPolicyError.identity}
            for file in files{try file.revalidate()}
        }
    }
    private static let ordinaryCodeLock=NSLock()
    private static var ordinaryCode:OrdinaryCurrentCode?
    private static func currentOrdinaryCode()throws->OrdinaryCurrentCode {
        ordinaryCodeLock.lock();defer{ordinaryCodeLock.unlock()}
        if let current=ordinaryCode{try current.revalidate();return current}
        let current=try OrdinaryCurrentCode();ordinaryCode=current;return current
    }
#endif
'''
replace(before, after)

before = '''            var code:SecStaticCode?;let created=SecStaticCodeCreateWithPath(URL(fileURLWithPath:path) as CFURL,[],&code);guard created==errSecSuccess,let code=code else{throw AuxFreshBootstrapPolicyError.signature(created)}
'''
after = '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
            let current=try currentOrdinaryCode()
            guard path==current.executablePath else{throw AuxFreshBootstrapPolicyError.image}
            let code=current.code
#else
''' + before + '''#endif
'''
replace(before, after)

before = '''        var dynamic:SecCode?;let own=SecCodeCopySelf([],&dynamic);guard own==errSecSuccess,let dynamic=dynamic else{throw AuxFreshBootstrapPolicyError.signature(own)}
        let requirement=try requirement(),dynamicFlags=SecCSFlags(rawValue:kSecCSStrictValidate|UInt32(1<<29))
        let checked=SecCodeCheckValidity(dynamic,dynamicFlags,requirement);guard checked==errSecSuccess else{throw AuxFreshBootstrapPolicyError.signature(checked)}
        var staticCode:SecStaticCode?;let copied=SecCodeCopyStaticCode(dynamic,[],&staticCode);guard copied==errSecSuccess,let staticCode=staticCode else{throw AuxFreshBootstrapPolicyError.signature(copied)}
'''
after = '''#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        let current=try currentOrdinaryCode()
        let dynamic=current.dynamic,staticCode=current.code,requirement=current.requirement
        let dynamicFlags=SecCSFlags(rawValue:kSecCSStrictValidate|UInt32(1<<29))
        let checked=SecCodeCheckValidity(dynamic,dynamicFlags,requirement);guard checked==errSecSuccess else{throw AuxFreshBootstrapPolicyError.signature(checked)}
#else
''' + before + '''#endif
'''
replace(before, after)

before = '''        guard let cdHash=info[kSecCodeInfoUnique as String] as? Data else{throw AuxFreshBootstrapPolicyError.identity}
        return .init(contents:policy,bytes:bytes,bundle:bundle,cdHash:cdHash.map{String(format:"%02x",$0)}.joined())
'''
after = '''        guard let cdHash=info[kSecCodeInfoUnique as String] as? Data else{throw AuxFreshBootstrapPolicyError.identity}
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        try current.revalidate()
#endif
        return .init(contents:policy,bytes:bytes,bundle:bundle,cdHash:cdHash.map{String(format:"%02x",$0)}.joined())
'''
replace(before, after)

output = HERE / 'startup-identity-reuse-source/AuxSignedFreshBootstrapPolicyLoader.swift'
output.parent.mkdir()
with output.open('x') as f:f.write(text)
patch = ''.join(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/AuxSignedFreshBootstrapPolicyLoader.swift',tofile='b/AuxSignedFreshBootstrapPolicyLoader.swift'))
with (HERE / 'startup-identity-reuse-a4.patch').open('x') as f:f.write(patch)
receipt = dict(format='aux.ordinary-fresh.native-identity-handle-reuse.v1',passed=True,
    input=str(SOURCE),inputSha256=EXPECTED,output=str(output.resolve()),outputSha256=sha(text.encode()),
    anchors=anchors,signatureFlagsUnchanged=True,nativeValidityCallsRetained=True,
    policyReadsAndDigestChecksRetained=True,privateRootChecksRetained=True,
    processBound=True,identityAndEntryFileBindings=6,cachedAdmission=False,
    nonOrdinaryModeUnchanged=True,productExecuted=False,signed=False,uiChanged=False)
with (HERE / 'actual-identity-reuse-projection-a4.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=True,changedSourceFiles=1,anchors=len(anchors),uiChanged=False)))
