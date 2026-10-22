// Trusted native producer SOURCE. No JS argument, module initializer or bypass.
import Foundation
#if !AUX_MINIMAL_RUNTIME_DISPATCH || !AUX_SCOPED_SECURE_STORE_DISPATCH || !AUX_MACOS_UTILITY_DISPATCH
#error("Development owner requires the reviewed minimal scoped runtime graph with owned OS utilities")
#endif

private func sameDevelopmentHost(_ before:AuxAuthenticatedDevelopmentPolicy,_ after:AuxAuthenticatedDevelopmentPolicy)throws {
    guard before.policySha256==after.policySha256,before.bundlePath==after.bundlePath,before.hostCdHash==after.hostCdHash,before.contents.role==after.contents.role else{throw AuxDevelopmentHostError.identity}
}
@_cdecl("AuxCreateSignedDevelopmentOwner")
func AuxCreateSignedDevelopmentOwner(_ handle:UnsafeMutablePointer<UInt64>?,_ retained:UnsafeMutablePointer<UnsafeMutableRawPointer?>?)->Int32 {
    guard let handle=handle,let retained=retained else{return -1};handle.pointee=0;retained.pointee=nil
    do {
        // Caller must own actual writer admission before entering. The sealed
        // resource authenticates fixed policy content, NOT process/cohort custody.
        let before=try AuxSignedDevelopmentPolicyLoader.load()
        let rows=try AuxRuntimeDataProtectionCapture.capture(before.contents.selection)
        let afterCapture=try AuxSignedDevelopmentPolicyLoader.load();try sameDevelopmentHost(before,afterCapture)
        let terminal=try AuxRuntimeCapturedCommandContext.validate(selection:before.contents.selection,rows:rows)
        let scoped=try ScopedAuxCommandContext.runtime(terminal:terminal,policy:before.contents.logicalKeys,boundary:ActualAuxSecureStoreBoundary())
        let afterImport=try AuxSignedDevelopmentPolicyLoader.load();try sameDevelopmentHost(before,afterImport)
        // Constructing this boundary performs no OS operation. The exact same
        // scoped owner retains its immutable utility core/custody, so registry
        // retirement and typed drain close these jobs rather than another owner.
        let osCustody=AuxOSJobCustody()
        let osBoundary=AuxAppKitUtilityBoundary(custody:osCustody)
        let osUtilities=AuxMacOSUtilityCommandCore(boundary:osBoundary)
        let owner=try AuxOwnedCommandDispatcher(scopedTerminal:scoped,macOSUtilities:osUtilities)
        handle.pointee=owner.handle;retained.pointee=Unmanaged.passRetained(owner).toOpaque();return 0
    }catch{return -1} // Fixed status only; never log native keys/policy/private data.
}
@_cdecl("AuxReleaseSignedDevelopmentOwner")
func AuxReleaseSignedDevelopmentOwner(_ retained:UnsafeMutableRawPointer?) {
    guard let retained=retained else{return};Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(retained).release()
}
