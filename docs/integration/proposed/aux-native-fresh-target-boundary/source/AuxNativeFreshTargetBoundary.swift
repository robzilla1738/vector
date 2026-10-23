// Inactive native-v2 boundary. Only the genuine staged context enters production.
import Foundation
import Security

enum AuxNativeFreshTargetError: Error { case binding, missing, unavailable, invalid, changed, unsupported }
enum AuxNativeFreshTargetRead { case absent, bytes(Data), unavailable(OSStatus), invalid }
enum AuxNativeFreshTargetAddStatus { case added, duplicate, failed(OSStatus) }

#if AUX_NATIVE_FRESH_TARGET_BOUNDARY_FIXTURE
enum AuxNativeFreshTargetFixture {
    static var read: ((NativeFreshTargetSelector) throws -> AuxNativeFreshTargetRead)!
    static var add: ((NativeFreshTargetSelector, Data) throws -> OSStatus)!
}
#endif

private struct DecodedNativeFreshStage {
    let payloads: [String: Data]
    let publicDescriptor: [String: String]

    init(context: NativeFreshStagedContext, captured: Data) throws {
        try context.revalidateNativeStageBinding()
        let journal = context.journal
        try journal.validate()
        guard !captured.isEmpty, captured.count <= 16_384,
              nativeBootstrapHash(captured) == journal.stagePayloadSha256 else {
            throw AuxNativeFreshTargetError.changed
        }
        let object = try strictEnvelopeObject(captured)
        guard Set(object.keys) == [
            "format", "reservationTransactionId", "reservationSha256", "policySha256", "scope",
            "candidateSha256", "bindings", "publicDescriptor", "targetHashes", "payloads",
        ], object["format"] as? String == "aux.install.native-fresh.secure-stage.v2",
              object["reservationTransactionId"] as? String == journal.reservationTransactionId,
              object["reservationSha256"] as? String == journal.reservationSha256,
              object["policySha256"] as? String == journal.policySha256,
              object["scope"] as? String == journal.scope,
              object["candidateSha256"] as? String == journal.candidateSha256,
              object["publicDescriptor"] as? [String: String] == journal.publicDescriptor,
              object["targetHashes"] as? [String: String] == journal.targetHashes,
              let bindings = object["bindings"] as? [[String: Any]], bindings.count == 4,
              let encoded = object["payloads"] as? [String: String],
              Set(encoded.keys) == Set(nativeFreshBootstrapRoles) else {
            throw AuxNativeFreshTargetError.binding
        }
        for binding in bindings {
            guard Set(binding.keys) == ["row", "target"],
                  let target = binding["target"] as? [String: Any],
                  Set(target.keys) == ["service", "account", "accessGroup"] else {
                throw AuxNativeFreshTargetError.invalid
            }
        }
        let actualBindings = try JSONDecoder().decode(
            [NativeFreshTargetBinding].self,
            from: JSONSerialization.data(withJSONObject: bindings)
        )
        guard actualBindings == journal.targetBindings else { throw AuxNativeFreshTargetError.binding }
        var payloads: [String: Data] = [:]
        for row in nativeFreshBootstrapRoles {
            guard let text = encoded[row], let bytes = Data(base64Encoded: text),
                  !bytes.isEmpty, bytes.count <= 16_384, bytes.base64EncodedString() == text,
                  nativeBootstrapHash(bytes) == journal.targetHashes[row] else {
                throw AuxNativeFreshTargetError.changed
            }
            payloads[row] = bytes
        }
        self.payloads = payloads
        publicDescriptor = journal.publicDescriptor
        _ = try makeCommandCore(payloads: payloads)
        try context.revalidateNativeStageBinding()
    }

