// Inactive native-host source. No SecItem/SecKey operation, loader or JS API.
import Foundation
import CryptoKit
import Security
import Darwin
import MachO

@_silgen_name("AuxCleanHostImportedSecuritySymbol")
private func AuxCleanHostImportedSecuritySymbol(_ index:UInt32)->UnsafeRawPointer?

enum AuxCleanHostError:Error {case policy,signature(OSStatus),identity,interposition,image,home,selection}
private func cleanHash(_ bytes:Data)->String{SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()}
private func cleanHex(_ text:String,_ count:Int)->Bool{text.utf8.count==count && text.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}
struct AuxCleanHostPolicy:Encodable {
    enum Role:String,Encodable {case daemon,cli,migration}
    let role:Role
    let teamIdentifier:String
    let signingIdentifier:String
    let applicationIdentifier:String
    let accessGroup:String
    let executablePath:String
    let cdHash:String
    let privateParent:String
    let canonicalDisposableHome:String
    let scope:String
    // Exhaustive additional non-system loaded images, with reviewed file hashes.
    // Main executable MUST also be present here. Never supplied by JS/environment.
    let imageSha256:[String:String]
    func encoded()throws->Data{let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes];return try encoder.encode(self)}
    var policySha256:String {get throws{cleanHash(try encoded())}}
    func validate()throws {
        let expected:String
        switch role{case .daemon:expected="dev.aux.browser.daemon";case .cli:expected="dev.aux.browser.cli";case .migration:expected="dev.aux.browser.installation-migration"}
        func path(_ value:String)->Bool{value.hasPrefix("/") && value.utf8.allSatisfy{(32...126).contains($0)} && !value.utf8.contains(0) && value.utf8.count<4096 && URL(fileURLWithPath:value).standardizedFileURL.path==value}
        guard teamIdentifier.utf8.count==10,teamIdentifier.utf8.allSatisfy({(48...57).contains($0)||(65...90).contains($0)}),signingIdentifier==expected,
              applicationIdentifier==teamIdentifier+"."+signingIdentifier,accessGroup.hasPrefix(teamIdentifier+".dev.aux."),accessGroup.utf8.count<=256,accessGroup.utf8.allSatisfy({(48...57).contains($0)||(65...90).contains($0)||(97...122).contains($0)||[45,46,95].contains($0)}),!accessGroup.contains(".."),!accessGroup.hasSuffix("."),
              path(executablePath),[40,64].contains(cdHash.count),cleanHex(cdHash,cdHash.count),path(privateParent),path(canonicalDisposableHome),
              privateParent.hasPrefix("/private/tmp/aux-") || privateParent.hasPrefix("/private/var/folders/"),
              URL(fileURLWithPath:privateParent).lastPathComponent.hasPrefix("aux-"),URL(fileURLWithPath:canonicalDisposableHome).deletingLastPathComponent().path==privateParent,URL(fileURLWithPath:canonicalDisposableHome).lastPathComponent.hasPrefix("aux-"),
              scope==cleanHash(Data(canonicalDisposableHome.utf8)),imageSha256.count>0,imageSha256.count<=128,imageSha256[executablePath] != nil,
              imageSha256.allSatisfy({path($0.key) && cleanHex($0.value,64) && !Self.boundaryImage($0.key)}) else{throw AuxCleanHostError.policy}
    }
    static func boundaryImage(_ path:String)->Bool {
        let leaf=URL(fileURLWithPath:path).lastPathComponent.lowercased()
        return ["libaux-native-boundary.dylib","aux-native-guard.node"].contains(leaf)
    }
}
// Pure captured data checks are exposed for focused fixtures only. They do not
// mint an observation/authority and are NOT the actual collector entry point.
struct CapturedAuxHostIdentity {
    let executablePath:String;let signingIdentifier:String;let teamIdentifier:String
    let applicationIdentifier:String;let accessGroups:[String];let cdHash:String
    let hardenedRuntime:Bool;let adHoc:Bool;let insecureEntitlement:Bool
}
func validateCapturedAuxHostIdentity(_ captured:CapturedAuxHostIdentity,policy:AuxCleanHostPolicy)throws {
    try policy.validate()
    guard captured.executablePath==policy.executablePath,captured.signingIdentifier==policy.signingIdentifier,captured.teamIdentifier==policy.teamIdentifier,
          captured.applicationIdentifier==policy.applicationIdentifier,captured.accessGroups==[policy.accessGroup],captured.cdHash==policy.cdHash,
          captured.hardenedRuntime,!captured.adHoc,!captured.insecureEntitlement else{throw AuxCleanHostError.identity}
}
struct AuxObservedCleanHost {
    let policySha256:String
    let role:AuxCleanHostPolicy.Role
    let scope:String
    let accessGroup:String
    let state2LaunchAuthorized=false
    let writerCustodyVerified=false
    let authorityProvenanceVerified=false
    // No Codable/memberwise public construction from captured facts or JSON.
    fileprivate init(policy:AuxCleanHostPolicy)throws{policySha256=try policy.policySha256;role=policy.role;scope=policy.scope;accessGroup=policy.accessGroup}
}

