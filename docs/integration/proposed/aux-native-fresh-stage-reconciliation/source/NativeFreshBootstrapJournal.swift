// Nonsecret native pre-generation lineage and prepared-stage binding; never v1 review semantics.
import Foundation
import CryptoKit

enum NativeFreshBootstrapError:Error {case record,binding,existing,consumed,stage}
let nativeFreshBootstrapRoles=["metadata","signing","kem","wrappedRoot"]
struct NativeFreshTargetSelector:Codable,Equatable {let service:String;let account:String;let accessGroup:String}
struct NativeFreshTargetBinding:Codable,Equatable {let row:String;let target:NativeFreshTargetSelector}
func nativeBootstrapHash(_ data:Data)->String{SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined()}
private func nativeBootstrapHashValid(_ value:String)->Bool{value.utf8.count==64 && value.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}
struct NativeFreshBootstrapJournal:Codable,Equatable {
    let format:String
    let reservationTransactionId:String
    let reservationSha256:String
    let policySha256:String
    let scope:String
    let role:String
    let accessGroup:String
    let targetBindings:[NativeFreshTargetBinding]
    let stageSelector:NativeFreshTargetSelector
    let initialObservedAbsentRoles:[String]
    let candidateSha256:String
    let publicDescriptor:[String:String]
    let targetHashes:[String:String]
    let stagePayloadSha256:String
    var transactionId:String{reservationTransactionId}
    func validate()throws {
        guard format=="aux.install.native-fresh.initial-journal.v2",UUID(uuidString:reservationTransactionId)?.uuidString==reservationTransactionId,
              [reservationSha256,policySha256,scope,candidateSha256,stagePayloadSha256].allSatisfy(nativeBootstrapHashValid),
              ["daemon","cli"].contains(role),AuxFreshBootstrapPolicyContents.validAccessGroup(accessGroup),
              initialObservedAbsentRoles==["metadata","signing","kem","wrappedRoot","secureStage"],
              targetBindings.map(\.row)==nativeFreshBootstrapRoles,Set(targetHashes.keys)==Set(nativeFreshBootstrapRoles),targetHashes.values.allSatisfy(nativeBootstrapHashValid),
              Set(publicDescriptor.keys)==["scheme","sig_pub","kem_pub"],["p256_v1","pq_v1"].contains(publicDescriptor["scheme"] ?? ""),
              ["sig_pub","kem_pub"].allSatisfy({guard let text=publicDescriptor[$0],let bytes=Data(base64Encoded:text)else{return false};return !bytes.isEmpty && bytes.count<=8192 && bytes.base64EncodedString()==text}) else{throw NativeFreshBootstrapError.record}
        let service="aux."+scope+".installation.v2",suffixes=["meta","sig","kem","dk"]
        for (index,binding) in targetBindings.enumerated(){guard binding.target==NativeFreshTargetSelector(service:service,account:service+"."+suffixes[index],accessGroup:accessGroup)else{throw NativeFreshBootstrapError.binding}}
        guard stageSelector==NativeFreshTargetSelector(service:"aux."+scope+".install.secure-stage.v1",account:"aux."+scope+".fresh."+reservationTransactionId.lowercased(),accessGroup:accessGroup)else{throw NativeFreshBootstrapError.binding}
        let candidate=try JSONSerialization.data(withJSONObject:["format":"aux.install.fresh.cohort.v1","targets":targetHashes,"public":publicDescriptor],options:[.sortedKeys,.withoutEscapingSlashes])
        guard nativeBootstrapHash(candidate)==candidateSha256 else{throw NativeFreshBootstrapError.binding}
    }
    func encoded()throws->Data{try validate();let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes];let bytes=try encoder.encode(self);guard bytes.count<=16_384 else{throw NativeFreshBootstrapError.record};return bytes}
    static func decode(_ bytes:Data)throws->Self {
        let object=try strictEnvelopeObject(bytes)
        guard Set(object.keys)==["format","reservationTransactionId","reservationSha256","policySha256","scope","role","accessGroup","targetBindings","stageSelector","initialObservedAbsentRoles","candidateSha256","publicDescriptor","targetHashes","stagePayloadSha256"],
              let bindings=object["targetBindings"] as? [[String:Any]],bindings.count==4,
              let selector=object["stageSelector"] as? [String:Any],Set(selector.keys)==["service","account","accessGroup"] else{throw NativeFreshBootstrapError.record}
        for binding in bindings{guard Set(binding.keys)==["row","target"],let target=binding["target"] as? [String:Any],Set(target.keys)==["service","account","accessGroup"]else{throw NativeFreshBootstrapError.record}}
        let journal=try JSONDecoder().decode(Self.self,from:bytes);try journal.validate();return journal
    }
}
