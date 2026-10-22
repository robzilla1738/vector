import Foundation
import CryptoKit
import Darwin
import Security
// In-memory Security captures + REAL disposable journal. No Security calls.
let fixture=try JSONSerialization.jsonObject(with:FileHandle.standardInput.readDataToEndOfFile()) as! [String:String]
func bytes(_ key:String)->Data{Data(base64Encoded:fixture[key]!)!}
let originals=CapturedInstallationRows(metadata:.data(bytes("metadata")),signing:.data(bytes("signing")),kem:.data(bytes("kem")),wrappedRoot:.data(bytes("wrapped")))
guard case .complete(let snapshot)=inspectCapturedInstallation(originals)else{preconditionFailure()}
let candidate=try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:.init(signing:bytes("signingPublic"),kem:bytes("kemPublic")),verificationChallenge:bytes("syntheticChallenge"))
let roles=["metadata","signing","kem","wrappedRoot"],bindings=roles.map{InstallationRowBinding(row:$0,original:.init(service:"aux.synthetic.original.install",account:"aux.synthetic.original."+$0,accessGroup:"TEST.synthetic.aux"),target:.init(service:"aux.synthetic.target.install",account:"aux.synthetic.target."+$0,accessGroup:"TEST.synthetic.aux"))}
let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
let digest=SHA256.hash(data:try encoder.encode(bindings)).map{String(format:"%02x",$0)}.joined()
let review=try ReviewedInstallationSelectorBindings(reviewId:"8A29FDA3-F730-47C2-98AE-77EE6458871B",bindings:bindings,expectedReviewSha256:digest)
let id="D1CCAAE0-661B-45C5-AE07-10D6F518233C",root=CommandLine.arguments[1]
enum SyntheticStepFailure:Error {case uncertain,ordering}
final class CapturedMemoryBoundary:ExistingInstallationSecurityBoundary {
    enum Mode {case normal,uncertainAfterAddOnce,duplicateWithMatching,tamperFinalReadback}
    let store:PrivateInstallationJournalStore
    let originals:CapturedInstallationRows
    var targets:[String:Data]=[:]
    var mode:Mode
    var adds=0,captures=0,verifiedIntentOrder=0,verifiedStatusOrder=0
    private var expectStatusBeforeReadback=false
    init(store:PrivateInstallationJournalStore,mode:Mode = .normal,originals:CapturedInstallationRows){self.store=store;self.mode=mode;self.originals=originals}
    func captureOriginals(_ review:ReviewedInstallationSelectorBindings)throws->CapturedInstallationRows{captures += 1;return originals}
    func captureTargets(_ review:ReviewedInstallationSelectorBindings)throws->CapturedInstallationRows{
        captures += 1
        if expectStatusBeforeReadback {
            guard try store.loadCurrent()?.journal.phase == .awaitingReadback else{throw SyntheticStepFailure.ordering}
            verifiedStatusOrder += 1;expectStatusBeforeReadback=false
        }
        var captured=targets
        if mode == .tamperFinalReadback,var wrapped=captured["wrappedRoot"] {wrapped[0] ^= 1;captured["wrappedRoot"]=wrapped}
        func row(_ name:String)->CapturedInstallRead{captured[name].map{.data($0)} ?? .missing}
        return .init(metadata:row("metadata"),signing:row("signing"),kem:row("kem"),wrappedRoot:row("wrappedRoot"))
    }
    func addOnly(_ request:PreparedAddOnlyRequest,review:ReviewedInstallationSelectorBindings)throws->OSStatus {
        let checkpoint=try store.loadCurrent()
        guard checkpoint?.journal.phase == .intent,checkpoint?.sha256==request.intentCheckpointSha256 else{throw SyntheticStepFailure.ordering}
        verifiedIntentOrder += 1;adds += 1
        guard targets[request.row]==nil else{return -25299}
        targets[request.row]=request.payload
        if mode == .uncertainAfterAddOnce {mode = .normal;throw SyntheticStepFailure.uncertain}
        if mode == .duplicateWithMatching{return -25299}
        expectStatusBeforeReadback=true;return 0
    }
}
var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
func instance(_ name:String,mode:CapturedMemoryBoundary.Mode = .normal,source:CapturedInstallationRows=originals)throws->(ExistingInstallationMigrationStepCaller,CapturedMemoryBoundary,PrivateInstallationJournalStore) {
    let path=root+"/"+name;guard mkdir(path,0o700)==0 else{throw InstallationJournalStoreError.io(errno)}
    let store=try PrivateInstallationJournalStore(canonicalDisposableRoot:path,transactionId:id),security=CapturedMemoryBoundary(store:store,mode:mode,originals:source)
    return (try ExistingInstallationMigrationStepCaller(candidate:candidate,review:review,bindings:bindings,store:store,security:security,readbackChallenge:bytes("syntheticChallenge")),security,store)
}
let (normal,normalSecurity,_)=try instance("normal")
if case .progress=try normal.start(transactionId:id){checks += 1}else{preconditionFailure()}
for _ in 0..<3{if case .progress=try normal.performOneStep(){checks += 1}else{preconditionFailure()}}
guard case .authenticated(_,let receipt)=try normal.performOneStep()else{preconditionFailure()}
check(receipt.signingAndRootAuthenticated && receipt.sameRootByVerifiedCandidateLineage && !receipt.authorityProvenanceVerified && !receipt.activeSelectionPerformed)
check(receipt.publicCommandReply["sig"]==fixture["signingPublic"] && receipt.initializationPublicReply["kem_pub"]==fixture["kemPublic"])
check(normalSecurity.adds==4 && normalSecurity.verifiedIntentOrder==4 && normalSecurity.verifiedStatusOrder==4)
check(receipt.capturedReceipt.capturedOriginalHashes==candidate.originalRowHashes)
let (crashing,crashSecurity,crashStore)=try instance("uncertain",mode:.uncertainAfterAddOnce)
if case .progress=try crashing.start(transactionId:id){checks += 1}else{preconditionFailure()}
if case .uncertainAdd(_,let role)=try crashing.performOneStep(){check(role=="metadata")}else{preconditionFailure()}
check(try crashStore.loadCurrent()!.journal.phase == .intent)
// Persist ciphertext/public allowlist only; recapture originals on restart.
let archive=try InstallationCandidateArchive(candidate:candidate)
try crashStore.archiveCandidate(archive)
try crashStore.archiveCandidate(archive) // exact create-only idempotency
let archiveObject=try strictEnvelopeObject(archive.encoded())
check(Set(archiveObject.keys)==["format","wrappedRootV2","signingPublicKey","kemPublicKey","sourceChannel","originalRowHashes","candidateSha256","archiveSha256"])
let archiveText=String(data:try archive.encoded(),encoding:.utf8)!
check(!archiveText.contains(bytes("signing").base64EncodedString()) && !archiveText.contains(bytes("kem").base64EncodedString()))
let reopenedStore=try PrivateInstallationJournalStore(canonicalDisposableRoot:root+"/uncertain",transactionId:id)
let reloadedArchive=try reopenedStore.loadCandidateArchive()
let recovered=try recoverSoftwareP256Installation(originals,archive:reloadedArchive,expectedCandidateSha256:reopenedStore.loadCurrent()!.journal.candidateSha256,verificationChallenge:bytes("syntheticChallenge"))
check(recovered.wrappedRootV2==candidate.wrappedRootV2 && recovered.originalRowHashes==candidate.originalRowHashes)
check(try migrationCandidateDigest(recovered)==crashStore.loadCurrent()!.journal.candidateSha256)
func refuse(_ action:()throws->Void){do{try action();preconditionFailure("expected refusal")}catch{checks += 1}}
refuse{_ = try recoverSoftwareP256Installation(originals,archive:reloadedArchive,expectedCandidateSha256:String(repeating:"0",count:64),verificationChallenge:bytes("syntheticChallenge"))}
let changed=CapturedInstallationRows(metadata:.data(bytes("metadata")+Data([32])),signing:originals.signing,kem:originals.kem,wrappedRoot:originals.wrappedRoot)
refuse{_ = try recoverSoftwareP256Installation(changed,archive:reloadedArchive,expectedCandidateSha256:reloadedArchive.candidateSha256,verificationChallenge:bytes("syntheticChallenge"))}
// A self-consistent public archive digest is not authenticity: valid encryption
// of a different synthetic root must still fail the recovered same-root check.
var differentRootObject=archiveObject
let differentRootEnvelope=try AuxNativeEnvelopeV2.wrap(root:Data(repeating:0x77,count:32),existingPublicKey:bytes("kemPublic"))
differentRootObject["wrappedRootV2"]=try differentRootEnvelope.auxJson().base64EncodedString()
differentRootObject.removeValue(forKey:"archiveSha256")
differentRootObject["archiveSha256"]=SHA256.hash(data:try JSONSerialization.data(withJSONObject:differentRootObject,options:[.sortedKeys,.withoutEscapingSlashes])).map{String(format:"%02x",$0)}.joined()
let differentRootArchive=try InstallationCandidateArchive.decode(JSONSerialization.data(withJSONObject:differentRootObject,options:[.sortedKeys,.withoutEscapingSlashes]))
refuse{_ = try recoverSoftwareP256Installation(originals,archive:differentRootArchive,expectedCandidateSha256:archive.candidateSha256,verificationChallenge:bytes("syntheticChallenge"))}
check(try reopenedStore.loadCandidateArchive().wrappedRootV2==candidate.wrappedRootV2)
// Actual disposable archive corruption: preserve corrupted evidence, never rewrite.
let corruptPath=root+"/corrupt-archive";precondition(mkdir(corruptPath,0o700)==0)
let corruptStore=try PrivateInstallationJournalStore(canonicalDisposableRoot:corruptPath,transactionId:id)
let draft=try AdditiveInstallationTransaction.prepare(candidate:candidate,transactionId:id,bindings:bindings,originals:originals,targets:.init(metadata:.missing,signing:.missing,kem:.missing,wrappedRoot:.missing))
_ = try corruptStore.commit(draft,expectedHead:nil);try corruptStore.archiveCandidate(archive)
let archivePath=corruptPath+"/.aux-installation-journal-"+id.lowercased()+"/candidate-archive.json"
var corrupt=try archive.encoded();corrupt[corrupt.count-2] ^= 1
let handle=try FileHandle(forWritingTo:URL(fileURLWithPath:archivePath));try handle.write(contentsOf:corrupt);try handle.synchronize();try handle.close()
refuse{_ = try corruptStore.loadCandidateArchive()}
refuse{try corruptStore.archiveCandidate(archive)}
// A new caller restores the exact candidate, reloads the same intent, and
// observes the already-added matching row without another Add.
let resumed=try ExistingInstallationMigrationStepCaller(candidate:recovered,review:review,bindings:bindings,store:reopenedStore,security:crashSecurity,readbackChallenge:bytes("syntheticChallenge"))
if case .progress=try resumed.performOneStep(){check(crashSecurity.adds==1)}else{preconditionFailure()}
_ = try resumed.performOneStep();_ = try resumed.performOneStep()
if case .authenticated=try resumed.performOneStep(){checks += 1}else{preconditionFailure()}
check(crashSecurity.adds==4 && crashSecurity.verifiedIntentOrder==4 && crashSecurity.verifiedStatusOrder==3)
let (duplicate,duplicateSecurity,_)=try instance("duplicate",mode:.duplicateWithMatching)
_ = try duplicate.start(transactionId:id)
if case .stopped(let state)=try duplicate.performOneStep(){check(state.journal.failure=="add-status:metadata:-25299")}else{preconditionFailure()}
let previousCaptures=duplicateSecurity.captures
if case .stopped=try duplicate.performOneStep(){check(duplicateSecurity.captures==previousCaptures && duplicateSecurity.adds==1)}else{preconditionFailure()}
let (tampered,_,_)=try instance("tampered",mode:.tamperFinalReadback)
_ = try tampered.start(transactionId:id)
for _ in 0..<3{_ = try tampered.performOneStep()}
if case .stopped(let state)=try tampered.performOneStep(){check(state.journal.failure=="target-unknown:wrappedRoot")}else{preconditionFailure()}
let missing=CapturedInstallationRows(metadata:.missing,signing:.missing,kem:.missing,wrappedRoot:.missing)
let (absent,absentSecurity,_)=try instance("no-fresh",source:missing)
if case .stopped(let state)=try absent.start(transactionId:id){check(state.journal.failure=="original-missing:metadata" && absentSecurity.adds==0)}else{preconditionFailure()}
print(String(data:try JSONSerialization.data(withJSONObject:["checks":checks,"normalTargetWrapper":normalSecurity.targets["wrappedRoot"]!.base64EncodedString(),"actualSecurityExecuted":false,"enclaveExecuted":false,"pqExecuted":false,"activeSelectionPerformed":false]),encoding:.utf8)!)
