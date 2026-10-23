// Native child entry only. No path, policy bytes, CDHash or approval flag input.
import Foundation
import Security
import CryptoKit
import Darwin

@_silgen_name("AuxConnectActualNativeParent")
private func connectSealedOuterParent(_ right: mach_port_t, _ requirement: UnsafeRawPointer,
                                     _ hash: UnsafePointer<UInt8>, _ size: UInt,
                                     _ timeout: UInt32) -> UInt64

enum AuxSealedOuterParentError: Error {
    case layout, signature(OSStatus), identity, endpoint, connection
}

enum AuxSealedOuterBrowserParent {
    // This is the deliberate new native-host packaging contract, not the
    // legacy flat daemon/Node fallback. Parent and child must be assembled at
    // this exact relative path; a standalone development host cannot admit it.
    static let daemonSuffix = "/Contents/Resources/aux/native-hosts/Aux Daemon.app"

    // Consumes one genuine send-right reference in this process on every normal
    // return/throw. Delivery/authentication are separate: this function derives
    // the immutable parent policy from this authenticated child's outer bundle.
    static func connect(ownedEndpoint: mach_port_t) throws -> UInt64 {
        guard ownedEndpoint != MACH_PORT_NULL else { throw AuxSealedOuterParentError.endpoint }
        var transferred = false
        defer {
            if !transferred { mach_port_deallocate(mach_task_self_, ownedEndpoint) }
        }
        let child = try AuxSignedFreshBootstrapPolicyLoader.load()
        guard child.contents.role == .daemon, child.bundlePath.hasSuffix(daemonSuffix) else {
            throw AuxSealedOuterParentError.layout
        }
        let outer = String(child.bundlePath.dropLast(daemonSuffix.count))
        guard outer.hasSuffix(".app"), let canonical = realpath(outer, nil) else {
            throw AuxSealedOuterParentError.layout
        }
        defer { free(canonical) }
        guard String(cString: canonical) == outer else { throw AuxSealedOuterParentError.layout }

        var requirement: SecRequirement?
        let requirementText = "anchor apple generic and identifier \"dev.aux.browser\" and certificate leaf[subject.OU] = \"" + AuxFreshBootstrapIdentity.team + "\""
        var status = SecRequirementCreateWithString(requirementText as CFString, [], &requirement)
        guard status == errSecSuccess, let requirement else { throw AuxSealedOuterParentError.signature(status) }
        var code: SecStaticCode?
        status = SecStaticCodeCreateWithPath(URL(fileURLWithPath: outer) as CFURL, [], &code)
        guard status == errSecSuccess, let code else { throw AuxSealedOuterParentError.signature(status) }
        let strict = SecCSFlags(rawValue: kSecCSStrictValidate | kSecCSCheckAllArchitectures |
                               kSecCSCheckNestedCode | kSecCSRestrictSymlinks | UInt32(1 << 29))
        status = SecStaticCodeCheckValidity(code, strict, requirement)
        guard status == errSecSuccess else { throw AuxSealedOuterParentError.signature(status) }
        var dictionary: CFDictionary?
        status = SecCodeCopySigningInformation(code, SecCSFlags(rawValue: kSecCSSigningInformation), &dictionary)
        guard status == errSecSuccess, let info = dictionary as? [String: Any] else {
            throw AuxSealedOuterParentError.signature(status)
        }
        guard info[kSecCodeInfoIdentifier as String] as? String == "dev.aux.browser",
              info[kSecCodeInfoTeamIdentifier as String] as? String == AuxFreshBootstrapIdentity.team,
              let certificates = info[kSecCodeInfoCertificates as String] as? [SecCertificate],
              let leaf = certificates.first,
              freshBootstrapDigest(SecCertificateCopyData(leaf) as Data) == AuxFreshBootstrapIdentity.leafCertificateSha256,
              let flags = info[kSecCodeInfoFlags as String] as? NSNumber,
              flags.uint32Value & 0x2 == 0,
              let hash = info[kSecCodeInfoUnique as String] as? Data,
              hash.count == 20 || hash.count == 32,
              let plist = info[kSecCodeInfoPList as String] as? [String: Any],
              plist["CFBundlePackageType"] as? String == "APPL",
              plist["CFBundleIdentifier"] as? String == "dev.aux.browser",
              let executable = plist["CFBundleExecutable"] as? String,
              !executable.isEmpty, !executable.contains("/"), executable != ".", executable != "..",
              let main = info[kSecCodeInfoMainExecutable as String] as? URL,
              main.path == outer + "/Contents/MacOS/" + executable else {
            throw AuxSealedOuterParentError.identity
        }
        // Read-back only: no self-referential parent/child CDHash is baked into
        // a sealed resource. The live Mach audit handshake must independently
        // match this exact validated outer image, its birth and PID version.
        try child.revalidateCurrentIdentity()
        let handle = hash.withUnsafeBytes { bytes -> UInt64 in
            transferred = true
            return connectSealedOuterParent(ownedEndpoint, Unmanaged.passUnretained(requirement).toOpaque(),
                                           bytes.bindMemory(to: UInt8.self).baseAddress!, UInt(hash.count), 2_000)
        }
        guard handle != 0 else { throw AuxSealedOuterParentError.connection }
        do {
            try child.revalidateCurrentIdentity()
            return handle
        } catch {
            releaseSealedOuterParent(handle)
            throw error
        }
    }
}

@_silgen_name("AuxReleaseNativeParentConnection")
private func releaseSealedOuterParent(_ handle: UInt64)
