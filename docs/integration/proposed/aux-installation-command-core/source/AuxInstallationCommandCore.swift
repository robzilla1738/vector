// Inactive source-level command core. No I/O, key generation, mutable registry,
// legacy wrapping context, activation switch or process-global command input.
import Foundation

private enum AuxCommandError: String, Error {
    case invalidInput = "Invalid native command input"
    case unconfigured = "Installation context is not configured"
    case unavailable = "Installation authority is unavailable"
    case absent = "Installation is not initialized"
    case freshCoordinator = "Fresh installation coordinator is unavailable"
    case destroyCoordinator = "Installation destruction coordinator is unavailable"
    case operation = "Installation authority operation failed"
}

// Every constructor imports the supplied existing representations and verifies
// public equality. Possession of this value is not proof of storage provenance.
struct AuxCapturedCommandAuthority {
    let scheme: String
    let signingPublicKey: Data
    let kemPublicKey: Data
    fileprivate let sign: (Data) throws -> Data
    fileprivate let openRoot: () throws -> Data
    private init(scheme: String, sig: Data, kem: Data,
                 sign: @escaping (Data) throws -> Data, open: @escaping () throws -> Data) {
        self.scheme = scheme; signingPublicKey = sig; kemPublicKey = kem
        self.sign = sign; openRoot = open
    }
    static func p256(metadata: InstallationAuthorityMetadata,
                     signingPrivate: Data, signingPublic: Data,
                     kemPrivate: Data, kemPublic: Data, wrappedRoot: Data) throws -> Self {
        let signer = try ExistingP256SigningAuthority(metadata: metadata,
            privateRepresentation: signingPrivate, expectedPublicKey: signingPublic)
        let kem = try ExistingP256Authority(metadata: metadata,
            privateRepresentation: kemPrivate, expectedPublicKey: kemPublic)
        let envelope = try AuxCommandV2Envelope.p256(wrappedRoot)
        _ = try AuxNativeEnvelopeV2.open(envelope, authority: kem)
        return Self(scheme: "p256_v1", sig: signer.publicKey, kem: kem.publicKey,
                    sign: { try signer.signature(for: $0) },
                    open: { try AuxNativeEnvelopeV2.open(envelope, authority: kem) })
    }
    @available(macOS 26.0, *)
    static func pq(metadata: InstallationAuthorityMetadata,
                   signingPrivate: Data, signingPublic: Data,
                   kemPrivate: Data, kemPublic: Data, wrappedRoot: Data) throws -> Self {
        let signer = try ExistingPqSigningAuthority(metadata: metadata,
            privateRepresentation: signingPrivate, expectedPublicKey: signingPublic)
        let kem = try ExistingPqAuthority(metadata: metadata,
            privateRepresentation: kemPrivate, expectedPublicKey: kemPublic)
        let envelope = try AuxCommandV2Envelope.pq(wrappedRoot)
        _ = try AuxNativePqEnvelopeV2.open(envelope, authority: kem)
        return Self(scheme: "pq_v1", sig: signer.publicKey, kem: kem.publicKey,
                    sign: { try signer.signature(for: $0) },
                    open: { try AuxNativePqEnvelopeV2.open(envelope, authority: kem) })
    }
}

// This entry point never invokes either generic legacy-capable JSON reader.
// Exact explicit-format parsing precedes construction of typed Aux-v2 records.
private enum AuxCommandV2Envelope {
    static func object(_ data: Data, scheme: String, member: String) throws -> [String: Any] {
        let object = try strictEnvelopeObject(data)
        guard Set(object.keys) == ["format", "scheme", "purpose", member, "nonce", "ciphertext"],
              object["format"] as? String == "aux.wrap.dk.v2",
              object["scheme"] as? String == scheme,
              object["purpose"] as? String == "dk" else { throw EnvelopePortError.unsupportedFormat }
        return object
    }
    static func bytes(_ object: [String: Any], _ name: String) throws -> Data {
        guard let text = object[name] as? String, let bytes = Data(base64Encoded: text),
              bytes.base64EncodedString() == text else { throw EnvelopePortError.malformedRecord }
        return bytes
    }
    static func p256(_ data: Data) throws -> P256DkEnvelope {
        let o = try object(data, scheme: "p256_v2", member: "ephemeral_public_key")
        return try P256DkEnvelope(version: .auxV2, ephemeralPublicKey: bytes(o, "ephemeral_public_key"),
                                 nonce: bytes(o, "nonce"), ciphertextAndTag: bytes(o, "ciphertext"))
    }
    static func pq(_ data: Data) throws -> PqDkEnvelope {
        let o = try object(data, scheme: "pq_v2", member: "encapsulated_key")
        return try PqDkEnvelope(version: .auxV2, encapsulatedKey: bytes(o, "encapsulated_key"),
                               nonce: bytes(o, "nonce"), ciphertextAndTag: bytes(o, "ciphertext"))
    }
}

