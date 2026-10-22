import Foundation
import CryptoKit
import Darwin
import Security
var assertions=0
func check(_ condition:Bool){precondition(condition);assertions += 1}
func refuses(_ body:()throws->Void){do{try body();fatalError("unexpected acceptance")}catch{assertions += 1}}
final class CapturedBoundary:FreshInstallationSecurityBoundary {
    let review:ReviewedFreshSecurityBoundary
    var targets=[String:Data]();var stage:Data?;var stageAdds=0;var targetAdds=0
    var blockedLegacy=false
    init(_ review:ReviewedFreshSecurityBoundary){self.review=review}
    func captureLegacy()->CallerCapturedFreshTargets {
        .init(metadata:blockedLegacy ? .unavailable(errSecInteractionNotAllowed):.absent,signing:.absent,kem:.absent,wrappedRoot:.absent)
    }
    func captureTargets()->CallerCapturedFreshTargets {
        func row(_ role:String)->CallerCapturedFreshRead{targets[role].map{.bytes($0)} ?? .absent}
        return .init(metadata:row("metadata"),signing:row("signing"),kem:row("kem"),wrappedRoot:row("wrappedRoot"))
    }
    func captureStage()->CallerCapturedSecureStage {stage.map{.bytes($0)} ?? .absent}
    func addStage(_ request:SensitiveFreshSecureStageAdd)throws->CapturedFreshAddStatus {
        stageAdds += 1;guard stage==nil else{return .duplicate};stage=request.secretPayload;return .added
    }
    func addTarget(_ request:FreshCreateOnlyRequest)throws->CapturedFreshAddStatus {
        targetAdds += 1;guard targets[request.row]==nil else{return .duplicate};targets[request.row]=request.payload;return .added
    }
}
let raw=FileManager.default.temporaryDirectory.appendingPathComponent("aux-fresh-selected-"+UUID().uuidString).path
try FileManager.default.createDirectory(atPath:raw,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700]);defer{try? FileManager.default.removeItem(atPath:raw)}
let actual=realpath(raw,nil)!,root=String(cString:actual);free(actual)
let scope=String(repeating:"d",count:64),group="TEST.aux.synthetic"
var key=Data(repeating:0,count:32);key[31]=21;let signing=try P256.Signing.PrivateKey(rawRepresentation:key)
key[31]=22;let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:key)
let rootSecret=Data(repeating:0xA5,count:32)
let material=FreshAuthorityMaterial(kind:.softwareP256,root:rootSecret,signingPrivateRepresentation:signing.rawRepresentation,kemPrivateRepresentation:kem.rawRepresentation,signingPublicRepresentation:signing.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation)
let cohort=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(material)
let absent=CallerCapturedFreshTargets(metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent)
let asserted=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:absent)
func setup(wrongLayout:Bool=false)throws->(CapturedBoundary,PreparedFreshNativeCommandProvider) {
    let suffix=["metadata":"meta","signing":"sig","kem":"kem","wrappedRoot":"dk"]
    let service="aux."+scope+".installation.v2"
    let bindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:service,account:service+"."+suffix[$0]!+(wrongLayout ? ".wrong":""),accessGroup:group))}
    let j=try FreshInstallationTransaction.prepare(candidate:cohort,transactionId:UUID().uuidString,review:asserted,bindings:bindings,captured:absent)
    let legacy=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".old",account:"aux."+scope+".old."+$0,accessGroup:group))}
    let stage=ReviewedFreshSecureStageSelector(service:"aux."+scope+".install.secure-stage.v1",account:"aux."+scope+".fresh."+j.transactionId.lowercased(),accessGroup:group)
    let review=try ReviewedFreshSecurityBoundary(journal:j,legacyBindings:legacy,stage:stage,expectedReviewSha256:ReviewedFreshSecurityBoundary.digest(journal:j,legacyBindings:legacy,stage:stage))
    let b=CapturedBoundary(review)
    return (b,PreparedFreshNativeCommandProvider(canonicalDisposableRoot:root,capturedBoundary:b))
}
let (wrongBoundary,wrongProvider)=try setup(wrongLayout:true)
refuses{_ = try wrongProvider.beginCallerReviewedInitialization(cohort:cohort,review:asserted)}
check(wrongBoundary.stageAdds==0 && wrongBoundary.targetAdds==0)
let (boundary,provider)=try setup()
refuses{_ = try provider.recoverSelectedCommandContext()}
check(boundary.stageAdds==0 && boundary.targetAdds==0)
guard case .progressed=try provider.beginCallerReviewedInitialization(cohort:cohort,review:asserted)else{fatalError("begin")}
for _ in 0..<4 {guard case .progressed=try provider.advancePreparedInitialization()else{fatalError("target")}}
let tx=boundary.review.transactionId
let store=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:tx)
check(try store.loadFreshSelection()==nil)
guard case .selected(let selected)=try provider.advancePreparedInitialization()else{fatalError("selection")}
let reply=try strictEnvelopeObject(Data(selected.initializationReply.utf8))
check(Set(reply.keys)==["scheme","sig_pub","kem_pub"])
check(reply["sig_pub"] as? String==signing.publicKey.x963Representation.base64EncodedString())
check(reply["kem_pub"] as? String==kem.publicKey.x963Representation.base64EncodedString())
check(selected.runtime.selection.generationId==tx && !selected.durableSelection.state2LaunchAuthorized && !selected.durableSelection.writerAdmissionVerified)
let rootReply=try strictEnvelopeObject(Data(selected.runtime.core.run(command:"dk-unwrap").utf8))
check(rootReply["dk"] as? String==rootSecret.base64EncodedString())
let challenge=Data("synthetic Aux fresh selected challenge".utf8)
let signatureReply=try strictEnvelopeObject(Data(selected.runtime.core.run(command:"cdp-sign",input:"{\"challenge\":\""+challenge.base64EncodedString()+"\"}").utf8))
let sig=try P256.Signing.ECDSASignature(derRepresentation:Data(base64Encoded:signatureReply["signature"] as! String)!)
check(signing.publicKey.isValidSignature(sig,for:challenge))
check(boundary.stageAdds==1 && boundary.targetAdds==4 && boundary.stage != nil)
let resumed=PreparedFreshNativeCommandProvider(canonicalDisposableRoot:root,capturedBoundary:boundary)
let recovered=try resumed.recoverSelectedCommandContext()
check(recovered.initializationReply==selected.initializationReply && recovered.durableSelection.sha256==selected.durableSelection.sha256)
check(boundary.stageAdds==1 && boundary.targetAdds==4)
// Simulate process loss after durable pointer publication but before context
// return: publish via actual store, discard terminal/provider, reconstruct.
let (crashBoundary,crashProvider)=try setup()
_ = try crashProvider.beginCallerReviewedInitialization(cohort:cohort,review:asserted)
for _ in 0..<4 {_ = try crashProvider.advancePreparedInitialization()}
let crashCoordinator=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:crashBoundary)
guard case .ready(let terminal)=try crashCoordinator.advanceOne()else{fatalError("ready")}
let crashStore=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:crashBoundary.review.transactionId)
let record=try FreshAuthoritySelection.prepare(stored:crashStore.loadCurrent()!,review:crashBoundary.review,terminal:terminal)
_ = try crashStore.publishFreshSelection(record,terminal:terminal)
let restart=PreparedFreshNativeCommandProvider(canonicalDisposableRoot:root,capturedBoundary:crashBoundary)
let again=try restart.recoverSelectedCommandContext()
check(again.runtime.selection.generationId==crashBoundary.review.transactionId && crashBoundary.stageAdds==1 && crashBoundary.targetAdds==4)
let before=try store.loadFreshSelection()!.sha256
refuses{_ = try store.publishFreshSelection(selected.durableSelection.record,terminal:terminal)}
check(try store.loadFreshSelection()!.sha256==before)
let stage=boundary.stage;boundary.stage=nil
refuses{_ = try resumed.recoverSelectedCommandContext()};boundary.stage=stage
boundary.blockedLegacy=true
refuses{_ = try resumed.recoverSelectedCommandContext()};boundary.blockedLegacy=false
let signingBytes=boundary.targets.removeValue(forKey:"signing")!
refuses{_ = try resumed.recoverSelectedCommandContext()};boundary.targets["signing"]=signingBytes
check(boundary.stageAdds==1 && boundary.targetAdds==4)
check(try store.loadFreshSelection()!.sha256==before)
let pointer=root+"/.aux-fresh-installation-journal-"+tx.lowercased()+"/FRESH-SELECTION-HEAD.json"
let bad=Data("{\"format\":\"unknown\"}".utf8)
let file=try FileHandle(forWritingTo:URL(fileURLWithPath:pointer));try file.truncate(atOffset:0);try file.write(contentsOf:bad);try file.synchronize();try file.close()
refuses{_ = try resumed.recoverSelectedCommandContext()}
check(try Data(contentsOf:URL(fileURLWithPath:pointer))==bad)
check(boundary.stageAdds==1 && boundary.targetAdds==4)
for url in FileManager.default.enumerator(at:URL(fileURLWithPath:root),includingPropertiesForKeys:nil)!.allObjects as! [URL] {
    var directory:ObjCBool=false
    if FileManager.default.fileExists(atPath:url.path,isDirectory:&directory),!directory.boolValue {
        let text=String(decoding:try Data(contentsOf:url),as:UTF8.self)
        precondition(!text.contains(rootSecret.base64EncodedString()) && !text.contains(signing.rawRepresentation.base64EncodedString()) && !text.contains(kem.rawRepresentation.base64EncodedString()) && !text.contains("\"payloads\""))
    }
}
check(true)
print("\(assertions) fresh selection/command/restart/refusal assertions; actual private filesystem + software crypto; zero Security calls; no native admission granted")
