import Foundation
import Darwin
var assertions=0
func require(_ value:Bool,_ message:String){precondition(value,message);assertions += 1}
func rejects(_ message:String,_ body:()throws->Void){do{try body();fatalError(message)}catch{assertions += 1}}
let fixture=try JSONSerialization.jsonObject(with:FileHandle.standardInput.readDataToEndOfFile()) as! [String:String]
func bytes(_ name:String)->Data{Data(base64Encoded:fixture[name]!)!}
let root=bytes("root"),source=bytes("original"),target=bytes("prepared"),csk=bytes("csk")
let owner=CapturedCskOwner(accountId:7,boundUserId:"synthetic-user")
let binding=try CapturedHistoricalAuxCredentialBinding.reviewedDisposable(logicalKey:"aux.csk_7",suffixVersion:.originalLogicalLabelsMappedInsideAux)
let prepared=try PreparedCapturedCskV2.authenticate(binding:binding,accountId:7,expectedOwner:owner,source:source,prepared:target,capturedRoot:root)
require(prepared.sourceHash != prepared.targetHash && prepared.sourceBytes==source.count && prepared.targetBytes==target.count,"different exact bound payloads")
rejects("valid new envelope with different CSK"){_ = try PreparedCapturedCskV2.authenticate(binding:binding,accountId:7,expectedOwner:owner,source:source,prepared:bytes("differentCsk"),capturedRoot:root)}
rejects("wrong root"){_ = try PreparedCapturedCskV2.authenticate(binding:binding,accountId:7,expectedOwner:owner,source:source,prepared:target,capturedRoot:Data(repeating:8,count:32))}
rejects("wrong owner"){_ = try PreparedCapturedCskV2.authenticate(binding:binding,accountId:7,expectedOwner:.init(accountId:7,boundUserId:"other"),source:source,prepared:target,capturedRoot:root)}
var changed=try JSONSerialization.jsonObject(with:target) as! [String:Any];changed["syncGeneration"]=12
rejects("generation drift"){_ = try PreparedCapturedCskV2.authenticate(binding:binding,accountId:7,expectedOwner:owner,source:source,prepared:JSONSerialization.data(withJSONObject:changed),capturedRoot:root)}
rejects("account binding"){_ = try PreparedCapturedCskV2.authenticate(binding:binding,accountId:8,expectedOwner:owner,source:source,prepared:target,capturedRoot:root)}
changed=try JSONSerialization.jsonObject(with:target) as! [String:Any];changed["accountId"]=true
rejects("boolean account"){_ = try PreparedCapturedCskV2.authenticate(binding:binding,accountId:7,expectedOwner:owner,source:source,prepared:JSONSerialization.data(withJSONObject:changed),capturedRoot:root)}
let duplicate=Data(String(decoding:target,as:UTF8.self).replacingOccurrences(of:"\"schemaVersion\":1",with:"\"schemaVersion\":1,\"schemaVersion\":1").utf8)
rejects("duplicate JSON"){_ = try PreparedCapturedCskV2.authenticate(binding:binding,accountId:7,expectedOwner:owner,source:source,prepared:duplicate,capturedRoot:root)}
let temp=FileManager.default.temporaryDirectory.appendingPathComponent("aux-csk-handoff-"+UUID().uuidString)
try FileManager.default.createDirectory(at:temp,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer{try? FileManager.default.removeItem(at:temp)}
let resolved=realpath(temp.path,nil)!,directory=String(cString:resolved);free(resolved)
final class Boundary:AuxCopyOnlyCredentialBoundary {
    var source:Data;var target:Data?;var adds=0;var throwAfterAdd=false;var throwBeforeAdd=false;var duplicate=false;var reenter:(()->Void)?
    init(_ source:Data){self.source=source}
    func readSource(_ selector:AuxSecureStoreSelector)->CapturedAuxCredentialRow{.bytes(source)}
    func readTarget(_ selector:AuxSecureStoreSelector)->CapturedAuxCredentialRow{target.map{.bytes($0)} ?? .missing}
    func addTarget(_ selector:AuxSecureStoreSelector,bytes:Data)throws->CapturedAuxCredentialAddStatus {
        adds += 1;reenter?();if throwBeforeAdd{throw CapturedCskHandoffError.phase};if duplicate{return .duplicate};target=bytes;if throwAfterAdd{throw CapturedCskHandoffError.phase};return .added
    }
}
func begin(_ b:Boundary)throws->DurableCapturedCskHandoff{try .begin(canonicalDisposableRoot:directory,binding:binding,accountId:7,expectedOwner:owner,capturedRoot:root,preparedBytes:target,boundary:b)}
func resume(_ id:String,_ b:Boundary)throws->DurableCapturedCskHandoff{try .resume(canonicalDisposableRoot:directory,transactionId:id,binding:binding,accountId:7,expectedOwner:owner,capturedRoot:root,boundary:b)}
let normal=Boundary(source),normalRun=try begin(normal)
normal.reenter={rejects("reentrant step"){_ = try normalRun.performOneStep()}}
guard case .verified(let verified)=try normalRun.performOneStep()else{fatalError("normal verified")}
normal.reenter=nil
require(normal.adds==1 && normal.target==target && normal.source==source,"transformed Add, source unchanged")
let store=try PrivateCskHandoffJournalStore(canonicalDisposableRoot:directory,transactionId:normalRun.transactionId)
require(try store.loadCurrent()?.sha256==verified.sha256,"durable hash readback")
rejects("stale head"){_ = try store.commit(verified.journal,expectedHead:String(repeating:"0",count:64))}
guard case .verified=try resume(normalRun.transactionId,normal).performOneStep()else{fatalError("verified resume")}
require(normal.adds==1,"verified no replay")
let uncertain=Boundary(source);uncertain.throwAfterAdd=true
let interrupted=try begin(uncertain)
guard case .unresolved(let intent)=try interrupted.performOneStep()else{fatalError("throw after Add")}
require(intent.journal.phase == .intent && uncertain.adds==1,"durable unresolved intent")
rejects("reconstructed preparation cannot reuse old intent"){_ = try prepared.addCapturedTarget(after:intent,using:uncertain)}
guard case .verified=try resume(interrupted.transactionId,uncertain).performOneStep()else{fatalError("observed matching Add")}
require(uncertain.adds==1,"restart after uncertain Add never replays")
let absent=Boundary(source);absent.throwBeforeAdd=true;let lost=try begin(absent)
guard case .unresolved=try lost.performOneStep()else{fatalError("unknown absent")}
guard case .unresolved=try resume(lost.transactionId,absent).performOneStep()else{fatalError("absent remains unresolved")}
require(absent.adds==1,"absent unknown no replay")
let draftBoundary=Boundary(source),draft=try begin(draftBoundary)
guard case .unresolved(let draftCheckpoint)=try resume(draft.transactionId,draftBoundary).performOneStep()else{fatalError("draft restart")}
require(draftCheckpoint.journal.phase == .draft && draftBoundary.adds==0,"restored draft cannot Add")
let conflict=Boundary(source),conflictRun=try begin(conflict);conflict.target=Data([1])
guard case .blocked=try conflictRun.performOneStep()else{fatalError("target appeared")}
require(conflict.adds==0,"conflict preserves target")
let duplicateBoundary=Boundary(source);duplicateBoundary.duplicate=true;let duplicateRun=try begin(duplicateBoundary)
guard case .blocked=try duplicateRun.performOneStep()else{fatalError("explicit duplicate")}
guard case .blocked=try resume(duplicateRun.transactionId,duplicateBoundary).performOneStep()else{fatalError("blocked terminal")}
require(duplicateBoundary.adds==1,"terminal duplicate no retry")
let sourceDrift=Boundary(source),sourceRun=try begin(sourceDrift);sourceDrift.source=Data([0])
guard case .blocked=try sourceRun.performOneStep()else{fatalError("source drift")}
require(sourceDrift.adds==0,"source drift no Add")
// Only hash/phase metadata reaches real filesystem; test synthetic input arrives
// over stdin and never has a fixture file or secret journal representation.
for dir in try FileManager.default.contentsOfDirectory(atPath:directory){
 for file in try FileManager.default.contentsOfDirectory(atPath:directory+"/"+dir){
  let data=try Data(contentsOf:URL(fileURLWithPath:directory+"/"+dir+"/"+file))
  require(![root,csk,source,target].contains(where:{data.range(of:$0) != nil}),"journal contains no material/envelope")
 }
}
let head=directory+"/.aux-csk-prepared-handoff-"+draft.transactionId+"/HEAD.json"
try FileManager.default.setAttributes([.posixPermissions:0o644],ofItemAtPath:head)
rejects("nonprivate HEAD"){_ = try resume(draft.transactionId,draftBoundary).performOneStep()}
print("CSK prepared handoff passed \(assertions) focused assertions; JS→CryptoKit authentication and private-FD crash recovery, captured boundary only")
