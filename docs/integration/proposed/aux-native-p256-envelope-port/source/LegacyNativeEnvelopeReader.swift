// EXTERNAL MIGRATION TOOL ONLY: not a delivered Aux runtime dependency.
import Foundation

enum LegacyInstallationChannel { case normal, canary
    var context: Data { Data((self == .normal ? "aside.wrap.dk.v1" : "aside-canary.wrap.dk.v1").utf8) }
}
struct PreparedP256Rewrap {
    let envelope: P256DkEnvelope
    let existingAuthorityFingerprint: String
    let rootVerified: Bool
    let persistencePerformed = false
}
func prepareP256Rewrap(legacy: P256DkEnvelope, channel: LegacyInstallationChannel, authority: ExistingP256Authority) throws -> PreparedP256Rewrap {
    guard legacy.version == .legacyV1 else { throw EnvelopePortError.unsupportedFormat }
    var root = try openP256Envelope(legacy, authority: authority, context: channel.context)
    defer { root.resetBytes(in: 0..<root.count) }
    let next = try AuxNativeEnvelopeV2.wrap(root: root, existingPublicKey: authority.publicKey)
    var checked = try AuxNativeEnvelopeV2.open(next, authority: authority)
    defer { checked.resetBytes(in: 0..<checked.count) }
    guard root.count == checked.count else { throw EnvelopePortError.rootMismatch }
    var difference: UInt8 = 0; for (left,right) in zip(root,checked) { difference |= left ^ right }
    guard difference == 0 else { throw EnvelopePortError.rootMismatch }
    return PreparedP256Rewrap(envelope: next, existingAuthorityFingerprint: authority.publicFingerprint, rootVerified: true)
}
