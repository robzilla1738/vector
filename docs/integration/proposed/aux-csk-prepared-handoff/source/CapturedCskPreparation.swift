// External captured-envelope importer. Never an installation authority or runtime fallback.
import Foundation
import CryptoKit

enum CapturedCskHandoffError:Error {case record,owner,key,continuity,binding,phase}
struct CapturedCskOwner:Equatable {let accountId:Int64;let boundUserId:String?}
private struct CapturedCskRecord {
    let envelope:[String:Any]
    let metadata:Data
    init(_ bytes:Data,aux:Bool,account:Int64,owner:CapturedCskOwner?)throws {
        guard let text=String(data:bytes,encoding:.utf8),Data(text.utf8)==bytes else{throw CapturedCskHandoffError.record}
        let object=try strictEnvelopeObject(bytes)
        let envelope:[String:Any]
        if object["encryptedBlob"] == nil {
            guard owner == nil else{throw CapturedCskHandoffError.owner}
            envelope=object;metadata=Data()
        }else {
            let required:Set<String>=["schemaVersion","accountId","boundUserId","encryptedBlob"]
            guard Set(object.keys)==required || Set(object.keys)==required.union(["syncGeneration"]),
                  let expected=owner,expected.accountId==account,
                  try Self.integer(object["schemaVersion"])==1,
                  try Self.integer(object["accountId"])==account,
                  let blob=object["encryptedBlob"] as? [String:Any] else{throw CapturedCskHandoffError.owner}
            let user=object["boundUserId"]
            guard user is NSNull || user is String else{throw CapturedCskHandoffError.owner}
            let actual=user as? String
            guard actual == expected.boundUserId,actual == nil || !actual!.isEmpty else{throw CapturedCskHandoffError.owner}
            if let generation=object["syncGeneration"],!(generation is NSNull){_ = try Self.integer(generation)}
            var fields=object;fields.removeValue(forKey:"encryptedBlob")
            metadata=try JSONSerialization.data(withJSONObject:fields,options:[.sortedKeys,.withoutEscapingSlashes]);envelope=blob
        }
        let keys:Set<String>=aux ? ["format","purpose","nonce","ciphertext"]:["purpose","nonce","ciphertext"]
        guard Set(envelope.keys)==keys,envelope["purpose"] as? String == "csk",
              !aux || envelope["format"] as? String == "aux.dk.v2" else{throw CapturedCskHandoffError.record}
        self.envelope=envelope
    }
    private static func integer(_ value:Any?)throws->Int64 {
        guard let n=value as? NSNumber,String(cString:n.objCType) != "c",n.doubleValue>=0,n.doubleValue<=9_007_199_254_740_991,n.doubleValue.rounded()==n.doubleValue else{throw CapturedCskHandoffError.record}
        return n.int64Value
    }
    func open(root:SymmetricKey,aux:Bool)throws->Data {
        func base64(_ field:String)throws->Data {
            guard let text=envelope[field] as? String,let data=Data(base64Encoded:text),data.base64EncodedString()==text else{throw CapturedCskHandoffError.record};return data
        }
        let nonce=try base64("nonce"),cipher=try base64("ciphertext")
        guard nonce.count==12,cipher.count==48 else{throw CapturedCskHandoffError.record}
        // Exact supplied KDF info and authenticated data, not branding inference.
        let label=Data((aux ? "aux.dk.csk.v2":"aside.dk.csk.v1").utf8)
        let key=HKDF<SHA256>.deriveKey(inputKeyMaterial:root,salt:Data(),info:label,outputByteCount:32)
        let sealed=try ChaChaPoly.SealedBox(nonce:ChaChaPoly.Nonce(data:nonce),ciphertext:cipher.dropLast(16),tag:cipher.suffix(16))
        return try ChaChaPoly.open(sealed,using:key,authenticating:label)
    }
}
final class PreparedCapturedCskV2 {
    let binding:CapturedHistoricalAuxCredentialBinding
    let preparationId=UUID().uuidString.lowercased()
    let sourceHash:String;let targetHash:String;let sourceBytes:Int;let targetBytes:Int
    private let payload:Data
    private let addLock=NSLock()
    private var addAvailable=true
    private init(binding:CapturedHistoricalAuxCredentialBinding,source:Data,target:Data){self.binding=binding;sourceHash=credentialCopyHash(source);targetHash=credentialCopyHash(target);sourceBytes=source.count;targetBytes=target.count;payload=target}
    static func authenticate(binding:CapturedHistoricalAuxCredentialBinding,accountId:Int64,expectedOwner:CapturedCskOwner?,source:Data,prepared:Data,capturedRoot:Data)throws->PreparedCapturedCskV2 {
        guard (0...9_007_199_254_740_991).contains(accountId),capturedRoot.count==32,
              binding.logicalKeyHash==credentialCopyHash(Data("aux.csk_\(accountId)".utf8)),
              credentialCopyHash(source) != credentialCopyHash(prepared) else{throw CapturedCskHandoffError.binding}
        let old=try CapturedCskRecord(source,aux:false,account:accountId,owner:expectedOwner)
        let new=try CapturedCskRecord(prepared,aux:true,account:accountId,owner:expectedOwner)
        guard old.metadata==new.metadata else{throw CapturedCskHandoffError.owner}
        let root=SymmetricKey(data:capturedRoot)
        var left=try old.open(root:root,aux:false);defer{left.resetBytes(in:0..<left.count)}
        var right=try new.open(root:root,aux:true);defer{right.resetBytes(in:0..<right.count)}
        guard left.count==32,right.count==32 else{throw CapturedCskHandoffError.key}
        var difference:UInt8=0;for i in 0..<32{difference |= left[i]^right[i]}
        guard difference==0 else{throw CapturedCskHandoffError.continuity}
        return .init(binding:binding,source:source,target:prepared)
    }
    // File-private payload delivery: no generic caller payload constructor.
    fileprivate func deliver()->Data{payload}
}
// Sealed payload delivery requires actual private-store checkpoint and consumes
// the in-process one shot before executor callback/reentry/throw.
extension PreparedCapturedCskV2 {
    func addCapturedTarget(after checkpoint:StoredCskHandoffCheckpoint,using boundary:AuxCopyOnlyCredentialBoundary)throws->CapturedAuxCredentialAddStatus {
        addLock.lock()
        let j=checkpoint.journal
        guard addAvailable,j.transactionId==preparationId,j.phase == .intent,j.revision==1,j.bindingHash==binding.sha256,j.sourceHash==sourceHash,j.targetHash==targetHash,j.sourceBytes==sourceBytes,j.targetBytes==targetBytes else{addLock.unlock();throw CapturedCskHandoffError.phase}
        addAvailable=false;addLock.unlock()
        return try boundary.addTarget(binding.target,bytes:deliver())
    }
}
