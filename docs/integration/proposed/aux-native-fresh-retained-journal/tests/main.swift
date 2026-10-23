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

func makeDirectory(_ parent:String,_ name:String)throws->String {
    let path=parent+"/"+name
    guard mkdir(path,0o700)==0 else{throw NativeFreshBootstrapStoreError.io(errno)}
    return path
}
func descriptor(_ path:String)throws->Int32 {
    let fd=open(path,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
    guard fd>=0 else{throw NativeFreshBootstrapStoreError.io(errno)}
    return fd
}
func isEmpty(_ path:String)throws->Bool {
    try FileManager.default.contentsOfDirectory(atPath:path).isEmpty
}
var template=Array("/private/tmp/aux-retained-journal.XXXXXX".utf8CString)
guard let raw=mkdtemp(&template)else{fatalError("mkdtemp")}
let base=String(cString:raw)
defer{try? FileManager.default.removeItem(atPath:base)}

let root=try makeDirectory(base,"owned")
let originalFD=try descriptor(root)
let store=try PrivateNativeFreshBootstrapJournalStore(
    canonicalDisposableRoot:root,journal:record,retainedRootDescriptor:originalFD)
check(close(originalFD)==0)
check(fcntl(originalFD,F_GETFD)==(-1) && errno==EBADF)
let stored=try store.publish()
check(stored.journal==record)
check(try store.load()?.sha256==stored.sha256)

let wrong=try makeDirectory(base,"wrong")
let destination=try makeDirectory(base,"destination")
let wrongFD=try descriptor(wrong)
rejects{_ = try PrivateNativeFreshBootstrapJournalStore(
    canonicalDisposableRoot:destination,journal:record,retainedRootDescriptor:wrongFD)}
check(try isEmpty(wrong))
check(try isEmpty(destination))
check(close(wrongFD)==0)
rejects{_ = try PrivateNativeFreshBootstrapJournalStore(
    canonicalDisposableRoot:destination,journal:record,retainedRootDescriptor:-1)}
check(try isEmpty(destination))

let replaced=try makeDirectory(base,"replaced")
let moved=base+"/moved"
let replacedFD=try descriptor(replaced)
check(rename(replaced,moved)==0)
check(mkdir(replaced,0o700)==0)
rejects{_ = try PrivateNativeFreshBootstrapJournalStore(
    canonicalDisposableRoot:replaced,journal:record,retainedRootDescriptor:replacedFD)}
check(try isEmpty(replaced))
check(try isEmpty(moved))
check(close(replacedFD)==0)
print("PASS:\(checks) retained-root journal FD cases; no factory, Security or authority execution")
