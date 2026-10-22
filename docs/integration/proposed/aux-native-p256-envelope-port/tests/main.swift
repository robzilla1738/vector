// Synthetic software-only harness. Never invokes the enclave import branch.
import Foundation

var checksPassed = 0
func check(_ condition: @autoclosure () throws -> Bool) throws { if try !condition() { throw EnvelopePortError.rootMismatch }; checksPassed += 1 }
func fails(_ operation: () throws -> Void) throws { do { try operation() } catch { checksPassed += 1; return }; throw EnvelopePortError.rootMismatch }
let fixtureData = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
let fixture = try JSONSerialization.jsonObject(with: fixtureData) as! [String:Any]
func fixtureBytes(_ key: String) -> Data { Data(base64Encoded: fixture[key] as! String)! }
func fixtureRecord(_ key: String) throws -> P256DkEnvelope { try P256DkEnvelope(json: JSONSerialization.data(withJSONObject: fixture[key]!)) }
let metadata = try InstallationAuthorityMetadata(json: Data("{\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8))
let defaultMetadata = try InstallationAuthorityMetadata(json: Data("{\"scheme\":\"p256_v1\"}".utf8))
try check(defaultMetadata.storage == .secureEnclave)
let authority = try ExistingP256Authority(metadata: metadata, privateRepresentation: fixtureBytes("syntheticPrivateRepresentation"), expectedPublicKey: fixtureBytes("publicKey"))
let normal = try fixtureRecord("legacyNormal"), canary = try fixtureRecord("legacyCanary"), v2 = try fixtureRecord("auxV2")
let normalRoot = try openP256Envelope(normal, authority: authority, context: LegacyInstallationChannel.normal.context)
try check(normalRoot == fixtureBytes("syntheticRoot"))
try check(try openP256Envelope(canary, authority: authority, context: LegacyInstallationChannel.canary.context) == normalRoot)
try check(try AuxNativeEnvelopeV2.open(v2, authority: authority) == normalRoot)
let prepared = try prepareP256Rewrap(legacy: normal, channel: .normal, authority: authority)
try check(prepared.rootVerified && !prepared.persistencePerformed && prepared.existingAuthorityFingerprint == authority.publicFingerprint)
try fails { _ = try AuxNativeEnvelopeV2.open(normal, authority: authority) }
try fails { _ = try prepareP256Rewrap(legacy: normal, channel: .canary, authority: authority) }
var corrupted = v2.ciphertextAndTag; corrupted[0] ^= 1
try fails { _ = try AuxNativeEnvelopeV2.open(P256DkEnvelope(version: .auxV2, ephemeralPublicKey: v2.ephemeralPublicKey, nonce: v2.nonce, ciphertextAndTag: corrupted), authority: authority) }
try fails { _ = try InstallationAuthorityMetadata(json: Data("{\"scheme\":\"p256_v1\",\"\\u0073cheme\":\"pq_v1\"}".utf8)) }
try fails { _ = try P256DkEnvelope(json: Data("{\"format\":\"unknown\"}".utf8)) }
try fails { _ = try ExistingP256Authority(metadata: metadata, privateRepresentation: fixtureBytes("syntheticPrivateRepresentation"), expectedPublicKey: Data(repeating:0,count:65)) }
let pqMetadata = try InstallationAuthorityMetadata(json: Data("{\"scheme\":\"pq_v1\"}".utf8))
do { _ = try ExistingP256Authority(metadata: pqMetadata, privateRepresentation: Data([1]), expectedPublicKey: Data()); throw EnvelopePortError.rootMismatch } catch EnvelopePortError.pqNotRecovered { checksPassed += 1 }
let output: [String:Any] = ["syntheticSoftwareChecksPassed":checksPassed,"enclaveExecuted":false,"pqExecuted":false,"persistencePerformed":false,"prepared":try JSONSerialization.jsonObject(with: prepared.envelope.auxJson())]
print(String(data:try JSONSerialization.data(withJSONObject:output,options:[.sortedKeys]),encoding:.utf8)!)
