import Foundation
import Darwin
import Security
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

func scenario(storedDespiteError:Bool)throws {
    var template=Array("/private/tmp/aux-stage-reconcile.XXXXXX".utf8CString)
    guard let raw=mkdtemp(&template)else{fatalError("mkdtemp")}
    let root=String(cString:raw);defer{try? FileManager.default.removeItem(atPath:root)}
    let payload=Data("synthetic-secret-never-written".utf8)
    let coordinator=try AuxNativeFreshStageCoordinator.capturedFixture(root:root,record:record,payload:payload)
    var stage:Data?,adds=0,reads=0,events=[String]()
    NativeFreshStageFixtureEffects.revalidate={events.append("revalidate")}
    NativeFreshStageFixtureEffects.read={selector in
        reads += 1;events.append("read:"+selector.account)
        if selector==record.stageSelector,let stage{return .bytes(stage)}
        return .absent
    }
    NativeFreshStageFixtureEffects.add={selector,bytes in
        adds += 1;events.append("add")
        check(selector==record.stageSelector && bytes==payload)
        if storedDespiteError{stage=bytes}
        return -2070 // Captured unknown/non-success after actual storage may have happened.
    }
    guard case .unresolved=try coordinator.submitStageOnce()else{fatalError("non-success was not unresolved")};checks += 1
    check(adds==1 && reads==5)
    check(Array(events.suffix(2))==["revalidate","add"])
    if storedDespiteError {
        guard case .staged(let terminal)=try coordinator.observeStageWithoutReplay()else{fatalError("matching stage not reconciled")}
        let recordHash=nativeBootstrapHash(try record.encoded())
        check(terminal.journal==record && terminal.durableJournalSha256==recordHash)
    } else {
        guard case .unresolved=try coordinator.observeStageWithoutReplay()else{fatalError("absent was replayed/accepted")};checks += 1
        guard case .unresolved=try coordinator.observeStageWithoutReplay()else{fatalError("second absent was replayed/accepted")};checks += 1
        stage=Data("conflicting".utf8)
        guard case .blocked=try coordinator.observeStageWithoutReplay()else{fatalError("conflict accepted")};checks += 1
        stage=payload
        guard case .blocked=try coordinator.observeStageWithoutReplay()else{fatalError("blocked conflict resumed")};checks += 1
    }
    rejects{_ = try coordinator.submitStageOnce()}
    check(adds==1)
    let journalPath=root+"/.aux-native-fresh-initial-journal-v2-"+transaction.lowercased()+"/initial-journal.json"
    check(!(try String(contentsOfFile:journalPath,encoding:.utf8)).contains(String(decoding:payload,as:UTF8.self)))
}
try scenario(storedDespiteError:true)
try scenario(storedDespiteError:false)
print("PASS:\(checks) actual coordinator unknown-add reconciliation cases; captured effects only, no factory/Security execution")