    // Real authority imports enforce public/private continuity and strict Aux-v2
    // root wrapping. Hardware lanes are source/typecheck only in this proposal.
    func makeCommandCore(payloads: [String: Data]) throws -> AuxInstallationCommandCore {
        guard Set(payloads.keys) == Set(nativeFreshBootstrapRoles),
              let metadataBytes = payloads["metadata"],
              Set(try strictEnvelopeObject(metadataBytes).keys) == ["scheme", "key_storage"],
              Set(publicDescriptor.keys) == ["scheme", "sig_pub", "kem_pub"],
              let sigText = publicDescriptor["sig_pub"], let sig = Data(base64Encoded: sigText),
              sig.base64EncodedString() == sigText,
              let kemText = publicDescriptor["kem_pub"], let kem = Data(base64Encoded: kemText),
              kem.base64EncodedString() == kemText,
              let signing = payloads["signing"], let keyAgreement = payloads["kem"],
              let wrapped = payloads["wrappedRoot"] else { throw AuxNativeFreshTargetError.invalid }
        let metadata = try InstallationAuthorityMetadata(json: metadataBytes)
        guard metadata.scheme.rawValue == publicDescriptor["scheme"] else {
            throw AuxNativeFreshTargetError.changed
        }
        let challenge = Data("aux.install.native-fresh.secure-stage.continuity.v2".utf8)
        let authority: AuxCapturedCommandAuthority
        switch metadata.scheme {
        case .p256:
            guard sig.count == 65, kem.count == 65, sig.first == 4, kem.first == 4 else {
                throw AuxNativeFreshTargetError.invalid
            }
            let signer = try ExistingP256SigningAuthority(
                metadata: metadata, privateRepresentation: signing, expectedPublicKey: sig
            )
            guard try signer.verifies(signature: signer.signature(for: challenge), challenge: challenge) else {
                throw AuxNativeFreshTargetError.changed
            }
            authority = try .p256(
                metadata: metadata, signingPrivate: signing, signingPublic: sig,
                kemPrivate: keyAgreement, kemPublic: kem, wrappedRoot: wrapped
            )
        case .pq:
            guard #available(macOS 26.0, *) else { throw AuxNativeFreshTargetError.unsupported }
            guard sig.count == 1952, kem.count == 1184 else { throw AuxNativeFreshTargetError.invalid }
            let signer = try ExistingPqSigningAuthority(
                metadata: metadata, privateRepresentation: signing, expectedPublicKey: sig
            )
            guard try signer.verifies(signature: signer.signature(for: challenge), challenge: challenge) else {
                throw AuxNativeFreshTargetError.changed
            }
            authority = try .pq(
                metadata: metadata, signingPrivate: signing, signingPublic: sig,
                kemPrivate: keyAgreement, kemPublic: kem, wrappedRoot: wrapped
            )
        }
        let core = AuxInstallationCommandCore(context: .installed(authority))
        let rootReply = try strictEnvelopeObject(Data(core.run(command: "dk-unwrap").utf8))
        guard Set(rootReply.keys) == ["dk"], let text = rootReply["dk"] as? String,
              let root = Data(base64Encoded: text), root.count == 32,
              root.base64EncodedString() == text else { throw AuxNativeFreshTargetError.changed }
        return core
    }
}

final class AuxNativeFreshTargetBoundary {
    private let context: NativeFreshStagedContext
    private let decoded: DecodedNativeFreshStage

    init(context: NativeFreshStagedContext) throws {
        try context.revalidateNativeStageBinding()
        let captured = try Self.requireBytes(Self.read(context.journal.stageSelector))
        decoded = try DecodedNativeFreshStage(context: context, captured: captured)
        self.context = context
    }

    private func revalidateStage() throws {
        try context.revalidateNativeStageBinding()
        let bytes = try Self.requireBytes(Self.read(context.journal.stageSelector))
        guard nativeBootstrapHash(bytes) == context.journal.stagePayloadSha256 else {
            throw AuxNativeFreshTargetError.changed
        }
        try context.revalidateNativeStageBinding()
    }

    func captureTargets() throws -> [String: AuxNativeFreshTargetRead] {
        try revalidateStage()
        var values: [String: AuxNativeFreshTargetRead] = [:]
        for binding in context.journal.targetBindings { values[binding.row] = try Self.read(binding.target) }
        try revalidateStage()
        return values
    }