struct AuxInstallationCommandCore {
    // Explicit absent is a coordinator assertion, not an inference from failed
    // Keychain reads. This core cannot resolve storage state or admit writers.
    enum Context { case unconfigured, absent, unavailable, installed(AuxCapturedCommandAuthority) }
    let context: Context
    init(context: Context = .unconfigured) { self.context = context }
    private func authority() throws -> AuxCapturedCommandAuthority {
        switch context {
        case .installed(let authority): return authority
        case .unconfigured: throw AuxCommandError.unconfigured
        case .unavailable: throw AuxCommandError.unavailable
        case .absent: throw AuxCommandError.absent
        }
    }
    private func input(_ text: String, challenge: Bool = false) throws -> Data? {
        guard text.utf8.count <= 16_384 else { throw AuxCommandError.invalidInput }
        let o: [String: Any]
        do { o = text.isEmpty ? [:] : try strictEnvelopeObject(Data(text.utf8)) }
        catch { throw AuxCommandError.invalidInput }
        if !challenge { guard o.isEmpty else { throw AuxCommandError.invalidInput }; return nil }
        guard Set(o.keys) == ["challenge"], let text = o["challenge"] as? String,
              let bytes = Data(base64Encoded: text), bytes.base64EncodedString() == text,
              !bytes.isEmpty else { throw AuxCommandError.invalidInput }
        return bytes
    }
#if AUX_ATOMIC_CSK_DISPATCH
    // Native-only operation; caller holds the actual owned dispatcher lease.
    // This returns no key through JSON and erases its temporary unwrapped copy.
    func withCskPublicationRoot<T>(_ body:(Data)throws->T)throws->T {
        var root=try authority().openRoot();defer{root.resetBytes(in:0..<root.count)}
        guard root.count==32 else{throw AuxCommandError.operation};return try body(root)
    }
#endif
    func run(command: String, input text: String = "") -> String {
        func json(_ object: [String: Any]) -> String {
            guard let data = try? JSONSerialization.data(withJSONObject: object, options: [.sortedKeys]),
                  let result = String(data: data, encoding: .utf8) else {
                return "{\"error\":\"JSON serialization failed\"}"
            }
            return result
        }
        do {
            let reply: [String: Any]
            switch command {
            case "install-status", "keys-status":
                _ = try input(text)
                switch context {
                case .absent: reply = ["installed": false]
                default: let a = try authority(); reply = ["installed": true, "scheme": a.scheme]
                }
            case "get-public-keys", "public-keys", "install-init", "init-keys":
                _ = try input(text)
                if case .absent = context, command == "install-init" || command == "init-keys" {
                    throw AuxCommandError.freshCoordinator
                }
                let a = try authority()
                let initialization = command == "install-init" || command == "init-keys"
                reply = ["scheme": a.scheme,
                         initialization ? "sig_pub" : "sig": a.signingPublicKey.base64EncodedString(),
                         initialization ? "kem_pub" : "kem": a.kemPublicKey.base64EncodedString()]
            case "cdp-sign":
                let challenge = try input(text, challenge: true)!
                reply = ["signature": try authority().sign(challenge).base64EncodedString()]
            case "dk-unwrap":
                _ = try input(text); let root = try authority().openRoot()
                guard root.count == 32 else { throw AuxCommandError.operation }
                reply = ["dk": root.base64EncodedString()]
            case "install-destroy", "destroy-keys":
                _ = try input(text); throw AuxCommandError.destroyCoordinator
            default:
                // Bound untrusted command echo; no private data/error interpolation.
                guard command.utf8.count <= 128, !command.contains("\0") else { throw AuxCommandError.invalidInput }
                return json(["error": "Unknown command: \(command)"])
            }
            return json(reply)
        } catch let error as AuxCommandError { return json(["error": error.rawValue]) }
        catch { return json(["error": AuxCommandError.operation.rawValue]) }
    }
}
