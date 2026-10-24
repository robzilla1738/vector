// Native trusted caller only: pointer is the exact retained owner created by
// AuxCreateSignedDevelopmentOwner, kept alive by C++ shared ownership.
import Foundation
@_silgen_name("AuxDevelopmentOwnerCleanSettlementStatus")
private func observeNativeCleanSettlement(_ pointer:UnsafeMutableRawPointer)->Int32

@_silgen_name("AuxCloseInheritedCrashRegistration")
private func closeInheritedCrashRegistration()->Int32

@_cdecl("AuxCompleteDevelopmentOwnerBrowserCleanShutdown")
func auxCompleteDevelopmentOwnerBrowserCleanShutdown(_ pointer:UnsafeMutableRawPointer?)->Int32 {
    guard let pointer else{return -1}
    // Validate native registry membership before interpreting the pointer.
    let status=observeNativeCleanSettlement(pointer)
    guard status==0 else{return status}
    // Only the actual native all-writer settlement permits releasing this
    // process's inherited Crashpad registration before requesting browser CLEAN.
    let crashStatus=closeInheritedCrashRegistration()
    guard crashStatus==0 else{return crashStatus}
    let owner=Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(pointer).takeUnretainedValue()
    do { try owner.completeBrowserCleanShutdown(); return 0 }
    catch AuxDispatcherLifetimeError.retiring { return 1 }
    catch AuxDispatcherLifetimeError.reentrantRetirement { return 1 }
    catch AuxFreshColdGuardError.peer(1) { return 1 }
    catch { return 2 }
}
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
