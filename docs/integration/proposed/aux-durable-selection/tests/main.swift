import Darwin
import Foundation
import CryptoKit
var checks=0
func check(_ ok:Bool){precondition(ok);checks += 1}
func fails(_ body:()throws->Void){do{try body();fatalError("bad context accepted")}catch{checks += 1}}
let root=Data(repeating:0x63,count:32),challenge=Data("synthetic terminal caller".utf8)
var scalar=Data(repeating:0,count:32);scalar[31]=9
let signer=try P256.Signing.PrivateKey(rawRepresentation:scalar)
scalar[31]=10;let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:scalar)
let fresh=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(.init(kind:.softwareP256,root:root,signingPrivateRepresentation:signer.rawRepresentation,kemPrivateRepresentation:kem.rawRepresentation,signingPublicRepresentation:signer.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation))
let payload=["metadata":fresh.targetPayloads.metadata,"signing":fresh.targetPayloads.signing,"kem":fresh.targetPayloads.kem,"wrappedRoot":fresh.targetPayloads.wrappedRoot]
func captured(_ values:[String:Data])->CallerCapturedFreshTargets {
    func one(_ role:String)->CallerCapturedFreshRead{values[role].map{.bytes($0)} ?? .absent}
    return .init(metadata:one("metadata"),signing:one("signing"),kem:one("kem"),wrappedRoot:one("wrappedRoot"))
}
let scope=String(repeating:"d",count:64),absent=captured([:])
let freshBindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".installation.v2",account:"aux."+scope+".installation.v2."+$0,accessGroup:"TEST.aux.synthetic"))}
let review=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:absent)
var journal=try FreshInstallationTransaction.prepare(candidate:fresh,transactionId:UUID().uuidString,review:review,bindings:freshBindings,captured:absent)
let initial=journal
var current=[String:Data]()
for role in freshRoles {
    journal=try FreshInstallationTransaction.intendNext(journal,checkpoint:journal.checkpoint(),captured:captured(current))
    let request=try FreshInstallationTransaction.addRequest(journal,checkpoint:journal.checkpoint(),candidate:fresh,captured:captured(current))
    current[role]=request.payload
    journal=try FreshInstallationTransaction.recordAdd(journal,checkpoint:journal.checkpoint(),status:.added)
    journal=try FreshInstallationTransaction.readback(journal,checkpoint:journal.checkpoint(),captured:captured(current))
}
func stored(_ j:FreshInstallationJournal)throws->StoredFreshInstallationCheckpoint{.init(journal:j,sha256:try j.checkpoint().journalSha256)}
let freshContext=try CapturedTerminalCommandContext.fresh(checkpoint:stored(journal),candidate:fresh,targets:captured(current))
func response(_ core:AuxInstallationCommandCore,_ command:String,_ input:String="")throws->[String:Any]{try JSONSerialization.jsonObject(with:Data(core.run(command:command,input:input).utf8)) as! [String:Any]}
check(try response(freshContext.core,"dk-unwrap")["dk"] as? String==root.base64EncodedString())
let signed=try response(freshContext.core,"cdp-sign","{\"challenge\":\"\(challenge.base64EncodedString())\"}")["signature"] as! String
check(try signer.publicKey.isValidSignature(P256.Signing.ECDSASignature(derRepresentation:Data(base64Encoded:signed)!),for:challenge))
check(!freshContext.evidence.writerAdmissionVerified && !freshContext.evidence.authorityProvenanceVerified && !freshContext.evidence.activeSelectionPerformed)
fails{_ = try CapturedTerminalCommandContext.fresh(checkpoint:stored(initial),candidate:fresh,targets:captured(current))}
fails{_ = try CapturedTerminalCommandContext.fresh(checkpoint:.init(journal:journal,sha256:String(repeating:"0",count:64)),candidate:fresh,targets:captured(current))}
var changed=current;changed["metadata"]=Data([1]);fails{_ = try CapturedTerminalCommandContext.fresh(checkpoint:stored(journal),candidate:fresh,targets:captured(changed))}
let unavailable=CallerCapturedFreshTargets(metadata:.unavailable(-1),signing:.absent,kem:.absent,wrappedRoot:.absent)
fails{_ = try CapturedTerminalCommandContext.fresh(checkpoint:stored(journal),candidate:fresh,targets:unavailable)}
var wrongCandidate=journal;wrongCandidate=FreshInstallationJournal(format:journal.format,transactionId:journal.transactionId,scope:journal.scope,newScopeReviewId:journal.newScopeReviewId,candidateSha256:String(repeating:"0",count:64),bindings:journal.bindings,publicDescriptor:journal.publicDescriptor,targetHashes:journal.targetHashes,legacyObservedAbsentRoles:journal.legacyObservedAbsentRoles,initialObservedAbsentRoles:journal.initialObservedAbsentRoles,revision:journal.revision,phase:journal.phase,intended:journal.intended,verified:journal.verified,failure:nil)
fails{_ = try CapturedTerminalCommandContext.fresh(checkpoint:stored(wrongCandidate),candidate:fresh,targets:captured(current))}

