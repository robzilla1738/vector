// Runtime-only Aux-v2 target capture. No legacy reader, mutation or activation.
import Foundation
import CryptoKit
import Security

enum AuxRuntimeCaptureError:Error { case policy,missing,unavailable,invalid,changed,unsupported }
struct AuxRuntimeTargetSelector {let service:String;let account:String;let accessGroup:String}
enum AuxRuntimeTargetRead {case bytes(Data),missing,unavailable,invalid}
struct AuxRuntimeTargetRows {
    let metadata:AuxRuntimeTargetRead;let signing:AuxRuntimeTargetRead
    let kem:AuxRuntimeTargetRead;let wrappedRoot:AuxRuntimeTargetRead
    func value(_ role:String)->AuxRuntimeTargetRead {
        switch role {case "metadata":return metadata;case "signing":return signing;case "kem":return kem;case "wrappedRoot":return wrappedRoot;default:return .invalid}
    }
}
// Public selection content supplied by a TRUSTED host after real admission.
// Construction validates content only; a checksum is not signer/writer authority.
struct AuxRuntimeSelection {
    static let roles=["metadata","signing","kem","wrappedRoot"]
    let scope:String;let generationId:String;let accessGroup:String
    let scheme:String;let signingPublicKey:Data;let kemPublicKey:Data
    let targetHashes:[String:String]
    init(scope:String,generationId:String,accessGroup:String,scheme:String,signingPublicKey:Data,kemPublicKey:Data,targetHashes:[String:String])throws {
        func hash(_ s:String)->Bool{s.utf8.count==64 && s.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}
        guard hash(scope),UUID(uuidString:generationId)?.uuidString==generationId,
              !accessGroup.isEmpty,accessGroup.utf8.count<=512,!accessGroup.utf8.contains(0),accessGroup.contains(".aux.") && accessGroup.utf8.allSatisfy({(48...57).contains($0)||(65...90).contains($0)||(97...122).contains($0)||$0==45||$0==46}),
              Set(targetHashes.keys)==Set(Self.roles),targetHashes.values.allSatisfy(hash) else{throw AuxRuntimeCaptureError.policy}
        switch scheme {
        case "p256_v1":guard [signingPublicKey,kemPublicKey].allSatisfy({$0.count==65 && $0.first==4}) else{throw AuxRuntimeCaptureError.policy}
        case "pq_v1":guard signingPublicKey.count==1952,kemPublicKey.count==1184 else{throw AuxRuntimeCaptureError.policy}
        default:throw AuxRuntimeCaptureError.policy
        }
        self.scope=scope;self.generationId=generationId;self.accessGroup=accessGroup;self.scheme=scheme
        self.signingPublicKey=signingPublicKey;self.kemPublicKey=kemPublicKey;self.targetHashes=targetHashes
    }
    func selector(_ role:String)throws->AuxRuntimeTargetSelector {
        let suffix:String
        switch role {case "metadata":suffix="meta";case "signing":suffix="sig";case "kem":suffix="kem";case "wrappedRoot":suffix="dk";default:throw AuxRuntimeCaptureError.policy}
        let service="aux."+scope+".installation.v2"
        return .init(service:service,account:service+"."+suffix,accessGroup:accessGroup)
    }
}
struct AuxRuntimeCapturedCommandContext {
    let core:AuxInstallationCommandCore
    let selection:AuxRuntimeSelection
    // Captured/cryptographic consistency only. Native producer must establish
    // real host authority, selected state-cohort admission and current capture.
    private init(_ authority:AuxCapturedCommandAuthority,_ selection:AuxRuntimeSelection){core = .init(context:.installed(authority));self.selection=selection}
    static func validate(selection:AuxRuntimeSelection,rows:AuxRuntimeTargetRows)throws->Self {
        var data=[String:Data]()
        for role in AuxRuntimeSelection.roles {
            switch rows.value(role) {
            case .missing:throw AuxRuntimeCaptureError.missing
            case .unavailable:throw AuxRuntimeCaptureError.unavailable
            case .invalid:throw AuxRuntimeCaptureError.invalid
            case .bytes(let bytes):
                guard !bytes.isEmpty,bytes.count<=16_384 else{throw AuxRuntimeCaptureError.invalid}
                let hash=SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()
                guard hash==selection.targetHashes[role] else{throw AuxRuntimeCaptureError.changed}
                data[role]=bytes
            }
        }
        let metadata=try InstallationAuthorityMetadata(json:data["metadata"]!)
        guard metadata.scheme.rawValue==selection.scheme else{throw AuxRuntimeCaptureError.changed}
        let authority:AuxCapturedCommandAuthority
        switch metadata.scheme {
        case .p256:authority=try .p256(metadata:metadata,signingPrivate:data["signing"]!,signingPublic:selection.signingPublicKey,kemPrivate:data["kem"]!,kemPublic:selection.kemPublicKey,wrappedRoot:data["wrappedRoot"]!)
        case .pq:
            guard #available(macOS 26.0,*) else{throw AuxRuntimeCaptureError.unsupported}
            authority=try .pq(metadata:metadata,signingPrivate:data["signing"]!,signingPublic:selection.signingPublicKey,kemPrivate:data["kem"]!,kemPublic:selection.kemPublicKey,wrappedRoot:data["wrappedRoot"]!)
        }
        return .init(authority,selection)
    }
}
enum AuxRuntimeDataProtectionCapture {
    static func query(_ selected:AuxRuntimeTargetSelector)->[String:Any] {
        [kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:selected.service,
         kSecAttrAccount as String:selected.account,kSecAttrAccessGroup as String:selected.accessGroup,
         kSecUseDataProtectionKeychain as String:true,kSecReturnData as String:true,
         kSecMatchLimit as String:kSecMatchLimitOne,kSecUseAuthenticationUI as String:kSecUseAuthenticationUIFail]
    }
    static func result(status:OSStatus,value:CFTypeRef?)->AuxRuntimeTargetRead {
        if status==errSecItemNotFound{return .missing}
        guard status==errSecSuccess else{return .unavailable}
        guard let value,CFGetTypeID(value)==CFDataGetTypeID() else{return .invalid}
        let data=value as! CFData,n=CFDataGetLength(data)
        guard n>0,n<=16_384,let pointer=CFDataGetBytePtr(data) else{return .invalid}
        return .bytes(Data(bytes:pointer,count:n))
    }
    // Calling capture performs REAL protected reads; it is not used by fixtures.
    // The old original-group interposer is incompatible. A clean authorized
    // host must establish preflight/custody before invoking this method.
    static func capture(_ selection:AuxRuntimeSelection)throws->AuxRuntimeTargetRows {
        func read(_ role:String)throws->AuxRuntimeTargetRead {
            let selected=try selection.selector(role);var value:CFTypeRef?
            let status=SecItemCopyMatching(query(selected) as CFDictionary,&value)
            return result(status:status,value:value)
        }
        return try .init(metadata:read("metadata"),signing:read("signing"),kem:read("kem"),wrappedRoot:read("wrappedRoot"))
    }
}
