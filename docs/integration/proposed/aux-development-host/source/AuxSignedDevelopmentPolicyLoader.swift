// Actual signature + sealed-resource loader SOURCE. No SecItem/SecKey call.
import Foundation
import Security
import CryptoKit
import Darwin
import MachO

@_silgen_name("AuxCleanHostImportedSecuritySymbol")
private func developmentImportedSecuritySymbol(_ index:UInt32)->UnsafeRawPointer?
struct AuxAuthenticatedDevelopmentPolicy {
    let contents:AuxDevelopmentPolicyContents
    let policySha256:String
    let bundlePath:String
    let hostCdHash:String
    let state2LaunchAuthorized=false
    let writerCustodyVerified=false
    let authorityProvenanceVerified=false
    fileprivate init(contents:AuxDevelopmentPolicyContents,bytes:Data,bundle:String,cdHash:String){self.contents=contents;policySha256=developmentDigest(bytes);bundlePath=bundle;hostCdHash=cdHash}
}
enum AuxSignedDevelopmentPolicyLoader {
    private static let flags=SecCSFlags(rawValue:kSecCSStrictValidate|kSecCSCheckAllArchitectures|kSecCSCheckNestedCode|kSecCSRestrictSymlinks|UInt32(1<<29))
    private static func canonical(_ path:String)throws->String {
        guard let result=realpath(path,nil)else{throw AuxDevelopmentHostError.path};defer{free(result)};return String(cString:result)
    }
    private static func metadata(_ fd:Int32,directory:Bool,privateDirectory:Bool=false)throws->stat {
        var value=stat();guard fstat(fd,&value)==0,value.st_mode & mode_t(S_IFMT)==mode_t(directory ? S_IFDIR:S_IFREG),value.st_uid==geteuid() || (!privateDirectory && value.st_uid==0),value.st_mode & 0o022==0,
              !privateDirectory || value.st_mode & 0o7777==0o700,directory || (value.st_nlink==1 && value.st_size>0 && value.st_size<=16_384) else{throw AuxDevelopmentHostError.path}
        errno=0;let captured=acl_get_fd_np(fd,ACL_TYPE_EXTENDED);if captured==nil && errno==ENOENT{return value}
        guard let acl=captured else{throw AuxDevelopmentHostError.path};defer{acl_free(UnsafeMutableRawPointer(acl))};var entry:acl_entry_t?;errno=0
        guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry)==(-1),errno==EINVAL,entry==nil else{throw AuxDevelopmentHostError.path};return value
    }
    private static func sameEntry(_ parent:Int32,_ name:String,_ fd:Int32)throws {
        var entry=stat(),current=stat();guard fstatat(parent,name,&entry,AT_SYMLINK_NOFOLLOW)==0,fstat(fd,&current)==0,entry.st_dev==current.st_dev,entry.st_ino==current.st_ino,entry.st_mode==current.st_mode,entry.st_uid==current.st_uid else{throw AuxDevelopmentHostError.path}
    }
    private static func signingInfo(_ code:SecStaticCode)throws->[String:Any] {
        var dictionary:CFDictionary?;let status=SecCodeCopySigningInformation(code,SecCSFlags(rawValue:kSecCSSigningInformation),&dictionary)
        guard status==errSecSuccess,let info=dictionary as? [String:Any]else{throw AuxDevelopmentHostError.signature(status)};return info
    }
    private static func signature(_ info:[String:Any])throws->AuxCapturedDevelopmentSignature {
        guard let identifier=info[kSecCodeInfoIdentifier as String] as? String,let team=info[kSecCodeInfoTeamIdentifier as String] as? String,let certificates=info[kSecCodeInfoCertificates as String] as? [SecCertificate],let leaf=certificates.first,let flags=info[kSecCodeInfoFlags as String] as? NSNumber else{throw AuxDevelopmentHostError.identity}
        let entitlements=info[kSecCodeInfoEntitlementsDict as String] as? [String:Any] ?? [:]
        return .init(identifier:identifier,team:team,certificateSha256:developmentDigest(SecCertificateCopyData(leaf) as Data),applicationIdentifier:entitlements["com.apple.application-identifier"] as? String ?? "",accessGroups:entitlements["keychain-access-groups"] as? [String] ?? [],flags:flags.uint32Value,entitlements:entitlements)
    }
    private static func requirement()throws->SecRequirement {
        var requirement:SecRequirement?;let text="anchor apple generic and certificate leaf[subject.OU] = \""+AuxReviewedDevelopmentIdentity.team+"\""
        let status=SecRequirementCreateWithString(text as CFString,[],&requirement);guard status==errSecSuccess,let result=requirement else{throw AuxDevelopmentHostError.signature(status)};return result
    }
    private static func executable()throws->String {
        var size:UInt32=4096;var name=[CChar](repeating:0,count:Int(size));guard _NSGetExecutablePath(&name,&size)==0 else{throw AuxDevelopmentHostError.path};return try canonical(String(cString:name))
    }
    private static func resource(_ bundle:String)throws->Data {
        guard try canonical(bundle)==bundle else{throw AuxDevelopmentHostError.path}
        let root=open(bundle,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard root>=0 else{throw AuxDevelopmentHostError.path};defer{close(root)};_ = try metadata(root,directory:true)
        let contents=openat(root,"Contents",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard contents>=0 else{throw AuxDevelopmentHostError.path};defer{close(contents)};_ = try metadata(contents,directory:true);try sameEntry(root,"Contents",contents)
        let resources=openat(contents,"Resources",O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard resources>=0 else{throw AuxDevelopmentHostError.path};defer{close(resources)};_ = try metadata(resources,directory:true);try sameEntry(contents,"Resources",resources)
        let fd=openat(resources,AuxReviewedDevelopmentIdentity.resource,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw AuxDevelopmentHostError.path};defer{close(fd)};let before=try metadata(fd,directory:false);try sameEntry(resources,AuxReviewedDevelopmentIdentity.resource,fd)
        var bytes=[UInt8](repeating:0,count:Int(before.st_size));var offset=0
        while offset<bytes.count {let remaining=bytes.count-offset;let amount=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),remaining)};if amount<0 && errno==EINTR{continue};guard amount>0 else{throw AuxDevelopmentHostError.resource};offset += amount}
        let after=try metadata(fd,directory:false)
        guard before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec else{throw AuxDevelopmentHostError.resource}
        try sameEntry(resources,AuxReviewedDevelopmentIdentity.resource,fd);try sameEntry(contents,"Resources",resources);try sameEntry(root,"Contents",contents)
        let fresh=open(bundle,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fresh>=0 else{throw AuxDevelopmentHostError.path};defer{close(fresh)}
        let a=try metadata(root,directory:true),b=try metadata(fresh,directory:true);guard a.st_dev==b.st_dev,a.st_ino==b.st_ino else{throw AuxDevelopmentHostError.path};return Data(bytes)
    }
    private static func home()throws {
        let path=AuxReviewedDevelopmentIdentity.home;guard try canonical(path)==path else{throw AuxDevelopmentHostError.path}
        let fd=open(path,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw AuxDevelopmentHostError.path};defer{close(fd)}
        let captured=try metadata(fd,directory:true,privateDirectory:true);var actual=stat();guard lstat(path,&actual)==0,actual.st_dev==captured.st_dev,actual.st_ino==captured.st_ino else{throw AuxDevelopmentHostError.path}
    }
    private static func images(bundle:String,role:AuxDevelopmentPolicyContents.Role,requirement:SecRequirement)throws {
        for name in ProcessInfo.processInfo.environment.keys {guard !name.hasPrefix("DYLD_"),name != "NODE_OPTIONS",!name.hasPrefix("AUX_ENABLE_PROVIDED_"),name != "AUX_PROVIDED_NATIVE_LOAD_ONLY" else{throw AuxDevelopmentHostError.image}}
        let expected=[bundle+"/Contents/MacOS/"+role.executable:role.identifier,bundle+"/Contents/Resources/native/aux-runtime-owned.node":"dev.aux.browser.runtime"]
        let count=_dyld_image_count();guard count>0,count<=4096 else{throw AuxDevelopmentHostError.image};var observed=Set<String>()
        for index in 0..<count {
            guard let raw=_dyld_get_image_name(index)else{throw AuxDevelopmentHostError.image};let path=String(cString:raw)
            guard path.hasPrefix("/"),URL(fileURLWithPath:path).standardizedFileURL.path==path else{throw AuxDevelopmentHostError.image}
            if path.hasPrefix("/System/Library/") || path.hasPrefix("/usr/lib/"){continue}
            guard let identifier=expected[path],try canonical(path)==path else{throw AuxDevelopmentHostError.image}
            var code:SecStaticCode?;let created=SecStaticCodeCreateWithPath(URL(fileURLWithPath:path) as CFURL,[],&code);guard created==errSecSuccess,let code=code else{throw AuxDevelopmentHostError.signature(created)}
            let status=SecStaticCodeCheckValidity(code,flags,requirement);guard status==errSecSuccess else{throw AuxDevelopmentHostError.signature(status)}
            let captured=try signature(signingInfo(code));guard captured.identifier==identifier else{throw AuxDevelopmentHostError.identity}
            try validateCapturedDevelopmentSignature(captured,role:role,host:path.hasSuffix("/Contents/MacOS/"+role.executable));observed.insert(path)
        }
        guard observed==Set(expected.keys),count==_dyld_image_count() else{throw AuxDevelopmentHostError.image}
        let global=UnsafeMutableRawPointer(bitPattern:-2)
        for symbol in ["AuxNativeBoundaryValidate","AuxNativeBoundaryConfigureScope","AuxNativeBoundaryDenyAll","AuxNativeBoundaryIsDenyAll","AuxNativeBoundaryRefusedCalls"]{guard dlsym(global,symbol)==nil else{throw AuxDevelopmentHostError.image}}
        for index:UInt32 in 0..<5 {guard let pointer=developmentImportedSecuritySymbol(index)else{throw AuxDevelopmentHostError.image};var info=Dl_info();guard dladdr(pointer,&info) != 0,let path=info.dli_fname,String(cString:path)=="/System/Library/Frameworks/Security.framework/Versions/A/Security" else{throw AuxDevelopmentHostError.image}}
    }
    // No policy/path/role parameter: read ONLY this authenticated running bundle's
    // fixed sealed resource. Source-only until a real native owner admits it.
    static func load()throws->AuxAuthenticatedDevelopmentPolicy {
        var dynamic:SecCode?;let own=SecCodeCopySelf([],&dynamic);guard own==errSecSuccess,let dynamic=dynamic else{throw AuxDevelopmentHostError.signature(own)}
        let requirement=try requirement(),dynamicFlags=SecCSFlags(rawValue:kSecCSStrictValidate|UInt32(1<<29))
        let checked=SecCodeCheckValidity(dynamic,dynamicFlags,requirement);guard checked==errSecSuccess else{throw AuxDevelopmentHostError.signature(checked)}
        var staticCode:SecStaticCode?;let copied=SecCodeCopyStaticCode(dynamic,[],&staticCode);guard copied==errSecSuccess,let staticCode=staticCode else{throw AuxDevelopmentHostError.signature(copied)}
        let valid=SecStaticCodeCheckValidity(staticCode,flags,requirement);guard valid==errSecSuccess else{throw AuxDevelopmentHostError.signature(valid)}
        let info=try signingInfo(staticCode),captured=try signature(info)
        guard let role=AuxDevelopmentPolicyContents.Role.all.first(where:{$0.identifier==captured.identifier})else{throw AuxDevelopmentHostError.identity}
        try validateCapturedDevelopmentSignature(captured,role:role,host:true)
        guard let plist=info[kSecCodeInfoPList as String] as? [String:Any],plist["CFBundlePackageType"] as? String=="APPL",plist["CFBundleIdentifier"] as? String==role.identifier,plist["CFBundleExecutable"] as? String==role.executable else{throw AuxDevelopmentHostError.identity}
        let executable=try Self.executable(),bundle=URL(fileURLWithPath:executable).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().path
        guard executable==bundle+"/Contents/MacOS/"+role.executable,bundle.hasSuffix(".app"),let declared=info[kSecCodeInfoMainExecutable as String] as? URL,declared.path==executable else{throw AuxDevelopmentHostError.path}
        var copiedPath:CFURL?;let located=SecCodeCopyPath(staticCode,[],&copiedPath);guard located==errSecSuccess,let copiedPath=copiedPath,(copiedPath as URL).path==bundle else{throw AuxDevelopmentHostError.signature(located)}
        let bytes=try resource(bundle)
        let sealed=SecCodeValidateFileResource(staticCode,AuxReviewedDevelopmentIdentity.resourceRelative as CFString,bytes as CFData,[]);guard sealed==errSecSuccess else{throw AuxDevelopmentHostError.signature(sealed)}
        let policy=try AuxDevelopmentPolicyContents.decode(bytes);guard policy.role==role else{throw AuxDevelopmentHostError.policy}
        try images(bundle:bundle,role:role,requirement:requirement);try home()
        guard try resource(bundle)==bytes else{throw AuxDevelopmentHostError.resource}
        let final=SecStaticCodeCheckValidity(staticCode,flags,requirement),live=SecCodeCheckValidity(dynamic,dynamicFlags,requirement)
        guard final==errSecSuccess,live==errSecSuccess else{throw AuxDevelopmentHostError.signature(final != 0 ? final:live)}
        guard let cdHash=info[kSecCodeInfoUnique as String] as? Data else{throw AuxDevelopmentHostError.identity}
        return .init(contents:policy,bytes:bytes,bundle:bundle,cdHash:cdHash.map{String(format:"%02x",$0)}.joined())
    }
}
private extension AuxDevelopmentPolicyContents.Role {static let all:[Self]=[.daemon,.cli]}
