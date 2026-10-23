import Foundation
import CryptoKit
import Security
import Darwin

setbuf(stdout, nil)
setbuf(stderr, nil)

var checks = 0
func check(_ value: @autoclosure () -> Bool) { precondition(value()); checks += 1 }
func refuses(_ action: () throws -> Void) {
    do { try action(); preconditionFailure("Expected refusal") }
    catch { checks += 1 }
}
// Fixed synthetic imports, no installation factory/key generation/hardware.
print("PHASE: fixed software imports")
let signingBytes = Data(repeating: 1, count: 32)
let agreementBytes = Data(repeating: 2, count: 32)
let signing = try P256.Signing.PrivateKey(rawRepresentation: signingBytes)
let agreement = try P256.KeyAgreement.PrivateKey(rawRepresentation: agreementBytes)
let ephemeral = try P256.KeyAgreement.PrivateKey(rawRepresentation: Data(repeating: 3, count: 32))
let root = Data(repeating: 0x42, count: 32)
let shared = try ephemeral.sharedSecretFromKeyAgreement(with: agreement.publicKey)
let key = shared.hkdfDerivedSymmetricKey(
    using: SHA256.self, salt: Data(), sharedInfo: AuxNativeEnvelopeV2.context, outputByteCount: 32
)
let nonce = try ChaChaPoly.Nonce(data: Data(repeating: 4, count: 12))
let sealed = try ChaChaPoly.seal(root, using: key, nonce: nonce, authenticating: AuxNativeEnvelopeV2.context)
let envelope = try P256DkEnvelope(
    version: .auxV2, ephemeralPublicKey: ephemeral.publicKey.x963Representation,
    nonce: Data(repeating: 4, count: 12), ciphertextAndTag: sealed.ciphertext + sealed.tag
)
let metadata = Data("{\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8)
let fixedPayloads = ["metadata": metadata, "signing": signingBytes, "kem": agreementBytes,
                "wrappedRoot": try envelope.auxJson()]
let publicDescriptor = ["scheme": "p256_v1", "sig_pub": signing.publicKey.x963Representation.base64EncodedString(),
                        "kem_pub": agreement.publicKey.x963Representation.base64EncodedString()]
let transaction = "00000000-0000-4000-8000-000000000001"
let scope = String(repeating: "a", count: 64)
let policyHash = String(repeating: "b", count: 64)
let reservationHash = String(repeating: "c", count: 64)
let group = "9F2JXY8TCK.dev.aux.synthetic-native-v2"
let service = "aux." + scope + ".installation.v2"
let bindings = zip(nativeFreshBootstrapRoles, ["meta", "sig", "kem", "dk"]).map {
    NativeFreshTargetBinding(row: $0.0, target: .init(service: service, account: service + "." + $0.1, accessGroup: group))
}
let stageSelector = NativeFreshTargetSelector(
    service: "aux." + scope + ".install.secure-stage.v1",
    account: "aux." + scope + ".fresh." + transaction.lowercased(), accessGroup: group
)
func fixture(
    payloads: [String: Data] = fixedPayloads,
    edit: (inout [String: Any]) -> Void = { _ in },
    rawEdit: (Data) -> Data = { $0 }
) throws -> (NativeFreshStagedContext, Data) {
    let hashes = payloads.mapValues(nativeBootstrapHash)
    let candidate = nativeBootstrapHash(try JSONSerialization.data(withJSONObject: [
        "format": "aux.install.fresh.cohort.v1", "targets": hashes, "public": publicDescriptor,
    ], options: [.sortedKeys, .withoutEscapingSlashes]))
    var object: [String: Any] = [
        "format": "aux.install.native-fresh.secure-stage.v2", "reservationTransactionId": transaction,
        "reservationSha256": reservationHash, "policySha256": policyHash, "scope": scope,
        "candidateSha256": candidate, "bindings": try JSONSerialization.jsonObject(with: JSONEncoder().encode(bindings)),
        "publicDescriptor": publicDescriptor, "targetHashes": hashes,
        "payloads": payloads.mapValues { $0.base64EncodedString() },
    ]
    edit(&object)
    let stage = rawEdit(try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys, .withoutEscapingSlashes]))
    let journal = NativeFreshBootstrapJournal(
        format: "aux.install.native-fresh.initial-journal.v2", reservationTransactionId: transaction,
        reservationSha256: reservationHash, policySha256: policyHash, scope: scope, role: "cli",
        accessGroup: group, targetBindings: bindings, stageSelector: stageSelector,
        initialObservedAbsentRoles: ["metadata", "signing", "kem", "wrappedRoot", "secureStage"],
        candidateSha256: candidate, publicDescriptor: publicDescriptor, targetHashes: hashes,
        stagePayloadSha256: nativeBootstrapHash(stage)
    )
    return (.init(journal: journal, durableJournalSha256: nativeBootstrapHash(try journal.encoded())), stage)
}
var stage: Data?
var targets: [String: Data] = [:]
var adds = 0
func configure(_ context: NativeFreshStagedContext, _ captured: Data) {
    stage = captured
    targets = [:]
    CapturedNativeContext.revalidate = {
        guard try nativeBootstrapHash(context.journal.encoded()) == context.durableJournalSha256 else {
            throw CapturedNativeError.stale
        }
    }
    AuxNativeFreshTargetFixture.read = { selector in
        if selector == stageSelector { return stage.map { .bytes($0) } ?? .absent }
        guard let row = bindings.first(where: { $0.target == selector })?.row else { return .invalid }
        return targets[row].map { .bytes($0) } ?? .absent
    }
    AuxNativeFreshTargetFixture.add = { selector, payload in
        adds += 1
        guard let row = bindings.first(where: { $0.target == selector })?.row else { return errSecParam }
        guard targets[row] == nil else { return errSecDuplicateItem }
        targets[row] = payload
        return errSecSuccess
    }
}
print("PHASE: initial decoder")
let (context, bytes) = try fixture()
configure(context, bytes)
let boundary = try AuxNativeFreshTargetBoundary(context: context)
refuses { _ = try boundary.validateStageAndMakeCommandCore() }
print("PHASE: four targets")
for row in nativeFreshBootstrapRoles {
    let ticket = AuxNativeFreshTargetWriteIntent(row: row, context: context)
    if case .added = try boundary.addTarget(ticket) { checks += 1 } else { preconditionFailure() }
    let before = adds
    refuses { _ = try boundary.addTarget(ticket) }
    check(adds == before)
}
print("PHASE: terminal core")
let core = try boundary.validateStageAndMakeCommandCore()
let reply = try strictEnvelopeObject(Data(core.run(command: "dk-unwrap").utf8))
check(reply["dk"] as? String == root.base64EncodedString())
check(adds == 4)
let query = AuxNativeFreshTargetBoundary.addQuery(bindings[0].target, payload: fixedPayloads["metadata"]!)
check(query[kSecUseDataProtectionKeychain as String] as? Bool == true)
check(query[kSecAttrAccessGroup as String] as? String == group)
check(query[kSecAttrAccessible as String] as? String == kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly as String)
targets["signing"] = Data([9])
refuses { _ = try boundary.validateStageAndMakeCommandCore() }
stage = nil
refuses { _ = try boundary.captureTargets() }

