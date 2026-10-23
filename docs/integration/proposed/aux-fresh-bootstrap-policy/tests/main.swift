import Foundation

var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
func rejects(_ body:()throws->Void){do {try body();fatalError("accepted invalid policy/capture")} catch {checks += 1}}
let group=AuxFreshBootstrapIdentity.team+".dev.aux.bootstrap.fixture"
func object(_ role:String)->[String:Any] {
    var value:[String:Any] = ["format":AuxFreshBootstrapPolicyContents.format,"role":role,"canonicalPrivateParent":"/private/tmp/aux-never-used-parent","accessGroup":group,"authoritySelection":AuxFreshBootstrapPolicyContents.authoritySelection]
    if role=="daemon" {
        value["pdfModule"]=["path":AuxFreshBootstrapPdfIdentity.relativePath,"identifier":AuxFreshBootstrapPdfIdentity.identifier,"sha256":AuxFreshBootstrapPdfIdentity.sha256,"bytes":AuxFreshBootstrapPdfIdentity.bytes]
        value["macOSUtilitiesModule"]=["path":AuxFreshBootstrapMacUtilitiesIdentity.relativePath,"identifier":AuxFreshBootstrapMacUtilitiesIdentity.identifier,"sha256":AuxFreshBootstrapMacUtilitiesIdentity.sha256,"bytes":AuxFreshBootstrapMacUtilitiesIdentity.bytes]
    }
    return value
}
func decode(_ value:[String:Any])throws->AuxFreshBootstrapPolicyContents {try .decode(JSONSerialization.data(withJSONObject:value,options:[.sortedKeys]))}
let cli=try decode(object("cli")),daemon=try decode(object("daemon"))
check(cli.accessGroup==group && cli.canonicalPrivateParent=="/private/tmp/aux-never-used-parent")
check(!cli.includesPdf && !cli.includesMacUtilities)
check(daemon.includesPdf && daemon.includesMacUtilities)
for field in ["home","scope","generationId","scheme","signingPublicKey","kemPublicKey","targetHashes","writerCustodyVerified","secureEnclaveAvailable"] {
    var bad=object("cli");bad[field]="caller-controlled";rejects{_ = try decode(bad)}
}
for pair in [("authoritySelection","force-software"),("format","aux.development.host.policy.v4"),("role","owner"),("accessGroup","9F2JXY8TCK.dev.foreign.test"),("accessGroup",group+".*"),("canonicalPrivateParent","/private/tmp/../tmp/aux"),("canonicalPrivateParent","/"),("canonicalPrivateParent",AuxFreshBootstrapIdentity.historicalHome)] {
    var bad=object("cli");bad[pair.0]=pair.1;rejects{_ = try decode(bad)}
}
rejects{_ = try AuxFreshBootstrapPolicyContents.decode(Data("{\"role\":\"cli\",\"r\\u006fle\":\"daemon\"}".utf8))}
var missing=object("daemon");missing.removeValue(forKey:"pdfModule");rejects{_ = try decode(missing)}
var stale=object("daemon");var pdf=stale["pdfModule"] as! [String:Any];pdf["sha256"]="00";stale["pdfModule"]=pdf;rejects{_ = try decode(stale)}
let paths=Array(freshBootstrapExpectedImageIdentifiers(bundle:"/private/tmp/Aux.app",policy:daemon).keys)
try validateCapturedFreshBootstrapImagePaths(paths,bundle:"/private/tmp/Aux.app",policy:daemon);checks += 1
rejects{try validateCapturedFreshBootstrapImagePaths(Array(paths.dropLast()),bundle:"/private/tmp/Aux.app",policy:daemon)}
rejects{try validateCapturedFreshBootstrapImagePaths(paths+["/private/tmp/foreign.node"],bundle:"/private/tmp/Aux.app",policy:daemon)}
func signature(_ groups:[String],_ entitlements:[String:Any]=[:])->AuxCapturedFreshBootstrapSignature {
    .init(identifier:cli.role.identifier,team:AuxFreshBootstrapIdentity.team,certificateSha256:AuxFreshBootstrapIdentity.leafCertificateSha256,applicationIdentifier:AuxFreshBootstrapIdentity.team+"."+cli.role.identifier,accessGroups:groups,flags:0x10000,entitlements:entitlements)
}
try validateCapturedFreshBootstrapSignature(signature([group]),role:.cli,host:true,accessGroup:group);checks += 1
rejects{try validateCapturedFreshBootstrapSignature(signature([group]),role:.cli,host:true,accessGroup:group+".other")}
rejects{try validateCapturedFreshBootstrapSignature(signature([group,group+".other"]),role:.cli,host:true,accessGroup:group)}
rejects{try validateCapturedFreshBootstrapSignature(signature([group],["com.apple.security.cs.disable-library-validation":true]),role:.cli,host:true,accessGroup:group)}
print("PASS:\(checks) captured pre-generation policy/signature/image checks; no authentication/OS/secure-row execution")
