import Foundation
import CryptoKit
import Security
var checks=0
func check(_ condition:Bool){precondition(condition);checks += 1}
let families=AuxSourceKnownLogicalKeyFamilies.reviewedV2(),scope=String(repeating:"a",count:64),group="9F2JXY8TCK.dev.aux.synthetic"
let labels=try JSONDecoder().decode([String].self,from:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1])))
let review=try ReviewedAuxSecureStoreScope(scope:scope,accessGroup:group,sourceKnownFamilies:families)
for key in labels {
 check(families.allows(key));let selector=try review.selector(key)
 let hash=SHA256.hash(data:Data(key.utf8)).map{String(format:"%02x",$0)}.joined()
 check(selector.service=="aux."+scope+".secure.v2."+hash && selector.account==selector.service && selector.accessGroup==group)
}
let invalid=["mcp:01:server","mcp:-1:server","mcp:9007199254740992:server","mcp:1:","mcp:1:server:other","mcp:1:"+String(repeating:"x",count:33),"mcp:1:../x","mcp:index:01","aux.csk_1e3","aux.csk_","aside.csk_1","aux.channel.v1.u1.not-uuid.slack.bot","aux.channel.v1.u1.123e4567-e89b-42d3-a456-426614174000.discord.app","aux.channel.v1.u1.123E4567-E89B-42D3-A456-426614174000.slack.bot","aux.pwm.session_1","provider:any","aux.dk","aux.install.meta","mcp:1:💡","mcp:1:a\0b"]
for key in invalid {check(!families.allows(key));do{_ = try review.selector(key);preconditionFailure("denied key accepted")}catch{checks += 1}}
let exact=try ReviewedAuxSecureStoreScope(scope:scope,accessGroup:group,allowedLogicalKeys:["fixture"])
_ = try exact.selector("fixture");checks += 1
do{_ = try exact.selector(labels[0]);preconditionFailure("v1 broadened")}catch{checks += 1}
final class CapturedBoundary:AuxSecureStoreBoundary {
 var rows:[AuxSecureStoreSelector:Data]=[:];var calls=0
 func read(_ s:AuxSecureStoreSelector)->CapturedAuxSecureRead{calls += 1;return rows[s].map{.bytes($0)} ?? .missing}
 func update(_ s:AuxSecureStoreSelector,data:Data)->OSStatus{calls += 1;guard rows[s] != nil else{return errSecItemNotFound};rows[s]=data;return errSecSuccess}
 func add(_ s:AuxSecureStoreSelector,data:Data)->OSStatus{calls += 1;guard rows[s]==nil else{return errSecDuplicateItem};rows[s]=data;return errSecSuccess}
 func clear(_ s:AuxSecureStoreSelector)->OSStatus{calls += 1;rows.removeValue(forKey:s);return errSecSuccess}
}
let boundary=CapturedBoundary(),core=AuxSecureStoreCommandCore(review:review,boundary:boundary)
func command(_ name:String,_ object:[String:Any])->[String:Any]{let bytes=try! JSONSerialization.data(withJSONObject:object);return try! JSONSerialization.jsonObject(with:Data(core.run(command:name,input:String(decoding:bytes,as:UTF8.self)).utf8)) as! [String:Any]}
for key in labels {check(command("secure-save",["key":key,"data":"synthetic"]) ["success"] as? Bool==true);check(command("secure-read",["key":key])["data"] as? String=="synthetic");check(command("secure-clear",["key":key])["success"] as? Bool==true)}
let before=boundary.calls;check(command("secure-read",["key":"aux.dk"])["error"] != nil);check(before==boundary.calls)
print("\(checks) source-known family/hash/query-routing checks; captured boundary only; no Security, owner data, OS or provider operations")
