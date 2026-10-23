// Exact ARC release of the actual native retained dispatcher pointer; no factory.
import Foundation
@_cdecl("AuxReleaseSignedDevelopmentOwner")
func releaseFreshRuntimeOwnedDispatcher(_ retained: UnsafeMutableRawPointer?) {
    guard let retained else { return }
    Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(retained).release()
}
