// Actual signature + sealed-resource loader SOURCE. No SecItem/SecKey call.
import Foundation
import Security
import CryptoKit
import Darwin
import MachO

@_silgen_name("AuxCleanHostImportedSecuritySymbol")
private func developmentImportedSecuritySymbol(_ index:UInt32)->UnsafeRawPointer?
struct AuxAuthenticatedFreshBootstrapPolicy {
    let contents:AuxFreshBootstrapPolicyContents
    let policySha256:String
    let bundlePath:String
    let hostCdHash:String
    let state2LaunchAuthorized=false
    let writerCustodyVerified=false
    let authorityProvenanceVerified=false
    fileprivate init(contents:AuxFreshBootstrapPolicyContents,bytes:Data,bundle:String,cdHash:String){self.contents=contents;policySha256=freshBootstrapDigest(bytes);bundlePath=bundle;hostCdHash=cdHash}
    // Native-only fresh-home creation; no key generation/storage/activation.
    // Re-authenticate current image/resource before any new filesystem entry.
    func createFreshHome()throws->AuxFreshNativeHome {
        let current=try AuxSignedFreshBootstrapPolicyLoader.load()
        guard current.policySha256==policySha256,current.bundlePath==bundlePath,current.hostCdHash==hostCdHash else{throw AuxFreshBootstrapPolicyError.identity}
        return try AuxFreshNativeHome.create(inCanonicalPrivateParent:contents.canonicalPrivateParent)
    }
}
enum AuxSignedFreshBootstrapPolicyLoader {
    private static let flags=SecCSFlags(rawValue:kSecCSStrictValidate|kSecCSCheckAllArchitectures|kSecCSCheckNestedCode|kSecCSRestrictSymlinks|UInt32(1<<29))
    private static func canonical(_ path:String)throws->String {
        guard let result=realpath(path,nil)else{throw AuxFreshBootstrapPolicyError.path};defer{free(result)};return String(cString:result)
    }
    private static func metadata(_ fd:Int32,directory:Bool,privateDirectory:Bool=false,maximumSize:Int64=16_384)throws->stat {
        var value=stat();guard fstat(fd,&value)==0,value.st_mode & mode_t(S_IFMT)==mode_t(directory ? S_IFDIR:S_IFREG),value.st_uid==geteuid() || (!privateDirectory && value.st_uid==0),value.st_mode & 0o022==0,
              !privateDirectory || value.st_mode & 0o7777==0o700,directory || (value.st_nlink==1 && value.st_size>0 && value.st_size<=maximumSize) else{throw AuxFreshBootstrapPolicyError.path}
        errno=0;let captured=acl_get_fd_np(fd,ACL_TYPE_EXTENDED);if captured==nil && errno==ENOENT{return value}
        guard let acl=captured else{throw AuxFreshBootstrapPolicyError.path};defer{acl_free(UnsafeMutableRawPointer(acl))};var entry:acl_entry_t?;errno=0
        guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry)==(-1),errno==EINVAL,entry==nil else{throw AuxFreshBootstrapPolicyError.path};return value
    }
    private static func sameEntry(_ parent:Int32,_ name:String,_ fd:Int32)throws {
        var entry=stat(),current=stat();guard fstatat(parent,name,&entry,AT_SYMLINK_NOFOLLOW)==0,fstat(fd,&current)==0,entry.st_dev==current.st_dev,entry.st_ino==current.st_ino,entry.st_mode==current.st_mode,entry.st_uid==current.st_uid else{throw AuxFreshBootstrapPolicyError.path}
    }
    private static func signingInfo(_ code:SecStaticCode)throws->[String:Any] {
        var dictionary:CFDictionary?;let status=SecCodeCopySigningInformation(code,SecCSFlags(rawValue:kSecCSSigningInformation),&dictionary)
        guard status==errSecSuccess,let info=dictionary as? [String:Any]else{throw AuxFreshBootstrapPolicyError.signature(status)};return info
    }
    private static func signature(_ info:[String:Any])throws->AuxCapturedFreshBootstrapSignature {
        guard let identifier=info[kSecCodeInfoIdentifier as String] as? String,let team=info[kSecCodeInfoTeamIdentifier as String] as? String,let certificates=info[kSecCodeInfoCertificates as String] as? [SecCertificate],let leaf=certificates.first,let flags=info[kSecCodeInfoFlags as String] as? NSNumber else{throw AuxFreshBootstrapPolicyError.identity}
        let entitlements=info[kSecCodeInfoEntitlementsDict as String] as? [String:Any] ?? [:]
        return .init(identifier:identifier,team:team,certificateSha256:freshBootstrapDigest(SecCertificateCopyData(leaf) as Data),applicationIdentifier:entitlements["com.apple.application-identifier"] as? String ?? "",accessGroups:entitlements["keychain-access-groups"] as? [String] ?? [],flags:flags.uint32Value,entitlements:entitlements)
    }
    private static func requirement()throws->SecRequirement {
        var requirement:SecRequirement?;let text="anchor apple generic and certificate leaf[subject.OU] = \""+AuxFreshBootstrapIdentity.team+"\""
        let status=SecRequirementCreateWithString(text as CFString,[],&requirement);guard status==errSecSuccess,let result=requirement else{throw AuxFreshBootstrapPolicyError.signature(status)};return result
    }
    private static func executable()throws->String {
        var size:UInt32=4096;var name=[CChar](repeating:0,count:Int(size));guard _NSGetExecutablePath(&name,&size)==0 else{throw AuxFreshBootstrapPolicyError.path};return try canonical(String(cString:name))
    }
    private static func resource(_ bundle:String)throws->Data {
        guard try canonical(bundle)==bundle else{throw AuxFreshBootstrapPolicyError.path}
        let root=open(bundle,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard root>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(root)};_ = try metadata(root,directory:true)
        let contents=openat(root,"Contents",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard contents>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(contents)};_ = try metadata(contents,directory:true);try sameEntry(root,"Contents",contents)
        let resources=openat(contents,"Resources",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard resources>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(resources)};_ = try metadata(resources,directory:true);try sameEntry(contents,"Resources",resources)
        let fd=openat(resources,AuxFreshBootstrapIdentity.resource,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(fd)};let before=try metadata(fd,directory:false);try sameEntry(resources,AuxFreshBootstrapIdentity.resource,fd)
        var bytes=[UInt8](repeating:0,count:Int(before.st_size));var offset=0
        while offset<bytes.count {let remaining=bytes.count-offset;let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),remaining)};if amount<0 && errno==EINTR{continue};guard amount>0 else{throw AuxFreshBootstrapPolicyError.resource};offset += amount}
        let after=try metadata(fd,directory:false)
        guard before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw AuxFreshBootstrapPolicyError.resource}
        try sameEntry(resources,AuxFreshBootstrapIdentity.resource,fd);try sameEntry(contents,"Resources",resources);try sameEntry(root,"Contents",contents)
        let fresh=open(bundle,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fresh>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(fresh)}
        let a=try metadata(root,directory:true),b=try metadata(fresh,directory:true);guard a.st_dev==b.st_dev,a.st_ino==b.st_ino else{throw AuxFreshBootstrapPolicyError.path};return Data(bytes)
    }
    private static func privateParent(_ path:String)throws {
        guard try canonical(path)==path else{throw AuxFreshBootstrapPolicyError.path}
        let fd=open(path,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(fd)}
        let captured=try metadata(fd,directory:true,privateDirectory:true);var actual=stat();guard lstat(path,&actual)==0,actual.st_dev==captured.st_dev,actual.st_ino==captured.st_ino else{throw AuxFreshBootstrapPolicyError.path}
    }
    // Two finite native module paths only. Stream its exact reviewed byte count through
    // owned/no-link FDs, never accept arbitrary policy paths or image bytes.
    private static func nativeModuleDigest(bundle:String,expectedBytes:Int,leaf:String)throws->String {
        guard ["aux-pdf.node","aux-macos-utilities.node"].contains(leaf) else{throw AuxFreshBootstrapPolicyError.path}
        guard try canonical(bundle)==bundle else{throw AuxFreshBootstrapPolicyError.path}
        let root=open(bundle,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard root>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(root)};_ = try metadata(root,directory:true)
        var held:[Int32]=[];defer{for fd in held.reversed(){close(fd)}};var parent=root
        var entries:[(Int32,String,Int32)]=[]
        for name in ["Contents","Resources","native"] {
            let fd=openat(parent,name,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw AuxFreshBootstrapPolicyError.path};held.append(fd)
            _ = try metadata(fd,directory:true);try sameEntry(parent,name,fd);entries.append((parent,name,fd));parent=fd
        }
        let fd=openat(parent,leaf,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(fd)}
        let before=try metadata(fd,directory:false,maximumSize:Int64(expectedBytes));guard before.st_size==Int64(expectedBytes) else{throw AuxFreshBootstrapPolicyError.image};try sameEntry(parent,leaf,fd)
        var hasher=SHA256(),remaining=expectedBytes,buffer=[UInt8](repeating:0,count:65_536)
        while remaining>0 {let requested=min(buffer.count,remaining);let amount=buffer.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!,requested)};if amount<0 && errno==EINTR{continue};guard amount>0 else{throw AuxFreshBootstrapPolicyError.image};hasher.update(data:Data(buffer.prefix(amount)));remaining -= amount}
        var extra:UInt8=0;var readExtra:Int;repeat{readExtra=Darwin.read(fd,&extra,1)}while readExtra<0 && errno==EINTR;guard readExtra==0 else{throw AuxFreshBootstrapPolicyError.image}
        let after=try metadata(fd,directory:false,maximumSize:Int64(expectedBytes))
        guard before.st_dev==after.st_dev,before.st_ino==after.st_ino,before.st_mode==after.st_mode,before.st_uid==after.st_uid,before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw AuxFreshBootstrapPolicyError.image}
        try sameEntry(parent,leaf,fd);for (directory,name,child) in entries.reversed(){_ = try metadata(child,directory:true);try sameEntry(directory,name,child)}
        let fresh=open(bundle,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fresh>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(fresh)}
        let a=try metadata(root,directory:true),b=try metadata(fresh,directory:true);guard a.st_dev==b.st_dev,a.st_ino==b.st_ino else{throw AuxFreshBootstrapPolicyError.path}
        return hasher.finalize().map{String(format:"%02x",$0)}.joined()
    }
    private static func pdfDigest(bundle:String,expectedBytes:Int)throws->String {
        try nativeModuleDigest(bundle:bundle,expectedBytes:expectedBytes,leaf:"aux-pdf.node")
    }
    private static func images(bundle:String,policy:AuxFreshBootstrapPolicyContents,requirement:SecRequirement)throws {
        let role=policy.role
        for name in ProcessInfo.processInfo.environment.keys {guard !name.hasPrefix("DYLD_"),name != "NODE_OPTIONS",!name.hasPrefix("AUX_ENABLE_PROVIDED_"),name != "AUX_PROVIDED_NATIVE_LOAD_ONLY" else{throw AuxFreshBootstrapPolicyError.image}}
        let expected=freshBootstrapExpectedImageIdentifiers(bundle:bundle,policy:policy)
        let count=_dyld_image_count();guard count>0,count<=4096 else{throw AuxFreshBootstrapPolicyError.image};var observed=Set<String>(),paths=[String]()
        for index in 0..<count {
            guard let raw=_dyld_get_image_name(index)else{throw AuxFreshBootstrapPolicyError.image};let path=String(cString:raw);paths.append(path)
            guard path.hasPrefix("/"),URL(fileURLWithPath:path).standardizedFileURL.path==path else{throw AuxFreshBootstrapPolicyError.image}
            if path.hasPrefix("/System/Library/") || path.hasPrefix("/usr/lib/"){continue}
            guard let identifier=expected[path],try canonical(path)==path else{throw AuxFreshBootstrapPolicyError.image}
            var code:SecStaticCode?;let created=SecStaticCodeCreateWithPath(URL(fileURLWithPath:path) as CFURL,[],&code);guard created==errSecSuccess,let code=code else{throw AuxFreshBootstrapPolicyError.signature(created)}
            let status=SecStaticCodeCheckValidity(code,flags,requirement);guard status==errSecSuccess else{throw AuxFreshBootstrapPolicyError.signature(status)}
            let captured=try signature(signingInfo(code));guard captured.identifier==identifier else{throw AuxFreshBootstrapPolicyError.identity}
            if identifier==AuxFreshBootstrapPdfIdentity.identifier {
                try validateCapturedFreshBootstrapPdfSignature(captured)
                try validateCapturedFreshBootstrapPdfBytes(sha256:pdfDigest(bundle:bundle,expectedBytes:policy.pdfBytes),bytes:policy.pdfBytes,policy:policy)
            } else if identifier==AuxFreshBootstrapMacUtilitiesIdentity.identifier {
                try validateCapturedFreshBootstrapMacUtilitySignature(captured)
                try validateCapturedFreshBootstrapMacUtilityBytes(sha256:nativeModuleDigest(bundle:bundle,expectedBytes:AuxFreshBootstrapMacUtilitiesIdentity.bytes,leaf:"aux-macos-utilities.node"),bytes:AuxFreshBootstrapMacUtilitiesIdentity.bytes,policy:policy)
            } else {try validateCapturedFreshBootstrapSignature(captured,role:role,host:path.hasSuffix("/Contents/MacOS/"+role.executable),accessGroup:policy.accessGroup)}
            observed.insert(path)
        }
        try validateCapturedFreshBootstrapImagePaths(paths,bundle:bundle,policy:policy)
        guard observed==Set(expected.keys),count==_dyld_image_count() else{throw AuxFreshBootstrapPolicyError.image}
        let global=UnsafeMutableRawPointer(bitPattern:-2)
        for symbol in ["AuxNativeBoundaryValidate","AuxNativeBoundaryConfigureScope","AuxNativeBoundaryDenyAll","AuxNativeBoundaryIsDenyAll","AuxNativeBoundaryRefusedCalls"]{guard dlsym(global,symbol)==nil else{throw AuxFreshBootstrapPolicyError.image}}
        for index:UInt32 in 0..<5 {guard let pointer=developmentImportedSecuritySymbol(index)else{throw AuxFreshBootstrapPolicyError.image};var info=Dl_info();guard dladdr(pointer,&info) != 0,let path=info.dli_fname,String(cString:path)=="/System/Library/Frameworks/Security.framework/Versions/A/Security" else{throw AuxFreshBootstrapPolicyError.image}}
    }
    // No policy/path/role parameter: read ONLY this authenticated running bundle's
    // fixed sealed resource. Source-only until a real native owner admits it.
    static func load()throws->AuxAuthenticatedFreshBootstrapPolicy {
        var dynamic:SecCode?;let own=SecCodeCopySelf([],&dynamic);guard own==errSecSuccess,let dynamic=dynamic else{throw AuxFreshBootstrapPolicyError.signature(own)}
        let requirement=try requirement(),dynamicFlags=SecCSFlags(rawValue:kSecCSStrictValidate|UInt32(1<<29))
        let checked=SecCodeCheckValidity(dynamic,dynamicFlags,requirement);guard checked==errSecSuccess else{throw AuxFreshBootstrapPolicyError.signature(checked)}
        var staticCode:SecStaticCode?;let copied=SecCodeCopyStaticCode(dynamic,[],&staticCode);guard copied==errSecSuccess,let staticCode=staticCode else{throw AuxFreshBootstrapPolicyError.signature(copied)}
        let valid=SecStaticCodeCheckValidity(staticCode,flags,requirement);guard valid==errSecSuccess else{throw AuxFreshBootstrapPolicyError.signature(valid)}
        let info=try signingInfo(staticCode),captured=try signature(info)
        guard let role=AuxFreshBootstrapPolicyContents.Role.all.first(where:{$0.identifier==captured.identifier})else{throw AuxFreshBootstrapPolicyError.identity}
        guard captured.accessGroups.count==1 else{throw AuxFreshBootstrapPolicyError.identity}
        try validateCapturedFreshBootstrapSignature(captured,role:role,host:true,accessGroup:captured.accessGroups[0])
        guard let plist=info[kSecCodeInfoPList as String] as? [String:Any],plist["CFBundlePackageType"] as? String=="APPL",plist["CFBundleIdentifier"] as? String==role.identifier,plist["CFBundleExecutable"] as? String==role.executable else{throw AuxFreshBootstrapPolicyError.identity}
        let executable=try Self.executable(),bundle=URL(fileURLWithPath:executable).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().path
        guard executable==bundle+"/Contents/MacOS/"+role.executable,bundle.hasSuffix(".app"),let declared=info[kSecCodeInfoMainExecutable as String] as? URL,declared.path==executable else{throw AuxFreshBootstrapPolicyError.path}
        var copiedPath:CFURL?;let located=SecCodeCopyPath(staticCode,[],&copiedPath);guard located==errSecSuccess,let copiedPath=copiedPath,(copiedPath as URL).path==bundle else{throw AuxFreshBootstrapPolicyError.signature(located)}
        let bytes=try resource(bundle)
        let sealed=SecCodeValidateFileResource(staticCode,AuxFreshBootstrapIdentity.resourceRelative as CFString,bytes as CFData,[]);guard sealed==errSecSuccess else{throw AuxFreshBootstrapPolicyError.signature(sealed)}
        let policy=try AuxFreshBootstrapPolicyContents.decode(bytes);guard policy.role==role,policy.accessGroup==captured.accessGroups[0] else{throw AuxFreshBootstrapPolicyError.policy}
        try images(bundle:bundle,policy:policy,requirement:requirement);try privateParent(policy.canonicalPrivateParent)
        guard try resource(bundle)==bytes else{throw AuxFreshBootstrapPolicyError.resource}
        let final=SecStaticCodeCheckValidity(staticCode,flags,requirement),live=SecCodeCheckValidity(dynamic,dynamicFlags,requirement)
        guard final==errSecSuccess,live==errSecSuccess else{throw AuxFreshBootstrapPolicyError.signature(final != 0 ? final:live)}
        guard let cdHash=info[kSecCodeInfoUnique as String] as? Data else{throw AuxFreshBootstrapPolicyError.identity}
        return .init(contents:policy,bytes:bytes,bundle:bundle,cdHash:cdHash.map{String(format:"%02x",$0)}.joined())
    }
}
private extension AuxFreshBootstrapPolicyContents.Role {static let all:[Self]=[.daemon,.cli]}