// External migration fixture only: synthesize legacy wrapping, prepare real same
// authority candidate, then bind actual reducer-generated terminal readback.
let ephemeral=P256.KeyAgreement.PrivateKey()
let shared=try ephemeral.sharedSecretFromKeyAgreement(with:kem.publicKey)
let legacyContext=Data("aside.wrap.dk.v1".utf8)
let wrapKey=shared.hkdfDerivedSymmetricKey(using:SHA256.self,salt:Data(),sharedInfo:legacyContext,outputByteCount:32)
let sealed=try ChaChaPoly.seal(root,using:wrapKey,authenticating:legacyContext)
let legacy=try JSONSerialization.data(withJSONObject:["scheme":"p256_v1","purpose":"dk","ephemeral_public_key":ephemeral.publicKey.x963Representation.base64EncodedString(),"nonce":sealed.nonce.withUnsafeBytes{Data($0)}.base64EncodedString(),"ciphertext":(sealed.ciphertext+sealed.tag).base64EncodedString()])
func oldCaptures(_ values:[String:Data])->CapturedInstallationRows {
    func one(_ role:String)->CapturedInstallRead{values[role].map{.data($0)} ?? .missing}
    return .init(metadata:one("metadata"),signing:one("signing"),kem:one("kem"),wrappedRoot:one("wrappedRoot"))
}
let original=oldCaptures(["metadata":payload["metadata"]!,"signing":signer.rawRepresentation,"kem":kem.rawRepresentation,"wrappedRoot":legacy])
guard case .complete(let snapshot)=inspectCapturedInstallation(original)else{fatalError()}
let candidate=try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:.init(signing:signer.publicKey.x963Representation,kem:kem.publicKey.x963Representation),verificationChallenge:challenge)
let bindings=freshRoles.map{InstallationRowBinding(row:$0,original:.init(service:"aux.synthetic.old",account:"aux.synthetic.old."+$0,accessGroup:"TEST.aux.synthetic"),target:.init(service:"aux.synthetic.v2",account:"aux.synthetic.v2."+$0,accessGroup:"TEST.aux.synthetic"))}
let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
let bindingHash=SHA256.hash(data:try encoder.encode(bindings)).map{String(format:"%02x",$0)}.joined()
let reviewed=try ReviewedInstallationSelectorBindings(reviewId:UUID().uuidString,bindings:bindings,expectedReviewSha256:bindingHash)
var migration=try AdditiveInstallationTransaction.prepare(candidate:candidate,transactionId:UUID().uuidString,bindings:bindings,originals:original,targets:oldCaptures([:]))
let migrationInitial=migration
let storageRoot=CommandLine.arguments[1]
let diskStore=try PrivateInstallationJournalStore(canonicalDisposableRoot:storageRoot,transactionId:migration.transactionId)
_ = try diskStore.commit(migration,expectedHead:nil)
var target=[String:Data]()
for role in freshRoles {
    migration=try AdditiveInstallationTransaction.intendNext(migration,checkpoint:migration.checkpoint(),originals:original,targets:oldCaptures(target))
    _ = try diskStore.commit(migration,expectedHead:diskStore.loadCurrent()!.sha256)
    let request=try AdditiveInstallationTransaction.addRequest(migration,checkpoint:migration.checkpoint(),candidate:candidate,originals:original,targets:oldCaptures(target))
    target[role]=request.payload
    migration=try AdditiveInstallationTransaction.capturedAddStatus(migration,checkpoint:migration.checkpoint(),status:0)
    _ = try diskStore.commit(migration,expectedHead:diskStore.loadCurrent()!.sha256)
    migration=try AdditiveInstallationTransaction.reconcile(migration,checkpoint:migration.checkpoint(),originals:original,targets:oldCaptures(target))
    _ = try diskStore.commit(migration,expectedHead:diskStore.loadCurrent()!.sha256)
}
func storedMigration(_ j:AdditiveInstallationJournal)throws->StoredInstallationCheckpoint{.init(journal:j,sha256:try j.checkpoint().journalSha256)}
let migrated=try CapturedTerminalCommandContext.existing(checkpoint:storedMigration(migration),review:reviewed,candidate:candidate,originals:original,targets:oldCaptures(target))
check(try response(migrated.core,"dk-unwrap")["dk"] as? String==root.base64EncodedString())
check(try response(migrated.core,"get-public-keys")["sig"] as? String==signer.publicKey.x963Representation.base64EncodedString())
check(migrated.evidence.selectorBindingsSha256==bindingHash && !migrated.evidence.writerAdmissionVerified)
fails{_ = try CapturedTerminalCommandContext.existing(checkpoint:storedMigration(migrationInitial),review:reviewed,candidate:candidate,originals:original,targets:oldCaptures(target))}
fails{_ = try CapturedTerminalCommandContext.existing(checkpoint:storedMigration(migration),review:reviewed,candidate:candidate,originals:oldCaptures([:]),targets:oldCaptures(target))}
var otherBindings=bindings;otherBindings[0]=InstallationRowBinding(row:"metadata",original:bindings[0].original,target:.init(service:"aux.synthetic.other",account:"aux.synthetic.other.meta",accessGroup:"TEST.aux.synthetic"))
let otherHash=SHA256.hash(data:try encoder.encode(otherBindings)).map{String(format:"%02x",$0)}.joined()
let otherReview=try ReviewedInstallationSelectorBindings(reviewId:UUID().uuidString,bindings:otherBindings,expectedReviewSha256:otherHash)
fails{_ = try CapturedTerminalCommandContext.existing(checkpoint:storedMigration(migration),review:otherReview,candidate:candidate,originals:original,targets:oldCaptures(target))}
let differentlyWrapped=try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:.init(signing:signer.publicKey.x963Representation,kem:kem.publicKey.x963Representation),verificationChallenge:challenge)
fails{_ = try CapturedTerminalCommandContext.existing(checkpoint:storedMigration(migration),review:reviewed,candidate:differentlyWrapped,originals:original,targets:oldCaptures(target))}

