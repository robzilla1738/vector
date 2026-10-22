import Foundation
import Darwin
func require(_ value:Bool,_ message:String){precondition(value,message)}
let temp=FileManager.default.temporaryDirectory.appendingPathComponent("aux-credential-durable-"+UUID().uuidString)
try FileManager.default.createDirectory(at:temp,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer{try? FileManager.default.removeItem(at:temp)}
let resolved=realpath(temp.path,nil)!
let root=String(cString:resolved);free(resolved)
let binding=try CapturedHistoricalAuxCredentialBinding.reviewedDisposable(logicalKey:"aux.csk_7",suffixVersion:.auxLogicalLabelsMappedInsideAux)
final class Boundary:AuxCopyOnlyCredentialBoundary {
    var source=Data([0xff,0,0x80,0x13]);var target:Data?;var adds=0;var uncertain=false
    func readSource(_ source:AuxSecureStoreSelector)->CapturedAuxCredentialRow{.bytes(self.source)}
    func readTarget(_ target:AuxSecureStoreSelector)->CapturedAuxCredentialRow{self.target.map{.bytes($0)} ?? .missing}
    func addTarget(_ target:AuxSecureStoreSelector,bytes:Data)throws->CapturedAuxCredentialAddStatus{adds += 1;self.target=bytes;if uncertain{throw AuxCredentialCopyError.capture};return .added}
}
let normal=Boundary(),copy=try DurableCapturedAuxCredentialCopy.begin(canonicalDisposableRoot:root,binding:binding,boundary:normal)
guard case .verified(let verified)=try copy.performOneStep()else{fatalError("normal copy")}
require(normal.adds==1 && normal.target==normal.source,"opaque exact payload")
let store=try PrivateAuxCredentialCopyJournalStore(canonicalDisposableRoot:root,transactionId:copy.transactionId)
require(try store.loadCurrent()?.sha256==verified.sha256,"durable verified readback")
do{_ = try store.commit(verified.journal,expectedHead:String(repeating:"0",count:64));fatalError("stale CAS accepted")}catch AuxCredentialCopyStoreError.staleHead{}
let uncertain=Boundary();uncertain.uncertain=true
let interrupted=try DurableCapturedAuxCredentialCopy.begin(canonicalDisposableRoot:root,binding:binding,boundary:uncertain)
guard case .unresolved(let intent)=try interrupted.performOneStep()else{fatalError("uncertain Add")}
require(intent.journal.phase == .intent && uncertain.adds==1,"durable intent retained")
let reopened=try DurableCapturedAuxCredentialCopy.resume(canonicalDisposableRoot:root,transactionId:interrupted.transactionId,binding:binding,boundary:uncertain)
guard case .verified=try reopened.performOneStep()else{fatalError("readback recovery")}
require(uncertain.adds==1,"no Add replay")
let abandoned=Boundary(),draft=try DurableCapturedAuxCredentialCopy.begin(canonicalDisposableRoot:root,binding:binding,boundary:abandoned)
let restoredDraft=try DurableCapturedAuxCredentialCopy.resume(canonicalDisposableRoot:root,transactionId:draft.transactionId,binding:binding,boundary:abandoned)
guard case .unresolved(let unchanged)=try restoredDraft.performOneStep()else{fatalError("restored draft")}
require(unchanged.journal.phase == .draft && abandoned.adds==0,"restart draft observation only")
let dirs=try FileManager.default.contentsOfDirectory(atPath:root)
var revisions=0
for dir in dirs {
 for name in try FileManager.default.contentsOfDirectory(atPath:root+"/"+dir) {
  let bytes=try Data(contentsOf:URL(fileURLWithPath:root+"/"+dir+"/"+name))
  require(bytes.range(of:normal.source)==nil,"secret never persisted")
  if name.hasPrefix("revision-"){revisions += 1}
 }
}
require(revisions==7,"all original and partial revisions retained")
let path=root+"/.aux-credential-copy-journal-"+draft.transactionId+"/HEAD.json"
try FileManager.default.setAttributes([.posixPermissions:0o644],ofItemAtPath:path)
do{_ = try restoredDraft.performOneStep();fatalError("unsafe mode accepted")}catch AuxCredentialCopyStoreError.unsafeMetadata{}
require(FileManager.default.fileExists(atPath:path),"unsafe evidence retained")
print("credential durable recovery passed: normal, uncertain Add restart, restored draft, stale CAS, private modes, retained history; captured boundary only")