enum AuxCleanHostPreflight {
    private static func canonical(_ path:String)throws->String {
        guard let pointer=realpath(path,nil)else{throw AuxCleanHostError.home};defer{free(pointer)};return String(cString:pointer)
    }
    private static func metadata(_ fd:Int32,directory:Bool)throws->stat {
        var value=stat();guard fstat(fd,&value)==0,(directory ? value.st_uid==geteuid():(value.st_uid==geteuid() || value.st_uid==0)),value.st_mode & mode_t(S_IFMT)==mode_t(directory ? S_IFDIR:S_IFREG),
              directory ? value.st_mode & 0o7777==0o700:(value.st_mode & 0o022==0 && value.st_nlink==1),value.st_size>=0 else{throw AuxCleanHostError.home}
        errno=0;let captured=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        if captured==nil && errno==ENOENT{return value}
        guard let acl=captured else{throw AuxCleanHostError.home};defer{acl_free(UnsafeMutableRawPointer(acl))}
        var entry:acl_entry_t?;errno=0
        guard acl_valid(acl)==0,acl_get_entry(acl,0,&entry)==(-1),errno==EINVAL,entry==nil else{throw AuxCleanHostError.home};return value
    }
    private static func privateHome(_ policy:AuxCleanHostPolicy)throws {
        guard try canonical(policy.privateParent)==policy.privateParent,try canonical(policy.canonicalDisposableHome)==policy.canonicalDisposableHome else{throw AuxCleanHostError.home}
        let parent=open(policy.privateParent,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard parent>=0 else{throw AuxCleanHostError.home};defer{close(parent)}
        _ = try metadata(parent,directory:true)
        let leaf=URL(fileURLWithPath:policy.canonicalDisposableHome).lastPathComponent
        let home=openat(parent,leaf,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);guard home>=0 else{throw AuxCleanHostError.home};defer{close(home)}
        let captured=try metadata(home,directory:true);var entry=stat()
        guard fstatat(parent,leaf,&entry,AT_SYMLINK_NOFOLLOW)==0,captured.st_dev==entry.st_dev,captured.st_ino==entry.st_ino else{throw AuxCleanHostError.home}
        var actualParent=stat(),actualHome=stat();let capturedParent=try metadata(parent,directory:true)
        guard lstat(policy.privateParent,&actualParent)==0,lstat(policy.canonicalDisposableHome,&actualHome)==0,
              actualParent.st_dev==capturedParent.st_dev,actualParent.st_ino==capturedParent.st_ino,actualHome.st_dev==captured.st_dev,actualHome.st_ino==captured.st_ino,
              try canonical(policy.canonicalDisposableHome)==policy.canonicalDisposableHome else{throw AuxCleanHostError.home}
    }
    private static func actualExecutable()throws->String {
        var size:UInt32=4096;var buffer=[CChar](repeating:0,count:Int(size))
        guard _NSGetExecutablePath(&buffer,&size)==0 else{throw AuxCleanHostError.identity}
        return try canonical(String(cString:buffer))
    }
    private static func imageHash(_ path:String)throws->String {
        guard try canonical(path)==path else{throw AuxCleanHostError.image}
        let fd=open(path,O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC);guard fd>=0 else{throw AuxCleanHostError.image};defer{close(fd)}
        let before=try metadata(fd,directory:false);guard before.st_size<=512*1024*1024 else{throw AuxCleanHostError.image}
        var hasher=SHA256();var buffer=[UInt8](repeating:0,count:64*1024);var count:Int64=0
        while true {
            let amount=buffer.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!,$0.count)}
            if amount<0 && errno==EINTR{continue};guard amount>=0 else{throw AuxCleanHostError.image};if amount==0{break}
            count += Int64(amount);guard count<=before.st_size else{throw AuxCleanHostError.image};hasher.update(data:Data(buffer.prefix(amount)))
        }
        let after=try metadata(fd,directory:false);var entry=stat()
        guard count==before.st_size,before.st_dev==after.st_dev,before.st_ino==after.st_ino,before.st_size==after.st_size,before.st_mtimespec.tv_sec==after.st_mtimespec.tv_sec,before.st_mtimespec.tv_nsec==after.st_mtimespec.tv_nsec,before.st_ctimespec.tv_sec==after.st_ctimespec.tv_sec,before.st_ctimespec.tv_nsec==after.st_ctimespec.tv_nsec,
              lstat(path,&entry)==0,entry.st_dev==after.st_dev,entry.st_ino==after.st_ino else{throw AuxCleanHostError.image}
        return hasher.finalize().map{String(format:"%02x",$0)}.joined()
    }
    private static func loadedImages(_ policy:AuxCleanHostPolicy)throws {
        // Negative environment checks only. No environment value accepts a host.
        for name in ProcessInfo.processInfo.environment.keys {
            guard !name.hasPrefix("DYLD_"),name != "NODE_OPTIONS",!name.hasPrefix("AUX_ENABLE_PROVIDED_"),name != "AUX_PROVIDED_NATIVE_LOAD_ONLY" else{throw AuxCleanHostError.interposition}
        }
        let count=_dyld_image_count();guard count>0,count<=4096 else{throw AuxCleanHostError.image}
        var observed=Set<String>()
        for index in 0..<count {
            guard let name=_dyld_get_image_name(index)else{throw AuxCleanHostError.image};let path=String(cString:name)
            guard path.hasPrefix("/"),URL(fileURLWithPath:path).standardizedFileURL.path==path,!AuxCleanHostPolicy.boundaryImage(path)else{throw AuxCleanHostError.interposition}
            if path.hasPrefix("/System/Library/") || path.hasPrefix("/usr/lib/"){continue}
            guard let expected=policy.imageSha256[path],try imageHash(path)==expected else{throw AuxCleanHostError.image};observed.insert(path)
        }
        guard observed==Set(policy.imageSha256.keys),count==_dyld_image_count() else{throw AuxCleanHostError.image}
        let global=UnsafeMutableRawPointer(bitPattern:-2)
        for symbol in ["AuxNativeBoundaryValidate","AuxNativeBoundaryConfigureScope","AuxNativeBoundaryDenyAll","AuxNativeBoundaryIsDenyAll","AuxNativeBoundaryRefusedCalls"] {
            guard dlsym(global,symbol)==nil else{throw AuxCleanHostError.interposition}
        }
        // Inspect actual imported function addresses, not a claimed status flag.
        for index:UInt32 in 0..<5 {guard let pointer=AuxCleanHostImportedSecuritySymbol(index) else{throw AuxCleanHostError.interposition};var info=Dl_info();guard dladdr(pointer,&info) != 0,let path=info.dli_fname,String(cString:path)=="/System/Library/Frameworks/Security.framework/Versions/A/Security" else{throw AuxCleanHostError.interposition}}

    }
    // Native-only immutable reviewed policy. An independent trusted native owner
    // must authenticate/retain its pins (no recursive embedded self-hash policy),
    // then call this before creating any protected executor or importing keys.
    // This function is SOURCE ONLY in this proposal; tests never invoke it.
    static func inspect(policy:AuxCleanHostPolicy)throws->AuxObservedCleanHost {
        try policy.validate();try loadedImages(policy);try privateHome(policy)
        guard try actualExecutable()==policy.executablePath else{throw AuxCleanHostError.identity}
        var code:SecCode?;let selfStatus=SecCodeCopySelf([], &code)
        guard selfStatus==errSecSuccess,let code=code else{throw AuxCleanHostError.signature(selfStatus)}
        let requirementText="anchor apple generic and identifier \""+policy.signingIdentifier+"\" and certificate leaf[subject.OU] = \""+policy.teamIdentifier+"\""
        var requirement:SecRequirement?;let requirementStatus=SecRequirementCreateWithString(requirementText as CFString,[],&requirement)
        guard requirementStatus==errSecSuccess,let requirement=requirement else{throw AuxCleanHostError.signature(requirementStatus)}
        // Public CSCommon.h defines no-network as bit29; not imported by Swift.
        let flags=SecCSFlags(rawValue:kSecCSStrictValidate | UInt32(1<<29))
        let status=SecCodeCheckValidity(code,flags,requirement);guard status==errSecSuccess else{throw AuxCleanHostError.signature(status)}
        var staticCode:SecStaticCode?;let staticStatus=SecCodeCopyStaticCode(code,[],&staticCode)
        guard staticStatus==errSecSuccess,let staticCode=staticCode else{throw AuxCleanHostError.signature(staticStatus)}
        var dictionary:CFDictionary?;let infoStatus=SecCodeCopySigningInformation(staticCode,SecCSFlags(rawValue:kSecCSSigningInformation),&dictionary)
        guard infoStatus==errSecSuccess,let info=dictionary as? [String:Any],let entitlements=info[kSecCodeInfoEntitlementsDict as String] as? [String:Any],
              let identifier=info[kSecCodeInfoIdentifier as String] as? String,let team=info[kSecCodeInfoTeamIdentifier as String] as? String,
              let cdHash=info[kSecCodeInfoUnique as String] as? Data,let number=info[kSecCodeInfoFlags as String] as? NSNumber,
              let application=entitlements["com.apple.application-identifier"] as? String,let groups=entitlements["keychain-access-groups"] as? [String] else{throw AuxCleanHostError.identity}
        var insecure=false
        for key in ["com.apple.security.cs.disable-library-validation","com.apple.security.cs.allow-dyld-environment-variables","com.apple.security.cs.allow-unsigned-executable-memory","com.apple.security.cs.disable-executable-page-protection","com.apple.security.get-task-allow","get-task-allow"] {
            if let value=entitlements[key] {guard CFGetTypeID(value as CFTypeRef)==CFBooleanGetTypeID(),let boolean=value as? NSNumber else{throw AuxCleanHostError.identity};insecure = insecure || boolean.boolValue}
        }
        let captured=CapturedAuxHostIdentity(executablePath:try actualExecutable(),signingIdentifier:identifier,teamIdentifier:team,applicationIdentifier:application,accessGroups:groups,cdHash:cdHash.map{String(format:"%02x",$0)}.joined(),hardenedRuntime:number.uint32Value & 0x10000 != 0,adHoc:number.uint32Value & 0x2 != 0,insecureEntitlement:insecure)
        try validateCapturedAuxHostIdentity(captured,policy:policy)
        let recheck=SecCodeCheckValidity(code,flags,requirement);guard recheck==errSecSuccess else{throw AuxCleanHostError.signature(recheck)}
        try loadedImages(policy);try privateHome(policy)
        return try AuxObservedCleanHost(policy:policy)
    }
}
