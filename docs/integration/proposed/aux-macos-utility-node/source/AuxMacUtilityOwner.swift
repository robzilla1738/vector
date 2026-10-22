// Fixed five-command capability; no installation/credential authority or Security.
import Foundation
private final class MacUtilityOwner {
    let core:AuxMacOSUtilityCommandCore
    init(){let custody=AuxOSJobCustody();core=AuxMacOSUtilityCommandCore(boundary:AuxAppKitUtilityBoundary(custody:custody))}
}
@_cdecl("AuxCreateMacUtilityOwner")
func createMacUtilityOwner()->UnsafeMutableRawPointer {Unmanaged.passRetained(MacUtilityOwner()).toOpaque()}
@_cdecl("AuxRunMacUtilityOwner")
func runMacUtilityOwner(_ pointer:UnsafeMutableRawPointer?,_ command:UnsafePointer<CChar>?,_ input:UnsafePointer<CChar>?)->UnsafeMutablePointer<CChar>? {
    guard let pointer,let command,let input else{return nil}
    let owner=Unmanaged<MacUtilityOwner>.fromOpaque(pointer).takeUnretainedValue(),name=String(cString:command)
    let output=owner.core.run(command:name,input:String(cString:input)) ?? "{\"error\":\"Unknown native macOS utility command\"}"
    return strdup(output)
}
@_cdecl("AuxCloseMacUtilityOwner")
func closeMacUtilityOwner(_ pointer:UnsafeMutableRawPointer?)->Int32 {
    guard let pointer else{return 2}
    switch Unmanaged<MacUtilityOwner>.fromOpaque(pointer).takeUnretainedValue().core.closeAdmissionAndDrain(timeout:0) {
    case .drained:return 0
    case .pending:return 1
    case .notPresent,.untracked:return 2
    }
}
@_cdecl("AuxReleaseMacUtilityOwner")
func releaseMacUtilityOwner(_ pointer:UnsafeMutableRawPointer?){if let pointer{Unmanaged<MacUtilityOwner>.fromOpaque(pointer).release()}}
