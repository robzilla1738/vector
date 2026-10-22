// FIXTURE ONLY. Never compiled into a production adapter/module.
import Foundation
import CryptoKit
func capturedContext(_ byte:UInt8)throws->CapturedTerminalCommandContext {
    var raw=Data(repeating:0,count:32);raw[31]=byte
    let signer=try P256.Signing.PrivateKey(rawRepresentation:raw)
    raw[31]=byte+1;let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:raw)
    let root=Data(repeating:byte,count:32)
    let candidate=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(.init(kind:.softwareP256,root:root,signingPrivateRepresentation:signer.rawRepresentation,kemPrivateRepresentation:kem.rawRepresentation,signingPublicRepresentation:signer.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation))
    func captures(_ values:[String:Data])->CallerCapturedFreshTargets {
        func row(_ name:String)->CallerCapturedFreshRead { values[name].map{.bytes($0)} ?? .absent }
        return .init(metadata:row("metadata"),signing:row("signing"),kem:row("kem"),wrappedRoot:row("wrappedRoot"))
    }
    let scope=String(repeating:"e",count:64),absent=captures([:])
    let review=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:absent)
    let bindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".v2",account:"aux."+scope+".v2."+$0,accessGroup:"TEST.aux.synthetic"))}
    var j=try FreshInstallationTransaction.prepare(candidate:candidate,transactionId:UUID().uuidString,review:review,bindings:bindings,captured:absent)
    var values=[String:Data]()
    for role in freshRoles {
        j=try FreshInstallationTransaction.intendNext(j,checkpoint:j.checkpoint(),captured:captures(values))
        let request=try FreshInstallationTransaction.addRequest(j,checkpoint:j.checkpoint(),candidate:candidate,captured:captures(values))
        values[role]=request.payload
        j=try FreshInstallationTransaction.recordAdd(j,checkpoint:j.checkpoint(),status:.added)
        j=try FreshInstallationTransaction.readback(j,checkpoint:j.checkpoint(),captured:captures(values))
    }
    return try .fresh(checkpoint:.init(journal:j,sha256:j.checkpoint().journalSha256),candidate:candidate,targets:captures(values))
}
private final class FixtureCounts {
    let lock=NSLock();var created:UInt64=0;var released:UInt64=0
}
private let fixtureCounts=FixtureCounts()
@_cdecl("AuxFixtureCreateOwner")
func auxFixtureCreateOwner(_ handle:UnsafeMutablePointer<UInt64>?)->UnsafeMutableRawPointer? {
    guard let handle else{return nil}
    do {
        let owner=try AuxOwnedCommandDispatcher(capturedTerminal:capturedContext(15))
        handle.pointee=owner.handle
        fixtureCounts.lock.lock();fixtureCounts.created += 1;fixtureCounts.lock.unlock()
        return Unmanaged.passRetained(owner).toOpaque()
    }catch{return nil}
}
@_cdecl("AuxFixtureReleaseOwner")
func auxFixtureReleaseOwner(_ pointer:UnsafeMutableRawPointer?) {
    guard let pointer else{return}
    Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(pointer).release()
    fixtureCounts.lock.lock();fixtureCounts.released += 1;fixtureCounts.lock.unlock()
}
@_cdecl("AuxFixtureCreatedCount")
func auxFixtureCreatedCount()->UInt64 {
    fixtureCounts.lock.lock();defer{fixtureCounts.lock.unlock()};return fixtureCounts.created
}
@_cdecl("AuxFixtureReleasedCount")
func auxFixtureReleasedCount()->UInt64 {
    fixtureCounts.lock.lock();defer{fixtureCounts.lock.unlock()};return fixtureCounts.released
}
