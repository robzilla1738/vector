// EXTERNAL MIGRATION TOOL ONLY. Compile-only proposed implementation.
import Foundation

@available(macOS 26.0, *)
struct PreparedPqRewrap {
    let envelope: PqDkEnvelope
    let existingAuthorityFingerprint: String
    let rootVerified: Bool
    let persistencePerformed = false
}
@available(macOS 26.0, *)
func preparePqRewrap(legacy: PqDkEnvelope, channel: LegacyInstallationChannel, authority: ExistingPqAuthority) throws -> PreparedPqRewrap {
    guard legacy.version == .legacyV1 else { throw EnvelopePortError.unsupportedFormat }
    var root = try authority.open(legacy, context:channel.context)
    defer { root.resetBytes(in:0..<root.count) }
    let next = try authority.wrapAuxV2(root:root)
    var checked = try AuxNativePqEnvelopeV2.open(next, authority:authority)
    defer { checked.resetBytes(in:0..<checked.count) }
    guard root.count == checked.count else { throw EnvelopePortError.rootMismatch }
    var difference: UInt8 = 0; for (left,right) in zip(root,checked) { difference |= left ^ right }
    guard difference == 0 else { throw EnvelopePortError.rootMismatch }
    return PreparedPqRewrap(envelope:next, existingAuthorityFingerprint:authority.publicFingerprint, rootVerified:true)
}
