import Foundation
import CryptoKit
import Security

var checks=0
func check(_ b:Bool){precondition(b);checks += 1}
func refuses(_ body:()throws->Void){do{try body();preconditionFailure()}catch{checks += 1}}
func hash(_ d:Data)->String{SHA256.hash(data:d).map{String(format:"%02x",$0)}.joined()}
let signer=try P256.Signing.PrivateKey(rawRepresentation:Data(repeating:1,count:32))
let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:Data(repeating:2,count:32))
let root=Data(repeating:0x35,count:32)
let wrapped=try AuxNativeEnvelopeV2.wrap(root:root,existingPublicKey:kem.publicKey.x963Representation).auxJson()
let payloads=["metadata":Data("{\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8),"signing":signer.rawRepresentation,"kem":kem.rawRepresentation,"wrappedRoot":wrapped]
let scope=String(repeating:"a",count:64),generation="DA867F35-A965-4582-9795-E964CF809813",group="TEST.aux.synthetic"
func policy(hashes:[String:String]=payloads.mapValues(hash),publicKey:Data=signer.publicKey.x963Representation,accessGroup:String=group)throws->AuxRuntimeSelection {
    try .init(scope:scope,generationId:generation,accessGroup:accessGroup,scheme:"p256_v1",signingPublicKey:publicKey,kemPublicKey:kem.publicKey.x963Representation,targetHashes:hashes)
}
func rows(_ values:[String:Data]=payloads)->AuxRuntimeTargetRows {
    func row(_ key:String)->AuxRuntimeTargetRead{values[key].map{.bytes($0)} ?? .missing}
    return .init(metadata:row("metadata"),signing:row("signing"),kem:row("kem"),wrappedRoot:row("wrappedRoot"))
}
let selected=try policy(),context=try AuxRuntimeCapturedCommandContext.validate(selection:selected,rows:rows())
let core=context.core
let recovered=try strictEnvelopeObject(Data(core.run(command:"dk-unwrap").utf8))
check(recovered["dk"] as? String==root.base64EncodedString())
let challenge=Data("Aux runtime-only software continuity".utf8)
let input=String(data:try JSONSerialization.data(withJSONObject:["challenge":challenge.base64EncodedString()]),encoding:.utf8)!
let response=try strictEnvelopeObject(Data(core.run(command:"cdp-sign",input:input).utf8))
let signature=try P256.Signing.ECDSASignature(derRepresentation:Data(base64Encoded:response["signature"] as! String)!)
check(signer.publicKey.isValidSignature(signature,for:challenge))
for (role,suffix) in [("metadata","meta"),("signing","sig"),("kem","kem"),("wrappedRoot","dk")] {
    let selector=try selected.selector(role),query=AuxRuntimeDataProtectionCapture.query(selector)
    check(selector.service=="aux."+scope+".installation.v2" && selector.account==selector.service+"."+suffix && selector.accessGroup==group)
    check(query[kSecAttrAccessGroup as String] as? String==group && query[kSecUseDataProtectionKeychain as String] as? Bool==true && query[kSecMatchLimit as String] as? String==kSecMatchLimitOne as String)
}
refuses{_ = try selected.selector("arbitrary")}
refuses{_ = try policy(accessGroup:"OTHER.unrelated")}
refuses{_ = try policy(publicKey:Data([4]))}
refuses{_ = try policy(hashes:[:])}
var missing=payloads;missing.removeValue(forKey:"signing")
refuses{_ = try AuxRuntimeCapturedCommandContext.validate(selection:selected,rows:rows(missing))}
var changed=payloads;changed["signing"]![0] ^= 1
refuses{_ = try AuxRuntimeCapturedCommandContext.validate(selection:selected,rows:rows(changed))}
refuses{_ = try AuxRuntimeCapturedCommandContext.validate(selection:policy(hashes:changed.mapValues(hash)),rows:rows(changed))}
let blocked=AuxRuntimeTargetRows(metadata:.unavailable,signing:.missing,kem:.missing,wrappedRoot:.missing)
refuses{_ = try AuxRuntimeCapturedCommandContext.validate(selection:selected,rows:blocked)}
if case .missing=AuxRuntimeDataProtectionCapture.result(status:errSecItemNotFound,value:nil){checks += 1}else{preconditionFailure()}
if case .unavailable=AuxRuntimeDataProtectionCapture.result(status:errSecMissingEntitlement,value:nil){checks += 1}else{preconditionFailure()}
if case .invalid=AuxRuntimeDataProtectionCapture.result(status:0,value:"invalid" as CFString){checks += 1}else{preconditionFailure()}
if case .bytes(let read)=AuxRuntimeDataProtectionCapture.result(status:0,value:Data([1]) as CFData){check(read==Data([1]))}else{preconditionFailure()}
print("PASS: \(checks) minimal runtime target-capture assertions; Security calls: 0; hardware calls: 0")
