import Foundation
import Darwin
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
let bytes=try record.encoded();check(try NativeFreshBootstrapJournal.decode(bytes)==record)
check(!String(decoding:bytes,as:UTF8.self).contains("synthetic-secret-never-written"))
var object=try JSONSerialization.jsonObject(with:bytes) as! [String:Any]
object["newScopeReviewId"]=transaction
rejects{_ = try NativeFreshBootstrapJournal.decode(JSONSerialization.data(withJSONObject:object))}
object.removeValue(forKey:"newScopeReviewId");object["format"]="aux.install.fresh.journal.v1"
rejects{_ = try NativeFreshBootstrapJournal.decode(JSONSerialization.data(withJSONObject:object))}
var template=Array("/private/tmp/aux-native-fresh-journal.XXXXXX".utf8CString)
guard let raw=mkdtemp(&template)else{fatalError("mkdtemp")}
let root=String(cString:raw)
defer{try? FileManager.default.removeItem(atPath:root)}
let store=try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot:root,journal:record)
check(try store.load()==nil)
let stored=try store.publish();check(stored.sha256==nativeBootstrapHash(bytes))
let recreated=try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot:root,journal:record)
check(try recreated.load()?.journal==record)
check(try recreated.publish().sha256==stored.sha256)
let path=root+"/.aux-native-fresh-initial-journal-v2-"+transaction.lowercased()+"/initial-journal.json"
check(try Data(contentsOf:URL(fileURLWithPath:path))==bytes)
check(chmod(path,0o640)==0)
rejects{_ = try recreated.load()}
check(chmod(path,0o600)==0)
try Data("partial".utf8).write(to:URL(fileURLWithPath:path))
rejects{_ = try recreated.publish()}
check(try Data(contentsOf:URL(fileURLWithPath:path))==Data("partial".utf8))
print("PASS:\(checks) native v2 nonsecret record/disposable-FD cases; no factory/probe/secure-stage execution")
