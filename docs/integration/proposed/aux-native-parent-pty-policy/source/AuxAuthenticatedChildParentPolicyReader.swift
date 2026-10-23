// Exact read-only guest-policy subset. No installation, image loading, authority creation or credential API.
import Foundation
import Security
import CryptoKit
import Darwin

enum AuxAuthenticatedChildParentPolicyReader {
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
    fileprivate static func authenticatedGuestParent(
        code: SecStaticCode, requirement: SecRequirement, expectedCdHash: Data
    ) throws -> Int32 {
        guard [20, 32].contains(expectedCdHash.count) else { throw AuxFreshBootstrapPolicyError.identity }
        let validity = SecStaticCodeCheckValidity(code, flags, requirement)
        guard validity == errSecSuccess else { throw AuxFreshBootstrapPolicyError.signature(validity) }
        let info = try signingInfo(code)
        guard let actualHash = info[kSecCodeInfoUnique as String] as? Data, actualHash == expectedCdHash else {
            throw AuxFreshBootstrapPolicyError.identity
        }
        let captured = try signature(info)
        guard let role = [AuxFreshBootstrapPolicyContents.Role.daemon, .cli].first(where: { $0.identifier == captured.identifier }),
              let plist = info[kSecCodeInfoPList as String] as? [String: Any],
              plist["CFBundlePackageType"] as? String == "APPL",
              plist["CFBundleIdentifier"] as? String == role.identifier,
              plist["CFBundleExecutable"] as? String == role.executable else { throw AuxFreshBootstrapPolicyError.identity }
        var path: CFURL?
        let located = SecCodeCopyPath(code, [], &path)
        guard located == errSecSuccess, let path else { throw AuxFreshBootstrapPolicyError.signature(located) }
        let bundle = (path as URL).path
        guard try canonical(bundle) == bundle, bundle.hasSuffix(".app"),
              let main = info[kSecCodeInfoMainExecutable as String] as? URL,
              main.path == bundle + "/Contents/MacOS/" + role.executable else { throw AuxFreshBootstrapPolicyError.path }
        let bytes = try resource(bundle)
        let sealed = SecCodeValidateFileResource(code, AuxFreshBootstrapIdentity.resourceRelative as CFString, bytes as CFData, [])
        guard sealed == errSecSuccess else { throw AuxFreshBootstrapPolicyError.signature(sealed) }
        let policy = try AuxFreshBootstrapPolicyContents.decode(bytes)
        guard policy.role == role else { throw AuxFreshBootstrapPolicyError.policy }
        try validateCapturedFreshBootstrapSignature(captured, role: role, host: true, accessGroup: policy.accessGroup)
        // This is a guest-resource proof, not current-process image inspection.
        // The actual child producer separately revalidates its live image/guard
        // and provider-ready terminal around selected-home duplication.
        let parent = policy.canonicalPrivateParent
        guard try canonical(parent) == parent else { throw AuxFreshBootstrapPolicyError.path }
        let descriptor = open(parent, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
        guard descriptor >= 0 else { throw AuxFreshBootstrapPolicyError.path }
        var returned = false
        defer { if !returned { close(descriptor) } }
        _ = try metadata(descriptor, directory: true, privateDirectory: true)
        let repeated = open(parent, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
        guard repeated >= 0 else { throw AuxFreshBootstrapPolicyError.path }
        defer { close(repeated) }
        var before = stat(), after = stat()
        guard fstat(descriptor, &before) == 0, fstat(repeated, &after) == 0,
              before.st_dev == after.st_dev, before.st_ino == after.st_ino,
              try resource(bundle) == bytes else { throw AuxFreshBootstrapPolicyError.path }
        let final = SecStaticCodeCheckValidity(code, flags, requirement)
        guard final == errSecSuccess,
              (try signingInfo(code))[kSecCodeInfoUnique as String] as? Data == expectedCdHash else {
            throw AuxFreshBootstrapPolicyError.identity
        }
        returned = true
        return descriptor
    }
}

@_cdecl("AuxCopyAuthenticatedFreshChildParentDescriptor")
func AuxCopyAuthenticatedFreshChildParentDescriptor(
    _ codePointer: UnsafeRawPointer?, _ requirementPointer: UnsafeRawPointer?,
    _ expectedHash: UnsafePointer<UInt8>?, _ expectedHashBytes: UInt32,
    _ parentDescriptor: UnsafeMutablePointer<Int32>?
) -> Int32 {
    guard let parentDescriptor else { return -1 }
    parentDescriptor.pointee = -1
    guard let codePointer, let requirementPointer, let expectedHash,
          expectedHashBytes == 20 || expectedHashBytes == 32 else { return -1 }
    let code = Unmanaged<SecStaticCode>.fromOpaque(codePointer).takeUnretainedValue()
    let requirement = Unmanaged<SecRequirement>.fromOpaque(requirementPointer).takeUnretainedValue()
    guard CFGetTypeID(code) == SecStaticCodeGetTypeID(), CFGetTypeID(requirement) == SecRequirementGetTypeID() else { return -1 }
    do {
        parentDescriptor.pointee = try AuxAuthenticatedChildParentPolicyReader.authenticatedGuestParent(
            code: code, requirement: requirement,
            expectedCdHash: Data(bytes: expectedHash, count: Int(expectedHashBytes))
        )
        return 0
    } catch { return -1 }
}

// Read-only parent launch classification. Real sealed code/resource checks do
// not initialize authority or grant profile custody.
extension AuxAuthenticatedChildParentPolicyReader {
    fileprivate static func validateEmbeddedLaunch(
        code: SecStaticCode, requirement: SecRequirement, hash: Data
    ) -> Int32 {
        do {
            let parent = try authenticatedGuestParent(
                code: code, requirement: requirement, expectedCdHash: hash)
            defer { close(parent) }
            var path: CFURL?
            guard SecCodeCopyPath(code, [], &path) == errSecSuccess, let path else { return -1 }
            let bytes = try resource((path as URL).path)
            let policy = try AuxFreshBootstrapPolicyContents.decode(bytes)
            let format = try strictEnvelopeObject(bytes)["format"] as? String
            guard policy.role == .daemon, policy.embeddedDaemon,
                  format == "aux.fresh.bootstrap.policy.v2" || format == "aux.fresh.bootstrap.policy.v3",
                  format != "aux.fresh.bootstrap.policy.v3" || policy.ptyArtifacts != nil
            else { return -1 }
            let sealed = SecCodeValidateFileResource(code,
                AuxFreshBootstrapIdentity.resourceRelative as CFString, bytes as CFData, [])
            guard sealed == errSecSuccess,
                  SecStaticCodeCheckValidity(code, flags, requirement) == errSecSuccess,
                  (try signingInfo(code))[kSecCodeInfoUnique as String] as? Data == hash
            else { return -1 }
            return 0
        } catch { return -1 }
    }
}

// Native startup passes the actual retained child SecStaticCode/requirement and
// exact code hash derived from the current signed outer bundle, never a path.
@_cdecl("AuxValidateEmbeddedNativeDaemonLaunchPolicy")
func AuxValidateEmbeddedNativeDaemonLaunchPolicy(
    _ rawCode: UnsafeRawPointer?, _ rawRequirement: UnsafeRawPointer?,
    _ expectedHash: UnsafePointer<UInt8>?, _ hashLength: UInt
) -> Int32 {
    guard let rawCode, let rawRequirement, let expectedHash,
          hashLength == 20 || hashLength == 32 else { return -1 }
    let code = Unmanaged<SecStaticCode>.fromOpaque(rawCode).takeUnretainedValue()
    let requirement = Unmanaged<SecRequirement>.fromOpaque(rawRequirement).takeUnretainedValue()
    guard CFGetTypeID(code) == SecStaticCodeGetTypeID(),
          CFGetTypeID(requirement) == SecRequirementGetTypeID() else { return -1 }
    return AuxAuthenticatedChildParentPolicyReader.validateEmbeddedLaunch(
        code: code, requirement: requirement,
        hash: Data(bytes: expectedHash, count: Int(hashLength)))
}
