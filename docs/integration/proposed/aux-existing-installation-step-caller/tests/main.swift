// In-memory Security captures + REAL disposable journal. No Security calls.
let fixture=try JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))) as! [String:String]
func bytes(_ key:String)->Data{Data(base64Encoded:fixture[key]!)!}
let originals=CapturedInstallationRows(metadata:.data(bytes("metadata")),signing:.data(bytes("signing")),kem:.data(bytes("kem")),wrappedRoot:.data(bytes("wrapped")))
guard case .complete(let snapshot)=inspectCapturedInstallation(originals)else{preconditionFailure()}
let candidate=try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:.init(signing:bytes("signingPublic"),kem:bytes("kemPublic")),verificationChallenge:bytes("syntheticChallenge"))
let roles=["metadata","signing","kem","wrappedRoot"],bindings=roles.map{InstallationRowBinding(row:$0,original:.init(service:"aux.synthetic.original.install",account:"aux.synthetic.original."+$0,accessGroup:"TEST.synthetic.aux"),target:.init(service:"aux.synthetic.target.install",account:"aux.synthetic.target."+$0,accessGroup:"TEST.synthetic.aux"))}
let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
let digest=SHA256.hash(data:try encoder.encode(bindings)).map{String(format:"%02x",$0)}.joined()
let review=try ReviewedInstallationSelectorBindings(reviewId:"8A29FDA3-F730-47C2-98AE-77EE6458871B",bindings:bindings,expectedReviewSha256:digest)
let id="D1CCAAE0-661B-45C5-AE07-10D6F518233C",root=CommandLine.arguments[2]
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
// A new caller reloads the same durable intent and observes the matching row.
let resumed=try ExistingInstallationMigrationStepCaller(candidate:candidate,review:review,bindings:bindings,store:crashStore,security:crashSecurity,readbackChallenge:bytes("syntheticChallenge"))
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
