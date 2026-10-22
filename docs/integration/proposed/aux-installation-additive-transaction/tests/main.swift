// Pure transaction simulation: no Security API or installation row is accessed.
let fixture=try JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))) as! [String:String]
func bytes(_ key:String)->Data{Data(base64Encoded:fixture[key]!)!}
let originals=CapturedInstallationRows(metadata:.data(bytes("metadata")),signing:.data(bytes("signing")),kem:.data(bytes("kem")),wrappedRoot:.data(bytes("wrapped")))
guard case .complete(let snapshot)=inspectCapturedInstallation(originals)else{preconditionFailure()}
let candidate=try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:.init(signing:bytes("signingPublic"),kem:bytes("kemPublic")),verificationChallenge:bytes("syntheticChallenge"))
let payload:[String:Data]=["metadata":candidate.metadataBytes,"signing":candidate.signingRepresentation,"kem":candidate.kemRepresentation,"wrappedRoot":candidate.wrappedRootV2]
func captures(_ target:[String:Data])->CapturedInstallationRows{.init(metadata:target["metadata"].map{.data($0)} ?? .missing,signing:target["signing"].map{.data($0)} ?? .missing,kem:target["kem"].map{.data($0)} ?? .missing,wrappedRoot:target["wrappedRoot"].map{.data($0)} ?? .missing)}
let roles=["metadata","signing","kem","wrappedRoot"],bindings=roles.map{InstallationRowBinding(row:$0,original:.init(service:"aux.synthetic.original.install",account:"aux.synthetic.original."+$0,accessGroup:"TEST.synthetic.aux"),target:.init(service:"aux.synthetic.target.install",account:"aux.synthetic.target."+$0,accessGroup:"TEST.synthetic.aux"))}
var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
func fails(_ body:()throws->Void){do{try body();preconditionFailure()}catch{checks += 1}}
var targets:[String:Data]=[:]
var journal=try AdditiveInstallationTransaction.prepare(candidate:candidate,transactionId:"D1CCAAE0-661B-45C5-AE07-10D6F518233C",bindings:bindings,originals:originals,targets:captures(targets))
check(journal.phase == .draft)
fails{_ = try AdditiveInstallationTransaction.addRequest(journal,checkpoint:journal.checkpoint(),candidate:candidate,originals:originals,targets:captures(targets))}
fails{_ = try AdditiveInstallationTransaction.intendNext(journal,checkpoint:.init(journalSha256:String(repeating:"0",count:64)),originals:originals,targets:captures(targets))}
let collision=try AdditiveInstallationTransaction.prepare(candidate:candidate,transactionId:journal.transactionId,bindings:bindings,originals:originals,targets:captures(["metadata":payload["metadata"]!]))
check(collision.phase == .blocked && collision.failure=="target-collision:metadata")
let unreadable=CapturedInstallationRows(metadata:.missing,signing:.securityFailure(-34018),kem:.missing,wrappedRoot:.missing)
let blocked=try AdditiveInstallationTransaction.prepare(candidate:candidate,transactionId:journal.transactionId,bindings:bindings,originals:originals,targets:unreadable)
check(blocked.phase == .blocked && blocked.failure=="target-blocked:signing:-34018")
var crashedIntent:AdditiveInstallationJournal?
for role in roles {
    journal=try AdditiveInstallationTransaction.intendNext(journal,checkpoint:journal.checkpoint(),originals:originals,targets:captures(targets))
    // Serialize/reload the intended checkpoint BEFORE exposing an add request.
    journal=try AdditiveInstallationJournal.decode(journal.encoded())
    let request=try AdditiveInstallationTransaction.addRequest(journal,checkpoint:journal.checkpoint(),candidate:candidate,originals:originals,targets:captures(targets))
    check(request.row==role && request.payload==payload[role] && !request.overwritePermitted && !request.deletePermitted)
    if role=="metadata" {
        crashedIntent=journal
        let failed=try AdditiveInstallationTransaction.capturedAddStatus(journal,checkpoint:journal.checkpoint(),status:-25299)
        check(failed.phase == .blocked && failed.failure=="add-status:metadata:-25299")
        fails{_ = try AdditiveInstallationTransaction.reconcile(failed,checkpoint:failed.checkpoint(),originals:originals,targets:captures(targets))}
        var favorable=targets;favorable[role]=request.payload
        fails{_ = try AdditiveInstallationTransaction.reconcile(failed,checkpoint:failed.checkpoint(),originals:originals,targets:captures(favorable))}
        let abandonedFailure=try AdditiveInstallationTransaction.abandon(failed,checkpoint:failed.checkpoint())
        check(abandonedFailure.phase == .abandoned && abandonedFailure.originalHashes==failed.originalHashes)
        var changed=targets;changed[role]=Data("unknown concurrent bytes".utf8)
        let refused=try AdditiveInstallationTransaction.reconcile(journal,checkpoint:journal.checkpoint(),originals:originals,targets:captures(changed))
        check(refused.phase == .blocked && refused.failure=="target-unknown:metadata")
        let changedOriginals=CapturedInstallationRows(metadata:.data(Data("changed".utf8)),signing:originals.signing,kem:originals.kem,wrappedRoot:originals.wrappedRoot)
        let refusedOriginal=try AdditiveInstallationTransaction.reconcile(journal,checkpoint:journal.checkpoint(),originals:changedOriginals,targets:captures(targets))
        check(refusedOriginal.phase == .blocked && refusedOriginal.failure=="original-changed:metadata")
        // Crash AFTER simulated add but BEFORE any captured add status/readback was journaled.
        targets[role]=request.payload
        journal=try AdditiveInstallationTransaction.reconcile(journal,checkpoint:journal.checkpoint(),originals:originals,targets:captures(targets))
        check(journal.phase == .draft && journal.verified==[role])
    } else {
        journal=try AdditiveInstallationTransaction.capturedAddStatus(journal,checkpoint:journal.checkpoint(),status:0)
        let missingReadback=try AdditiveInstallationTransaction.reconcile(journal,checkpoint:journal.checkpoint(),originals:originals,targets:captures(targets))
        check(missingReadback.phase == .blocked && missingReadback.failure=="target-missing-after-success:"+role)
        if role=="signing" {
            fails{_ = try AdditiveInstallationTransaction.reconcile(missingReadback,checkpoint:missingReadback.checkpoint(),originals:originals,targets:captures(targets))}
            var favorable=targets;favorable[role]=request.payload
            fails{_ = try AdditiveInstallationTransaction.reconcile(missingReadback,checkpoint:missingReadback.checkpoint(),originals:originals,targets:captures(favorable))}
        }
        targets[role]=request.payload
        journal=try AdditiveInstallationTransaction.reconcile(journal,checkpoint:journal.checkpoint(),originals:originals,targets:captures(targets))
    }
}
check(journal.phase == .ready && journal.verified==roles)
let receipt=try AdditiveInstallationTransaction.verifiedReceipt(journal,checkpoint:journal.checkpoint(),originals:originals,targets:captures(targets))
check(!receipt.persistencePerformedByThisTool && !receipt.activeSelectionPerformed && !receipt.authorityProvenanceVerified)
check(receipt.capturedOriginalHashes==candidate.originalRowHashes)
// An unknown fourth target cannot be adopted by an earlier one-row intent.
let unknown=try AdditiveInstallationTransaction.reconcile(crashedIntent!,checkpoint:crashedIntent!.checkpoint(),originals:originals,targets:captures(targets))
check(unknown.phase == .blocked && unknown.failure=="target-unknown:signing")
let abandoned=try AdditiveInstallationTransaction.abandon(journal,checkpoint:journal.checkpoint())
check(abandoned.phase == .abandoned && abandoned.targetHashes==journal.targetHashes && abandoned.originalHashes==journal.originalHashes)
fails{_ = try AdditiveInstallationTransaction.reconcile(abandoned,checkpoint:abandoned.checkpoint(),originals:originals,targets:captures(targets))}
let serialized=try journal.encoded()
check(!String(data:serialized,encoding:.utf8)!.contains(candidate.signingRepresentation.base64EncodedString()))
print(String(data:try JSONSerialization.data(withJSONObject:["checks":checks,"journalHashesOnly":true,"originalsPreserved":true,"executorRan":false,"selectionSwitched":false]),encoding:.utf8)!)
