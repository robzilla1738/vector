// A per-invocation use of the utility core already linked into the daemon.
// The original fixed addon bytes and global nonsecret icon facade stay intact.
import Foundation
final class AuxSelectedUtilityInvocation {
    let sessionLease:UInt64
    let session:AuxSelectedSessionOwner
    private let custody:AuxOSJobCustody
    private let core:AuxMacOSUtilityCommandCore
    init(sessionLease:UInt64,session:AuxSelectedSessionOwner) {
        self.sessionLease=sessionLease;self.session=session
        let jobs=AuxOSJobCustody();custody=jobs
        core=AuxMacOSUtilityCommandCore(boundary:AuxAppKitUtilityBoundary(custody:jobs))
    }
    func run(command:String,input:String)throws->String {
        guard ["generate-thumbnail","list-open-apps","app-icons","copy-file"].contains(command) else{throw AuxMemoryAccountError.unavailable}
        try session.revalidate()
        guard let output=core.run(command:command,input:input) else{throw AuxMemoryAccountError.unavailable}
        return output
    }
    // Timeout/cancellation never imply settlement. Closure fences future
    // callback writes; actual completion remains in this exact native custody.
    func closeAndDrain()->Bool {
        if case .drained=core.closeAdmissionAndDrain(timeout:0){return true}
        return false
    }
}
