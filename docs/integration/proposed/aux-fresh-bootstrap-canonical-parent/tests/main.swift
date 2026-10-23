import Foundation
import Darwin
var count=0
func check(_ b:Bool){precondition(b);count += 1}
let temp=FileManager.default.temporaryDirectory.appendingPathComponent("aux-canonical-parent-"+UUID().uuidString)
try FileManager.default.createDirectory(at:temp,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer{try? FileManager.default.removeItem(at:temp)}
guard let resolved=realpath(temp.path,nil)else{fatalError("realpath")}
let canonical=String(cString:resolved);free(resolved)
let standardized=URL(fileURLWithPath:canonical).standardizedFileURL.path
func decode(_ parent:String)throws->AuxFreshBootstrapPolicyContents{
 let value:[String:Any] = ["format":AuxFreshBootstrapPolicyContents.format,"role":"cli","canonicalPrivateParent":parent,"accessGroup":AuxFreshBootstrapIdentity.team+".dev.aux.bootstrap.fixture","authoritySelection":AuxFreshBootstrapPolicyContents.authoritySelection]
 return try .decode(JSONSerialization.data(withJSONObject:value))
}
check(try decode(canonical).canonicalPrivateParent==canonical)
for bad in ["/","relative","//private/tmp/a","/private//tmp/a","/private/tmp/a/","/private/./a","/private/../a","/private/a\0b",AuxFreshBootstrapIdentity.historicalHome,AuxFreshBootstrapIdentity.historicalHome+"/child"]{
 do{_ = try decode(bad);fatalError("accepted invalid path")}catch{count += 1}
}
check(try decode("/private/tmp/not-created-aux-parent").canonicalPrivateParent=="/private/tmp/not-created-aux-parent")
// Pure grammar accepts lexical symlink names; live authenticated reader still
// requires realpath equality and private FD identity before creating a home.
let link=temp.appendingPathComponent("link")
try FileManager.default.createSymbolicLink(atPath:link.path,withDestinationPath:canonical)
check(try decode(link.path).canonicalPrivateParent==link.path)
check(realpath(link.path,nil).map{pointer in defer{free(pointer)};return String(cString:pointer)} != link.path)
print("DIAG: existing canonical=\(canonical); Foundation standardized=\(standardized); historicalPredicateAccepts=\(canonical==standardized)")
print("PASS:\(count) canonical-parent grammar checks; disposable filesystem only; no authenticated loader or Security execution")
