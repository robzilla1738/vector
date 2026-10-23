import Foundation
import Darwin

enum AuxNativeFreshTargetRead {case absent,bytes(Data),unavailable(Int32),invalid}
enum AuxNativeFreshTargetAddStatus {case added,duplicate,failed(Int32)}
struct CapturedUnknown:Error{}
var checks=0
func check(_ yes:Bool){precondition(yes);checks += 1}
func rejects(_ body:()throws->Void){do{try body();fatalError("unexpected accept")}catch{checks += 1}}
let scope=String(repeating:"a",count:64),transaction="12345678-1234-4234-8234-123456789ABC",group=AuxFreshBootstrapIdentity.team+".dev.aux.fixture"
let hashes=Dictionary(uniqueKeysWithValues:nativeFreshBootstrapRoles.map{($0,nativeBootstrapHash(Data(("synthetic-"+$0).utf8)))})
let descriptor=["scheme":"p256_v1","sig_pub":Data([4,1]).base64EncodedString(),"kem_pub":Data([4,2]).base64EncodedString()]
let candidate=nativeBootstrapHash(try JSONSerialization.data(withJSONObject:["format":"aux.install.fresh.cohort.v1","targets":hashes,"public":descriptor],options:[.sortedKeys,.withoutEscapingSlashes]))
let service="aux."+scope+".installation.v2"
let bindings=zip(nativeFreshBootstrapRoles,["meta","sig","kem","dk"]).map{NativeFreshTargetBinding(row:$0.0,target:.init(service:service,account:service+"."+$0.1,accessGroup:group))}
let record=NativeFreshBootstrapJournal(format:"aux.install.native-fresh.initial-journal.v2",reservationTransactionId:transaction,reservationSha256:String(repeating:"b",count:64),policySha256:String(repeating:"c",count:64),scope:scope,role:"daemon",accessGroup:group,targetBindings:bindings,stageSelector:.init(service:"aux."+scope+".install.secure-stage.v1",account:"aux."+scope+".fresh."+transaction.lowercased(),accessGroup:group),initialObservedAbsentRoles:nativeFreshBootstrapRoles+["secureStage"],candidateSha256:candidate,publicDescriptor:descriptor,targetHashes:hashes,stagePayloadSha256:nativeBootstrapHash(Data("synthetic-secret-never-written".utf8)))

func temporaryRoot()->String {var template=Array("/private/tmp/aux-native-targets.XXXXXX".utf8CString);guard let raw=mkdtemp(&template)else{fatalError("mkdtemp")};return String(cString:raw)}
let root=temporaryRoot();defer{try? FileManager.default.removeItem(atPath:root)}
let payloads=Dictionary(uniqueKeysWithValues:nativeFreshBootstrapRoles.map{($0,Data(("synthetic-"+$0).utf8))})
var rows=[String:Data](),adds=0,tickets=[AuxNativeFreshTargetWriteIntent]()
NativeFreshTargetFixtureEffects.capture={Dictionary(uniqueKeysWithValues:nativeFreshBootstrapRoles.map{($0,rows[$0].map{.bytes($0)} ?? .absent)})}
var driver=try AuxNativeFreshTargetCoordinator.capturedFixture(root:root,initial:record)
NativeFreshTargetFixtureEffects.add={ticket in
    tickets.append(ticket)
    guard case .unresolved=try driver.advanceOne()else{fatalError("reentrant advance entered")};checks += 1
    try ticket.consumeOnceForNativeBoundary();adds += 1
    if ticket.row=="metadata" {rows[ticket.row]=payloads[ticket.row];throw CapturedUnknown()}
    if ticket.row=="signing" {return .duplicate} // Explicit non-success + absent remains unresolved.
    rows[ticket.row]=payloads[ticket.row];return .added
}
guard case .unresolved=try driver.advanceOne()else{fatalError("unknown Add did not retain intent")};checks += 1
check(adds==1)
driver=try .capturedFixture(root:root,initial:record) // Genuine retained fixture context, actual loaded journal.
guard case .progressed(let observed)=try driver.advanceOne()else{fatalError("matching interrupted Add did not advance")}
check(observed.journal.verified==["metadata"] && adds==1)
guard case .unresolved=try driver.advanceOne()else{fatalError("duplicate did not remain observation-only")};checks += 1
check(adds==2)
driver=try .capturedFixture(root:root,initial:record)
guard case .unresolved=try driver.advanceOne()else{fatalError("absent loadedintent replayed")};checks += 1
check(adds==2)
rows["signing"]=payloads["signing"]
guard case .progressed=try driver.advanceOne()else{fatalError("matching non-success intent not reconciled")};checks += 1
check(adds==2)
for _ in 0..<2 {guard case .progressed=try driver.advanceOne()else{fatalError("next exact target not verified")};checks += 1}
check(adds==4)
guard case .fixtureReadyCheckpoint=try driver.advanceOne()else{fatalError("four verified rows not ready")};checks += 1
for ticket in tickets{rejects{try ticket.consumeOnceForNativeBoundary()}}
rows["kem"]=Data("conflict".utf8)
guard case .blocked(let blocked)=try driver.advanceOne()else{fatalError("ready conflict not durably blocked")}
check(blocked.journal.phase == .blocked)
driver=try .capturedFixture(root:root,initial:record)
guard case .blocked=try driver.advanceOne()else{fatalError("blocked journal resumed")};checks += 1
check(adds==4)

// A ticket must re-read exact CURRENT durable HEAD, not just trust its SHA fields.
let staleRoot=temporaryRoot();defer{try? FileManager.default.removeItem(atPath:staleRoot)}
rows=[:];let staleDriver=try AuxNativeFreshTargetCoordinator.capturedFixture(root:staleRoot,initial:record)
NativeFreshTargetFixtureEffects.add={ticket in
    let actual=try PrivateNativeFreshTargetJournalStore(canonicalDisposableRoot:staleRoot,transactionId:transaction)
    let current=try actual.loadCurrent()!
    _ = try actual.commit(NativeFreshTargetTransaction.block(current.journal,"captured-head-advanced"),expectedHead:current.sha256)
    rejects{try ticket.consumeOnceForNativeBoundary()}
    throw CapturedUnknown()
}
guard case .unresolved=try staleDriver.advanceOne()else{fatalError("stale dispatch did not stay uncertain")};checks += 1
check(adds==4)
guard case .blocked=try staleDriver.advanceOne()else{fatalError("real advanced HEAD was ignored")};checks += 1

// Non-nil invalid retained FD must never fall back to a path open/mkdir.
rejects{_ = try PrivateNativeFreshTargetJournalStore(canonicalDisposableRoot:staleRoot,transactionId:"AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE",retainedRootDescriptor:-1)}
check(!FileManager.default.fileExists(atPath:staleRoot+"/.aux-native-fresh-targets-v2-aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"))
print("PASS:\(checks) actual native-v2 target coordinator/recreated-journal/current-HEAD cases; captured effects, no Security/generation")