    func addTarget(_ intent: AuxNativeFreshTargetWriteIntent) throws -> AuxNativeFreshTargetAddStatus {
        try revalidateStage()
        guard intent.initialJournalSha256 == context.durableJournalSha256,
              intent.reservationTransactionId == context.journal.reservationTransactionId,
              let binding = context.journal.targetBindings.first(where: { $0.row == intent.row }),
              let payload = decoded.payloads[intent.row],
              nativeBootstrapHash(payload) == context.journal.targetHashes[intent.row] else {
            throw AuxNativeFreshTargetError.binding
        }
        // The private-init ticket checks its actual CURRENT durable intent and
        // consumes before dispatch. Restored intents cannot mint this ticket.
        try intent.consumeOnceForNativeBoundary()
        try revalidateStage()
        guard case .absent = try Self.read(binding.target) else { throw AuxNativeFreshTargetError.changed }
        let status: OSStatus
#if AUX_NATIVE_FRESH_TARGET_BOUNDARY_FIXTURE
        status = try AuxNativeFreshTargetFixture.add(binding.target, payload)
#else
        status = SecItemAdd(Self.addQuery(binding.target, payload: payload) as CFDictionary, nil)
#endif
        // A post-Add failure is an unknown outcome, never permission to replay.
        try context.revalidateNativeStageBinding()
        if status == errSecSuccess { return .added }
        if status == errSecDuplicateItem { return .duplicate }
        return .failed(status)
    }

    func validateStageAndMakeCommandCore() throws -> AuxInstallationCommandCore {
        let captures = try captureTargets()
        var payloads: [String: Data] = [:]
        for row in nativeFreshBootstrapRoles {
            guard let observed = captures[row] else { throw AuxNativeFreshTargetError.invalid }
            let bytes = try Self.requireBytes(observed)
            guard nativeBootstrapHash(bytes) == context.journal.targetHashes[row],
                  bytes == decoded.payloads[row] else { throw AuxNativeFreshTargetError.changed }
            payloads[row] = bytes
        }
        let core = try decoded.makeCommandCore(payloads: payloads)
        try revalidateStage()
        return core
    }

    static func readQuery(_ selector: NativeFreshTargetSelector) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: selector.service, kSecAttrAccount as String: selector.account,
         kSecAttrAccessGroup as String: selector.accessGroup, kSecUseDataProtectionKeychain as String: true,
         kSecUseAuthenticationUI as String: kSecUseAuthenticationUIFail,
         kSecReturnData as String: true, kSecMatchLimit as String: kSecMatchLimitOne]
    }
    static func addQuery(_ selector: NativeFreshTargetSelector, payload: Data) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: selector.service, kSecAttrAccount as String: selector.account,
         kSecAttrAccessGroup as String: selector.accessGroup, kSecUseDataProtectionKeychain as String: true,
         kSecUseAuthenticationUI as String: kSecUseAuthenticationUIFail,
         kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
         kSecValueData as String: payload]
    }
    private static func read(_ selector: NativeFreshTargetSelector) throws -> AuxNativeFreshTargetRead {
#if AUX_NATIVE_FRESH_TARGET_BOUNDARY_FIXTURE
        return try AuxNativeFreshTargetFixture.read(selector)
#else
        var result: CFTypeRef?
        let status = SecItemCopyMatching(readQuery(selector) as CFDictionary, &result)
        if status == errSecItemNotFound { return result == nil ? .absent : .invalid }
        guard status == errSecSuccess else { return .unavailable(status) }
        guard let result, CFGetTypeID(result) == CFDataGetTypeID() else { return .invalid }
        let data = result as! CFData, count = CFDataGetLength(data)
        guard count > 0, count <= 16_384, let bytes = CFDataGetBytePtr(data) else { return .invalid }
        return .bytes(Data(bytes: bytes, count: count))
#endif
    }
    private static func requireBytes(_ value: AuxNativeFreshTargetRead) throws -> Data {
        switch value {
        case .bytes(let bytes):
            guard !bytes.isEmpty, bytes.count <= 16_384 else { throw AuxNativeFreshTargetError.invalid }
            return bytes
        case .absent: throw AuxNativeFreshTargetError.missing
        case .unavailable: throw AuxNativeFreshTargetError.unavailable
        case .invalid: throw AuxNativeFreshTargetError.invalid
        }
    }
}
