import Foundation
import Darwin
let scope=String(repeating:"c",count:64)
let admission=CallerAssertedFreshAdmission(scope:scope,metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent,newScopeExplicitlyReviewed:true)
let c=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(AuxFreshInstallationFactory.prepare(admission:admission,secureEnclaveAvailable:false,macOS26Available:false))
let bindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".install.v2",account:"aux."+scope+"."+$0,accessGroup:"TEST.aux.synthetic"))}
func captures(_ bytes:[String:Data])->CallerCapturedFreshTargets {
    func read(_ role:String)->CallerCapturedFreshRead { bytes[role].map{.bytes($0)} ?? .absent }
    return .init(metadata:read("metadata"),signing:read("signing"),kem:read("kem"),wrappedRoot:read("wrappedRoot"))
}
let absent=captures([:])
let review=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:absent)
let unavailable=CallerCapturedFreshTargets(metadata:.unavailable(-1),signing:.absent,kem:.absent,wrappedRoot:.absent)
do { _ = try FreshInstallationTransaction.prepare(candidate:c,transactionId:UUID().uuidString,review:review,bindings:bindings,captured:unavailable);fatalError("unavailable became absence") } catch FreshJournalError.observation {}

for bad in [
 CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.knownExisting,custody:.exclusiveStoppedStartup,legacyArtifacts:absent),
 CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.unavailable,legacyArtifacts:absent),
 CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:unavailable),
 CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:captures(["metadata":Data([1])]))
] {
 do { _ = try FreshInstallationTransaction.prepare(candidate:c,transactionId:UUID().uuidString,review:bad,bindings:bindings,captured:absent);fatalError("legacy/current empty namespace confused with never-used scope") } catch FreshJournalError.observation {}
}
let rootURL=FileManager.default.temporaryDirectory.appendingPathComponent("aux-fresh-journal-"+UUID().uuidString)
try FileManager.default.createDirectory(at:rootURL,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer{try? FileManager.default.removeItem(at:rootURL)}
let rawRoot = rootURL.path
let canonical = realpath(rawRoot,nil)!
let root = String(cString:canonical)
free(canonical)
let id=UUID().uuidString
let store=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:id)
var j=try FreshInstallationTransaction.prepare(candidate:c,transactionId:id,review:review,bindings:bindings,captured:absent)
var stored=try store.commit(j,expectedHead:nil)
var data:[String:Data]=[:]
for role in freshRoles {
    let previous=stored.sha256
    j=try FreshInstallationTransaction.intendNext(j,checkpoint:stored.acknowledgement,captured:captures(data))
    let staged=try store.stage(j,expectedHead:previous)
    let beforePublish = try store.loadCurrent()!.sha256
    precondition(beforePublish==previous) // Staging alone never publishes.
    stored=try store.publish(staged,expectedHead:previous)
    do { _ = try store.publish(staged,expectedHead:previous);fatalError("stale CAS accepted") } catch FreshInstallationJournalStoreError.staleHead {}
    let request=try FreshInstallationTransaction.addRequest(j,checkpoint:stored.acknowledgement,candidate:c,captured:captures(data))
    precondition(request.row==role && !request.deletePermitted && !request.overwritePermitted)
    data[role]=request.payload // Synthetic captured dictionary only; no Security write.
    j=try FreshInstallationTransaction.recordAdd(j,checkpoint:stored.acknowledgement,status:.added)
    stored=try store.commit(j,expectedHead:stored.sha256)
    j=try FreshInstallationTransaction.readback(j,checkpoint:stored.acknowledgement,captured:captures(data))
    stored=try store.commit(j,expectedHead:stored.sha256)
}
precondition(j.phase == .ready && j.verified==freshRoles)
let reloaded=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:id).loadCurrent()!
precondition(reloaded.sha256==stored.sha256)
var duplicate=try FreshInstallationTransaction.prepare(candidate:c,transactionId:UUID().uuidString,review:review,bindings:bindings,captured:absent)
duplicate=try FreshInstallationTransaction.intendNext(duplicate,checkpoint:duplicate.checkpoint(),captured:absent)
let blocked=try FreshInstallationTransaction.recordAdd(duplicate,checkpoint:duplicate.checkpoint(),status:.duplicate)
precondition(blocked.phase == .blocked && blocked.intended==["metadata"] && blocked.verified.isEmpty)
do { _ = try FreshInstallationTransaction.addRequest(blocked,checkpoint:blocked.checkpoint(),candidate:c,captured:absent);fatalError("blocked retried") } catch FreshJournalError.candidate {}
let interrupted=try FreshInstallationTransaction.interruptIntent(duplicate,checkpoint:duplicate.checkpoint())
precondition(interrupted.phase == .blocked)
// An added first row is retained when the second add fails; no reset/delete API.
var partial=try FreshInstallationTransaction.prepare(candidate:c,transactionId:UUID().uuidString,review:review,bindings:bindings,captured:absent)
partial=try FreshInstallationTransaction.intendNext(partial,checkpoint:partial.checkpoint(),captured:absent)
let first=try FreshInstallationTransaction.addRequest(partial,checkpoint:partial.checkpoint(),candidate:c,captured:absent)
partial=try FreshInstallationTransaction.recordAdd(partial,checkpoint:partial.checkpoint(),status:.added)
let changed=try FreshInstallationTransaction.readback(partial,checkpoint:partial.checkpoint(),captured:captures(["metadata":Data([0])]))
precondition(changed.phase == .blocked && changed.verified.isEmpty)
partial=try FreshInstallationTransaction.readback(partial,checkpoint:partial.checkpoint(),captured:captures(["metadata":first.payload]))
partial=try FreshInstallationTransaction.intendNext(partial,checkpoint:partial.checkpoint(),captured:captures(["metadata":first.payload]))
partial=try FreshInstallationTransaction.recordAdd(partial,checkpoint:partial.checkpoint(),status:.failed(-1))
precondition(partial.phase == .blocked && partial.verified==["metadata"] && partial.intended==["metadata","signing"])
// FIFO head/LOCK refuse promptly rather than block on another process.
let fifoId=UUID().uuidString
let fifoStore=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:fifoId)
let directory=root+"/.aux-fresh-installation-journal-"+fifoId.lowercased()
precondition(mkfifo(directory+"/HEAD.json",0o600)==0)
do { _ = try fifoStore.loadCurrent();fatalError("FIFO head accepted") } catch FreshInstallationJournalStoreError.unsafeMetadata {}
precondition(unlink(directory+"/HEAD.json")==0 && unlink(directory+"/LOCK")==0 && mkfifo(directory+"/LOCK",0o600)==0)
do { _ = try fifoStore.loadCurrent();fatalError("FIFO lock accepted") } catch FreshInstallationJournalStoreError.unsafeMetadata {}
print("fresh reducer + private durable journal success/CAS/orphan/terminal/FIFO checks passed; no Security operations")
