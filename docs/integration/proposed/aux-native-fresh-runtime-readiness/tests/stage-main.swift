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

var template=Array("/private/tmp/aux-stage-defer.XXXXXX".utf8CString)
guard let raw=mkdtemp(&template)else{fatalError("mkdtemp")}
let root=String(cString:raw);defer{try? FileManager.default.removeItem(atPath:root)}
let payload=Data("synthetic-secret-never-written".utf8)
let coordinator=try AuxNativeFreshStageCoordinator.capturedFixture(root:root,record:record,payload:payload)
var unlocked=false,adds=0,reads=0,reentered=false,stage:Data?
NativeFreshStageFixtureEffects.revalidate={}
NativeFreshStageFixtureEffects.read={selector in
 reads += 1
 if !reentered {reentered=true;rejects{_ = try coordinator.submitStageOnce()}}
 if selector==record.stageSelector,let stage{return .bytes(stage)}
 return unlocked ? .absent:.unavailable(-25308)
}
NativeFreshStageFixtureEffects.add={_,bytes in adds += 1;stage=bytes;return -2070}
guard case .deferredBeforeAdd(-25308)=try coordinator.submitStageOnce()else{fatalError("locked read consumed attempt")}
check(adds==0 && reads==5)
rejects{_ = try coordinator.observeStageWithoutReplay()}
unlocked=true
guard case .unresolved=try coordinator.submitStageOnce()else{fatalError("unknown add not retained")}
check(adds==1 && reads==10)
rejects{_ = try coordinator.submitStageOnce()}
guard case .staged=try coordinator.observeStageWithoutReplay()else{fatalError("matching unknown add not reconciled")}
check(adds==1)
print("PASS:\(checks) actual stage pre-Add deferral/reentry/unknown observation assertions; captured effects only")
