// Native trusted caller only: pointer is the exact retained owner created by
// AuxCreateSignedDevelopmentOwner, kept alive by C++ shared ownership.
import Foundation
@_cdecl("AuxCloseDevelopmentOwnerOSAdmission")
func auxCloseDevelopmentOwnerOSAdmission(_ pointer:UnsafeMutableRawPointer?)->Int32 {
    guard let pointer else{return -1}
    let owner=Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(pointer).takeUnretainedValue()
    // Never block a Cocoa/main callback waiting for its own completion. Native
    // embedding closes admission now, then explicitly retries observed pending
    // work later. Untracked async work cannot be promoted to drained.
    switch owner.closeOSAdmissionAndDrain(timeout:0) {
    case .notPresent,.drained:return 0
    case .pending:return 1
    case .untracked:return 2
    }
}
