// Inactive source-only secure credential boundary. No password-manager product.
import Foundation
import CryptoKit
import Security

enum AuxSecureStoreError:Error { case invalidReview, deniedKey, failed }
struct AuxSecureStoreSelector:Hashable { let service:String;let account:String;let accessGroup:String }
// Native, source-known grammar; not account enumeration or writer provenance.
// No caller supplies prefixes, regexes, service/account/group selectors or grants.
struct AuxSourceKnownLogicalKeyFamilies {
    static let format="aux.secure.logical-key-families.v2"
    private init(){}
    static func reviewedV2()->Self{Self()}
    private func account(_ value:Substring)->Bool {
        guard !value.isEmpty,value.utf8.allSatisfy({(48...57).contains($0)}),value=="0" || value.first != "0",
              let number=UInt64(value),number<=9_007_199_254_740_991 else{return false};return true
    }
    func allows(_ key:String)->Bool {
        guard !key.isEmpty,key.utf8.count<=512,key.utf8.allSatisfy({$0>0 && $0<128})else{return false}
        if key.hasPrefix("aux.csk_"){return account(key.dropFirst(8))}
        let mcp=key.split(separator:":",omittingEmptySubsequences:false)
        if mcp.count==3,mcp[0]=="mcp" {
            if mcp[1]=="index" {return account(mcp[2])}
            return account(mcp[1]) && (1...32).contains(mcp[2].utf8.count) && mcp[2].utf8.allSatisfy({(48...57).contains($0)||(65...90).contains($0)||(97...122).contains($0)||$0==45||$0==95})
        }
        let channel=key.split(separator:".",omittingEmptySubsequences:false)
        guard channel.count==7,channel[0]=="aux",channel[1]=="channel",channel[2]=="v1",channel[3].first=="u",account(channel[3].dropFirst()),
              let uuid=UUID(uuidString:String(channel[4])),uuid.uuidString.lowercased()==channel[4],channel[4].count==36,
              ["slack","telegram","discord"].contains(channel[5]) else{return false}
        return channel[6]=="bot" || (channel[5]=="slack" && channel[6]=="app")
    }
}
struct ReviewedAuxSecureStoreScope {
    let scope:String
    private let group:String
    private let allowedKeys:Set<Data>
    private let families:AuxSourceKnownLogicalKeyFamilies?
    init(scope:String,accessGroup:String,allowedLogicalKeys:Set<String>)throws {
        try self.init(scope:scope,accessGroup:accessGroup,keys:allowedLogicalKeys,families:nil)
    }
    init(scope:String,accessGroup:String,sourceKnownFamilies:AuxSourceKnownLogicalKeyFamilies)throws {
        try self.init(scope:scope,accessGroup:accessGroup,keys:[],families:sourceKnownFamilies)
    }
    private init(scope:String,accessGroup:String,keys allowedLogicalKeys:Set<String>,families:AuxSourceKnownLogicalKeyFamilies?)throws {
        guard scope.utf8.count==64,scope.utf8.allSatisfy({(48...57).contains($0)||(97...102).contains($0)}),
              !accessGroup.isEmpty,accessGroup.utf8.count<=512,!accessGroup.utf8.contains(0),accessGroup.contains(".aux.") && accessGroup.utf8.allSatisfy({(48...57).contains($0)||(65...90).contains($0)||(97...122).contains($0)||$0==45||$0==46}),
              (!allowedLogicalKeys.isEmpty || families != nil),allowedLogicalKeys.count<=1024,
              allowedLogicalKeys.allSatisfy({!$0.isEmpty && $0.utf8.count<=512 && !$0.utf8.contains(0)})
        else{throw AuxSecureStoreError.invalidReview}
        self.scope=scope;group=accessGroup;allowedKeys=Set(allowedLogicalKeys.map{Data($0.utf8)});self.families=families
    }
    func selector(_ key:String)throws->AuxSecureStoreSelector {
        guard allowedKeys.contains(Data(key.utf8)) || families?.allows(key)==true else{throw AuxSecureStoreError.deniedKey}
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
#if AUX_ATOMIC_CSK_DISPATCH
    private let accounts:AuxAccountsCskCoordinator?
    init(review:ReviewedAuxSecureStoreScope,boundary:AuxSecureStoreBoundary,installation:AuxInstallationCommandCore,accountHome:String,retainedAccountHomeDescriptor:Int32? = nil)throws {
        self.review=review;self.boundary=boundary
        accounts=try AuxAccountsCskCoordinator(home:accountHome,review:review,installation:installation,boundary:boundary,retainedHomeDescriptor:retainedAccountHomeDescriptor)
    }
    func withAccountRegistryLock<T>(_ body:()throws->T)throws->T {
        guard let accounts else{throw AuxAccountsCskError.unavailable};return try accounts.withAccountRegistryLock(body)
    }
#endif
    init(review:ReviewedAuxSecureStoreScope,boundary:AuxSecureStoreBoundary){self.review=review;self.boundary=boundary
#if AUX_ATOMIC_CSK_DISPATCH
        accounts=nil
#endif
    }
    private func json(_ object:[String:Any])->String {
        guard let data=try? JSONSerialization.data(withJSONObject:object,options:[.sortedKeys,.withoutEscapingSlashes]),let text=String(data:data,encoding:.utf8)
        else{return "{\"error\":\"Secure storage serialization failed\"}"};return text
    }
    func run(command:String,input:String)->String {
        var commands=["secure-save","secure-read","secure-clear"]
#if AUX_ATOMIC_CSK_DISPATCH
        commands.append("csk-publish-absent-or-same")
#endif
        guard commands.contains(command) else{return json(["error":"Unknown native secure storage command"])}
        lock.lock();defer{lock.unlock()}
#if AUX_ATOMIC_CSK_DISPATCH
        if command=="csk-publish-absent-or-same" {return json(["status":accounts?.publish(input:input).rawValue ?? "unsupported"])}
#endif
        do {
            let object=try strictEnvelopeObject(Data(input.utf8))
            guard Set(object.keys)==(command=="secure-save" ? Set(["key","data"]):Set(["key"])),let key=object["key"] as? String else{throw AuxSecureStoreError.failed}
#if AUX_ATOMIC_CSK_DISPATCH
            // Every current CSK writer must use the typed transaction. A plain
            // secure-save/clear may never overwrite or delete an authority row.
            if command != "secure-read" && key.hasPrefix("aux.csk_") {return json(["error":"Atomic CSK coordinator required"])}
#endif
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