// Actual descriptor selection journal, independently retained from authority rows.
let previous=InstallationSelectionGeneration(generationId:UUID().uuidString,stateIdentityVersion:1,contentManifestSha256:String(repeating:"a",count:64),installationCandidateSha256:String(repeating:"b",count:64))
let successor=InstallationSelectionGeneration(generationId:UUID().uuidString,stateIdentityVersion:2,contentManifestSha256:String(repeating:"c",count:64),installationCandidateSha256:migration.candidateSha256)
let preparation=try InstallationSelectionPreparation.existing(previous:previous,candidate:successor,checkpoint:diskStore.loadCurrent()!,terminal:migrated)
var selection=try diskStore.prepareSelection(preparation)
check(selection.record.phase == .prepared && !selection.state2LaunchAuthorized && !selection.writerAdmissionVerified && !selection.authorityProvenanceVerified)
fails{_ = try diskStore.prepareSelection(preparation)}
fails{_ = try diskStore.beginSelection(expectedHead:String(repeating:"0",count:64),terminal:migrated)}
fails{_ = try diskStore.beginSelection(expectedHead:selection.sha256,terminal:freshContext)}
let initialSelectionHash=selection.sha256
selection=try diskStore.beginSelection(expectedHead:selection.sha256,terminal:migrated)
check(selection.record.phase == .selectIntent)
// Restart before pointer publication cannot be readmitted from intent alone.
let restart=try PrivateInstallationJournalStore(canonicalDisposableRoot:storageRoot,transactionId:migration.transactionId)
check(try restart.loadSelection().record.phase == .selectIntent)
fails{_ = try restart.finishSelectionIntent(expectedHead:selection.sha256,terminal:migrated)}
fails{try restart.publishSelectionIntent(expectedHead:selection.sha256,terminal:nil)}
try restart.publishSelectionIntent(expectedHead:selection.sha256,terminal:migrated)
// Crash after the actual pointer rename, before terminal journal publication.
let restartAgain=try PrivateInstallationJournalStore(canonicalDisposableRoot:storageRoot,transactionId:migration.transactionId)
check(try restartAgain.loadSelection().record.phase == .selectIntent)
try restartAgain.publishSelectionIntent(expectedHead:selection.sha256,terminal:migrated) // exact idempotency
selection=try restartAgain.finishSelectionIntent(expectedHead:selection.sha256,terminal:migrated)
check(selection.record.phase == .selected && !selection.state2LaunchAuthorized)
fails{_ = try diskStore.beginSelection(expectedHead:initialSelectionHash,terminal:migrated)}
selection=try restartAgain.beginSelectionRollback(expectedHead:selection.sha256)
check(selection.record.phase == .rollbackIntent)
try restartAgain.publishSelectionIntent(expectedHead:selection.sha256,terminal:nil)
selection=try diskStore.finishSelectionIntent(expectedHead:selection.sha256,terminal:nil)
check(selection.record.phase == .rolledBack && selection.record.previous==previous)
fails{_ = try diskStore.beginSelection(expectedHead:selection.sha256,terminal:migrated)}
let directory=storageRoot+"/.aux-installation-journal-"+migration.transactionId.lowercased()
let pointer=try Data(contentsOf:URL(fileURLWithPath:directory+"/SELECTION.json"))
check(try pointer == selectionEncode(previous))
check(try diskStore.loadCurrent()!.journal.originalHashes==candidate.originalRowHashes)
// Corrupt pointer is not overwritten/adopted. A blocked journal is permanent.
let pointerHandle=try FileHandle(forWritingTo:URL(fileURLWithPath:directory+"/SELECTION.json"))
try pointerHandle.truncate(atOffset:0);try pointerHandle.write(contentsOf:Data("unknown selection".utf8));try pointerHandle.synchronize();try pointerHandle.close()
fails{_ = try diskStore.loadSelection()}
let journalFiles=try FileManager.default.contentsOfDirectory(atPath:directory)
check(journalFiles.filter{$0.hasPrefix("selection-revision-")}.count==6)
check(try Data(contentsOf:URL(fileURLWithPath:directory+"/SELECTION.json"))==Data("unknown selection".utf8))
fails{_ = try diskStore.beginSelectionRollback(expectedHead:selection.sha256)}
// Even a later favorable pointer capture cannot reopen a blocked journal.
let repairedHandle=try FileHandle(forWritingTo:URL(fileURLWithPath:directory+"/SELECTION.json"))
try repairedHandle.truncate(atOffset:0);try repairedHandle.write(contentsOf:selectionEncode(previous));try repairedHandle.synchronize();try repairedHandle.close()
let blocked=try diskStore.loadSelection();check(blocked.record.phase == .blocked)
fails{_ = try diskStore.beginSelectionRollback(expectedHead:blocked.sha256)}
fails{try diskStore.publishSelectionIntent(expectedHead:blocked.sha256,terminal:migrated)}
// The immutable initial descriptor record and ALL authority revisions survive.
check(journalFiles.contains{$0.contains(initialSelectionHash)} && journalFiles.contains{$0.hasPrefix("revision-0000000-")})
print("\(checks) terminal+durable selection checks; real private FS, software fixture only; no Security or state2 activation")
