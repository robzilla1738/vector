// All inputs below are private temporary synthetic fixtures. SOFTWARE lane only.
let fixture=try JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))) as! [String:String]
func bytes(_ name:String)->Data { Data(base64Encoded:fixture[name]!)! }
var checks=0
func check(_ value:Bool){ precondition(value);checks += 1 }
let metadata=bytes("metadata"),signing=bytes("signing"),kem=bytes("kem"),wrapped=bytes("wrapped")
func rows(meta:CapturedInstallRead?=nil,sig:CapturedInstallRead?=nil,agreement:CapturedInstallRead?=nil,root:CapturedInstallRead?=nil)->CapturedInstallationRows {
    .init(metadata:meta ?? .data(metadata),signing:sig ?? .data(signing),kem:agreement ?? .data(kem),wrappedRoot:root ?? .data(wrapped))
}
if case .allAbsent=inspectCapturedInstallation(rows(meta:.missing,sig:.missing,agreement:.missing,root:.missing)){ checks += 1 }else{preconditionFailure()}
if case .partial(let missing)=inspectCapturedInstallation(rows(sig:.missing)){check(missing==[.signing])}else{preconditionFailure()}
if case .blocked(let failed)=inspectCapturedInstallation(rows(meta:.missing,sig:.securityFailure(-34018),agreement:.missing,root:.missing)){check(failed.count==1 && failed[0].row == .signing && failed[0].status == -34018)}else{preconditionFailure()}
if case .invalid=inspectCapturedInstallation(rows(meta:.invalidSuccessResult)){checks += 1}else{preconditionFailure()}
if case .invalid=inspectCapturedInstallation(rows(meta:.data(Data("{}".utf8)))){checks += 1}else{preconditionFailure()}
if case .invalid=inspectCapturedInstallation(rows(root:.data(Data()))){checks += 1}else{preconditionFailure()}
guard case .complete(let snapshot)=inspectCapturedInstallation(rows())else{preconditionFailure()}
let expected=ExpectedInstallationPublicKeys(signing:bytes("signingPublic"),kem:bytes("kemPublic")),challenge=bytes("syntheticChallenge")
let candidate=try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:expected,verificationChallenge:challenge)
check(candidate.metadataBytes==metadata && candidate.signingRepresentation==signing && candidate.kemRepresentation==kem)
check(candidate.signingPublicKey==expected.signing && candidate.kemPublicKey==expected.kem)
check(candidate.sameRootVerified && candidate.signingContinuityVerified && !candidate.persistencePerformed && !candidate.authorityProvenanceVerified && !candidate.commitAuthorized)
check(Set(candidate.publicCommandReply.keys)==["scheme","sig","kem"] && Set(candidate.initializationPublicReply.keys)==["scheme","sig_pub","kem_pub"])
check(candidate.publicCommandReply["sig"]==candidate.initializationPublicReply["sig_pub"] && candidate.publicCommandReply["kem"]==candidate.initializationPublicReply["kem_pub"])
func expectFailure(_ body:()throws->Void){do{try body();preconditionFailure()}catch{checks += 1}}
expectFailure{_ = try prepareSoftwareP256Installation(snapshot,channel:.canary,expected:expected,verificationChallenge:challenge)}
expectFailure{_ = try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:.init(signing:Data(repeating:0,count:65),kem:expected.kem),verificationChallenge:challenge)}
expectFailure{_ = try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:.init(signing:expected.signing,kem:Data(repeating:0,count:65)),verificationChallenge:challenge)}
expectFailure{_ = try prepareSoftwareP256Installation(snapshot,channel:.normal,expected:expected,verificationChallenge:Data())}
let enclaveMeta=Data(#"{"scheme":"p256_v1","key_storage":"secure_enclave"}"#.utf8)
guard case .complete(let enclaveSnapshot)=inspectCapturedInstallation(rows(meta:.data(enclaveMeta)))else{preconditionFailure()}
expectFailure{_ = try prepareSoftwareP256Installation(enclaveSnapshot,channel:.normal,expected:expected,verificationChallenge:challenge)}
guard case .complete(let canarySnapshot)=inspectCapturedInstallation(rows(root:.data(bytes("canaryWrapped"))))else{preconditionFailure()}
let canaryCandidate=try prepareSoftwareP256Installation(canarySnapshot,channel:.canary,expected:expected,verificationChallenge:challenge)
check(canaryCandidate.sourceChannel=="canary")
var output:[String:Any]=["checks":checks,"normalWrapper":candidate.wrappedRootV2.base64EncodedString(),"canaryWrapper":canaryCandidate.wrappedRootV2.base64EncodedString(),"originalHashes":candidate.originalRowHashes,"enclaveExecuted":false,"pqExecuted":false,"keychainExecuted":false,"persistencePerformed":false]
print(String(data:try JSONSerialization.data(withJSONObject:output,options:[.sortedKeys]),encoding:.utf8)!)