print("PHASE: malformed fixtures")
let invalidEdits: [(inout [String: Any]) -> Void] = [
    { $0["format"] = "aux.install.fresh.secure-stage.v1" },
    { $0["unexpected"] = true },
    { object in var map = object["payloads"] as! [String: String]; map["metadata"]! += "="; object["payloads"] = map },
]
for edit in invalidEdits {
    let (invalidContext, invalidStage) = try fixture(edit: edit)
    configure(invalidContext, invalidStage)
    refuses { _ = try AuxNativeFreshTargetBoundary(context: invalidContext) }
}
var invalidMetadata = fixedPayloads
invalidMetadata["metadata"] = Data("{\"scheme\":\"p256_v1\",\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8)
let (duplicateContext, duplicateStage) = try fixture(payloads: invalidMetadata)
configure(duplicateContext, duplicateStage)
refuses { _ = try AuxNativeFreshTargetBoundary(context: duplicateContext) }
var wrongKey = fixedPayloads
wrongKey["signing"] = Data(repeating: 5, count: 32)
let (wrongContext, wrongStage) = try fixture(payloads: wrongKey)
configure(wrongContext, wrongStage)
refuses { _ = try AuxNativeFreshTargetBoundary(context: wrongContext) }
var wrongCipher = fixedPayloads
var ciphertext = sealed.ciphertext + sealed.tag
ciphertext[0] ^= 1
wrongCipher["wrappedRoot"] = try P256DkEnvelope(
    version: .auxV2, ephemeralPublicKey: ephemeral.publicKey.x963Representation,
    nonce: Data(repeating: 4, count: 12), ciphertextAndTag: ciphertext
).auxJson()
let (cipherContext, cipherStage) = try fixture(payloads: wrongCipher)
configure(cipherContext, cipherStage)
refuses { _ = try AuxNativeFreshTargetBoundary(context: cipherContext) }

print("PHASE: uncertain add")
configure(context, bytes)
let uncertain = try AuxNativeFreshTargetBoundary(context: context)
AuxNativeFreshTargetFixture.add = { selector, payload in
    adds += 1
    targets["metadata"] = payload
    CapturedNativeContext.revalidate = { throw CapturedNativeError.stale }
    return errSecSuccess
}
let unknown = AuxNativeFreshTargetWriteIntent(row: "metadata", context: context)
refuses { _ = try uncertain.addTarget(unknown) }
CapturedNativeContext.revalidate = {}
let beforeRetry = adds
refuses { _ = try uncertain.addTarget(unknown) }
check(adds == beforeRetry && targets["metadata"] == fixedPayloads["metadata"])
print("PHASE: stale intent")
configure(context, bytes)
let stale = try AuxNativeFreshTargetBoundary(context: context)
let staleIntent = AuxNativeFreshTargetWriteIntent(row: "metadata", context: context)
staleIntent.isCurrent = false
let beforeStale = adds
refuses { _ = try stale.addTarget(staleIntent) }
check(adds == beforeStale)
// A target-absence callback may invalidate the retained context. It must not
// dispatch Add even though the captured return value itself says absent.
print("PHASE: changed absence")
configure(context, bytes)
let changedAfterAbsence = try AuxNativeFreshTargetBoundary(context: context)
AuxNativeFreshTargetFixture.read = { selector in
    if selector == stageSelector { return .bytes(bytes) }
    CapturedNativeContext.revalidate = { throw CapturedNativeError.stale }
    return .absent
}
let changedIntent = AuxNativeFreshTargetWriteIntent(row: "metadata", context: context)
let beforeChangedAbsence = adds
refuses { _ = try changedAfterAbsence.addTarget(changedIntent) }
check(adds == beforeChangedAbsence)
print("PASS:\(checks) native-v2 decoder/fixed software authority/captured target checks; no factory, hardware, Security or disk secret writes")
