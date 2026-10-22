// Inactive source-only secure credential boundary. No password-manager product.
import Foundation
import CryptoKit
import Security

enum AuxSecureStoreError:Error { case invalidReview, deniedKey, failed }
struct AuxSecureStoreSelector:Hashable { let service:String;let account:String;let accessGroup:String }
struct ReviewedAuxSecureStoreScope {
    let scope:String
    private let group:String
    private let allowedKeys:Set<Data>
    init(scope:String,accessGroup:String,allowedLogicalKeys:Set<String>)throws {
        guard scope.utf8.count==64,scope.utf8.allSatisfy({(48...57).contains($0)||(97...102).contains($0)}),
              !accessGroup.isEmpty,accessGroup.utf8.count<=512,!accessGroup.utf8.contains(0),accessGroup.contains(".aux.") && accessGroup.utf8.allSatisfy({(48...57).contains($0)||(65...90).contains($0)||(97...122).contains($0)||$0==45||$0==46}),
              !allowedLogicalKeys.isEmpty,allowedLogicalKeys.count<=1024,
              allowedLogicalKeys.allSatisfy({!$0.isEmpty && $0.utf8.count<=512 && !$0.utf8.contains(0)})
        else{throw AuxSecureStoreError.invalidReview}
        self.scope=scope;group=accessGroup;allowedKeys=Set(allowedLogicalKeys.map{Data($0.utf8)})
    }
    func selector(_ key:String)throws->AuxSecureStoreSelector {
        guard allowedKeys.contains(Data(key.utf8)) else{throw AuxSecureStoreError.deniedKey}
        let digest=SHA256.hash(data:Data(key.utf8)).map{String(format:"%02x",$0)}.joined()
        let name="aux."+scope+".secure.v2."+digest
        return .init(service:name,account:name,accessGroup:group)
    }
}
enum CapturedAuxSecureRead { case missing,bytes(Data),failure(OSStatus),invalid }
protocol AuxSecureStoreBoundary {
    func read(_ selector:AuxSecureStoreSelector)->CapturedAuxSecureRead
    func update(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus
    func add(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus
    func clear(_ selector:AuxSecureStoreSelector)->OSStatus
}
enum AuxSecureStoreQueries {
    static func exact(_ s:AuxSecureStoreSelector)->[String:Any] {
        [kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:s.service,
         kSecAttrAccount as String:s.account,kSecAttrAccessGroup as String:s.accessGroup,
         kSecUseDataProtectionKeychain as String:true,
         kSecUseAuthenticationUI as String:kSecUseAuthenticationUIFail]
    }
    static func read(_ s:AuxSecureStoreSelector)->[String:Any] {
        var query=exact(s);query[kSecReturnData as String]=true;query[kSecMatchLimit as String]=kSecMatchLimitOne;return query
    }
    static func add(_ s:AuxSecureStoreSelector,data:Data)->[String:Any] {
        var query=exact(s);query[kSecValueData as String]=data
        query[kSecAttrAccessible as String]=kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly;return query
    }
}
// Real Security adapter SOURCE ONLY. Selecting this adapter executes protected
// operations and requires a separately authorized host/selector/runtime review.
struct ActualAuxSecureStoreBoundary:AuxSecureStoreBoundary {
    func read(_ selector:AuxSecureStoreSelector)->CapturedAuxSecureRead {
        var result:CFTypeRef?
        let status=SecItemCopyMatching(AuxSecureStoreQueries.read(selector) as CFDictionary,&result)
        if status==errSecItemNotFound{return .missing}
        guard status==errSecSuccess else{return .failure(status)}
        guard let result,CFGetTypeID(result)==CFDataGetTypeID() else{return .invalid}
        let value=result as! CFData,count=CFDataGetLength(value)
        guard count>=0,count<=16_384 else{return .invalid}
        if count==0{return .bytes(Data())}
        guard let pointer=CFDataGetBytePtr(value)else{return .invalid}
        return .bytes(Data(bytes:pointer,count:count))
    }
    func update(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus {
        SecItemUpdate(AuxSecureStoreQueries.exact(selector) as CFDictionary,[kSecValueData as String:data] as CFDictionary)
    }
    func add(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus {
        SecItemAdd(AuxSecureStoreQueries.add(selector,data:data) as CFDictionary,nil)
    }
    func clear(_ selector:AuxSecureStoreSelector)->OSStatus {SecItemDelete(AuxSecureStoreQueries.exact(selector) as CFDictionary)}
}
final class AuxSecureStoreCommandCore {
    private let review:ReviewedAuxSecureStoreScope
    private let boundary:AuxSecureStoreBoundary
    private let lock=NSLock() // This instance only; not cross-process custody/CAS.
    init(review:ReviewedAuxSecureStoreScope,boundary:AuxSecureStoreBoundary){self.review=review;self.boundary=boundary}
    private func json(_ object:[String:Any])->String {
        guard let data=try? JSONSerialization.data(withJSONObject:object,options:[.sortedKeys,.withoutEscapingSlashes]),let text=String(data:data,encoding:.utf8)
        else{return "{\"error\":\"Secure storage serialization failed\"}"};return text
    }
    func run(command:String,input:String)->String {
        guard ["secure-save","secure-read","secure-clear"].contains(command) else{return json(["error":"Unknown native secure storage command"])}
        lock.lock();defer{lock.unlock()}
        do {
            let object=try strictEnvelopeObject(Data(input.utf8))
            guard Set(object.keys)==(command=="secure-save" ? Set(["key","data"]):Set(["key"])),let key=object["key"] as? String else{throw AuxSecureStoreError.failed}
            let selected=try review.selector(key)
            switch command {
            case "secure-read":
                switch boundary.read(selected) {
                case .missing:return json(["data":NSNull()])
                case .bytes(let data):
                    guard data.count<=16_384,let text=String(data:data,encoding:.utf8)else{throw AuxSecureStoreError.failed}
                    return json(["data":text])
                case .failure,.invalid:throw AuxSecureStoreError.failed
                }
            case "secure-save":
                guard let text=object["data"] as? String else{throw AuxSecureStoreError.failed}
                let data=Data(text.utf8);guard data.count<=16_384 else{throw AuxSecureStoreError.failed}
                // Preserve existing data on failed writes. Never delete-before-add
                // or restore a stale captured value over a concurrent writer.
                let update=boundary.update(selected,data:data)
                if update==errSecItemNotFound {
                    guard boundary.add(selected,data:data)==errSecSuccess else{throw AuxSecureStoreError.failed}
                } else if update != errSecSuccess {throw AuxSecureStoreError.failed}
                return json(["success":true])
            default:
                let status=boundary.clear(selected)
                guard status==errSecSuccess || status==errSecItemNotFound else{throw AuxSecureStoreError.failed}
                return json(["success":true])
            }
        }catch{return json(["error":"Secure storage operation failed"])}
    }
}
