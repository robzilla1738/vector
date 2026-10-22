import Foundation
import Security

final class CapturedStore:AuxSecureStoreBoundary {
    var values=[AuxSecureStoreSelector:Data](),operations=[String]()
    var readResult:CapturedAuxSecureRead?,updateFailure:OSStatus?,addFailure:OSStatus?,clearFailure:OSStatus?
    func read(_ s:AuxSecureStoreSelector)->CapturedAuxSecureRead {operations.append("read");return readResult ?? values[s].map{.bytes($0)} ?? .missing}
    func update(_ s:AuxSecureStoreSelector,data:Data)->OSStatus {
        operations.append("update");if let status=updateFailure{return status}
        guard values[s] != nil else{return errSecItemNotFound};values[s]=data;return errSecSuccess
    }
    func add(_ s:AuxSecureStoreSelector,data:Data)->OSStatus {
        operations.append("add");if let status=addFailure{return status}
        guard values[s]==nil else{return errSecDuplicateItem};values[s]=data;return errSecSuccess
    }
    func clear(_ s:AuxSecureStoreSelector)->OSStatus {
        operations.append("clear");if let status=clearFailure{return status}
        return values.removeValue(forKey:s)==nil ? errSecItemNotFound:errSecSuccess
    }
}
var checks=0
func check(_ b:Bool){precondition(b);checks += 1}
func encode(_ o:[String:Any])->String {String(data:try! JSONSerialization.data(withJSONObject:o),encoding:.utf8)!}
let scope=String(repeating:"a",count:64),key="mcp:fixture:aside-in-user-content",other="aux.csk_fixture"
let review=try ReviewedAuxSecureStoreScope(scope:scope,accessGroup:"TEST.aux.synthetic",allowedLogicalKeys:[key,other])
let first=try review.selector(key),second=try review.selector(other)
check(first != second && first.service==first.account && first.service.hasPrefix("aux."+scope+".secure.v2.") && !first.service.contains("mcp") && !first.service.contains("aside"))
let query=AuxSecureStoreQueries.read(first)
check(query[kSecAttrAccessGroup as String] as? String=="TEST.aux.synthetic" && query[kSecAttrService as String] as? String==first.service && query[kSecAttrAccount as String] as? String==first.account)
check(query[kSecUseDataProtectionKeychain as String] as? Bool==true && query[kSecReturnData as String] as? Bool==true && query[kSecMatchLimit as String] as? String==kSecMatchLimitOne as String && query[kSecUseAuthenticationUI as String] as? String==kSecUseAuthenticationUIFail as String)
let add=AuxSecureStoreQueries.add(first,data:Data("synthetic".utf8))
check(add[kSecAttrAccessible as String] as? String==kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly as String && add[kSecReturnData as String]==nil)
let memory=CapturedStore(),core=AuxSecureStoreCommandCore(review:review,boundary:memory)
func run(_ command:String,_ data:[String:Any])->[String:Any]{try! strictEnvelopeObject(Data(core.run(command:command,input:encode(data)).utf8))}
check(run("secure-read",["key":key])["data"] is NSNull)
check(run("secure-save",["key":key,"data":"first synthetic"])["success"] as? Bool==true && memory.operations.suffix(2)==["update","add"])
check(run("secure-save",["key":key,"data":"second synthetic"])["success"] as? Bool==true && memory.operations.last=="update")
check(run("secure-read",["key":key])["data"] as? String=="second synthetic")
memory.updateFailure=errSecInteractionNotAllowed
check(run("secure-save",["key":key,"data":"must not replace"])["error"] != nil && memory.values[first]==Data("second synthetic".utf8) && memory.operations.last=="update")
memory.updateFailure=nil;memory.addFailure=errSecDuplicateItem
check(run("secure-save",["key":other,"data":"must not retry"])["error"] != nil && memory.operations.suffix(2)==["update","add"] && memory.values[second]==nil)
memory.addFailure=nil;memory.readResult = .failure(errSecMissingEntitlement)
check(run("secure-read",["key":key])["error"] != nil)
memory.readResult = .invalid;check(run("secure-read",["key":key])["error"] != nil)
memory.readResult = .bytes(Data([0xff]));check(run("secure-read",["key":key])["error"] != nil)
memory.readResult=nil
let before=memory.operations.count
for input in ["{\"key\":\"a\",\"key\":\"b\"}","{\"key\":true}","{\"key\":\"mcp:unknown\"}","{\"key\":\"mcp:unknown\",\"extra\":1}"] {
    check((try strictEnvelopeObject(Data(core.run(command:"secure-read",input:input).utf8)))["error"] != nil)
}
check(memory.operations.count==before)
check((try strictEnvelopeObject(Data(core.run(command:"install-destroy",input:"{}").utf8)))["error"] != nil && memory.operations.count==before)
_ = run("secure-save",["key":other,"data":"independent"])
memory.clearFailure=errSecInteractionNotAllowed
check(run("secure-clear",["key":key])["error"] != nil && memory.values[first] != nil)
memory.clearFailure=nil
check(run("secure-clear",["key":key])["success"] as? Bool==true && memory.values[first]==nil && memory.values[second]==Data("independent".utf8))
check(run("secure-clear",["key":key])["success"] as? Bool==true)
check(!memory.operations.contains("enumerate"))
print("PASS: \(checks) captured secure-store/query assertions; actual Security calls: 0")
