// Public content/captured signature only. No signed loader, owner or DP call.
import Foundation
var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
func refuse(_ body:()throws->Void){do{try body();preconditionFailure("invalid content accepted")}catch{checks += 1}}
let identity=AuxReviewedDevelopmentIdentity.self
let publicKey=(Data([4])+Data(repeating:0,count:64)).base64EncodedString()
var json:[String:Any]=["format":"aux.development.host.policy.v1","role":"daemon","home":identity.home,"scope":identity.scope,"accessGroup":identity.group,"generationId":"B2A0464D-388A-4BA8-B55F-502465DCA50C","scheme":"p256_v1","signingPublicKey":publicKey,"kemPublicKey":publicKey,"targetHashes":Dictionary(uniqueKeysWithValues:AuxRuntimeSelection.roles.map{($0,String(repeating:"1",count:64))}),"logicalKeys":["aux.synthetic.oauth"]]
func encoded(_ value:[String:Any])throws->Data{try JSONSerialization.data(withJSONObject:value,options:[.sortedKeys])}
let contents=try AuxDevelopmentPolicyContents.decode(encoded(json));check(contents.selection.scope==identity.scope && contents.selection.accessGroup==identity.group)
for (key,value) in [("home","/Users/owner/.aux"),("scope",String(repeating:"0",count:64)),("accessGroup",identity.team+".dev.aux.other"),("role","migration"),("scheme","unknown"),("generationId","bad")]{var changed=json;changed[key]=value;refuse{_ = try AuxDevelopmentPolicyContents.decode(encoded(changed))}}
var extra=json;extra["expectedHostHash"]=String(repeating:"2",count:64);refuse{_ = try AuxDevelopmentPolicyContents.decode(encoded(extra))}
var keys=json;keys["logicalKeys"]=[String]();refuse{_ = try AuxDevelopmentPolicyContents.decode(encoded(keys))};keys["logicalKeys"]=["same","same"];refuse{_ = try AuxDevelopmentPolicyContents.decode(encoded(keys))}
let entitlements:[String:Any]=["com.apple.application-identifier":identity.team+".dev.aux.browser.daemon","keychain-access-groups":[identity.group],"com.apple.security.cs.allow-jit":true]
func signature(identifier:String="dev.aux.browser.daemon",team:String=identity.team,certificate:String=identity.leafCertificateSha256,application:String=identity.team+".dev.aux.browser.daemon",groups:[String]=[identity.group],flags:UInt32=0x10000,entitlements:[String:Any]=entitlements)->AuxCapturedDevelopmentSignature {
    .init(identifier:identifier,team:team,certificateSha256:certificate,applicationIdentifier:application,accessGroups:groups,flags:flags,entitlements:entitlements)
}
try validateCapturedDevelopmentSignature(signature(),role:.daemon,host:true);checks += 1
for invalid in [signature(team:"OTHERTEAM0"),signature(certificate:String(repeating:"0",count:64)),signature(identifier:"other"),signature(application:"other"),signature(groups:[]),signature(groups:[identity.group,"other"]),signature(flags:0),signature(flags:0x10002)]{refuse{try validateCapturedDevelopmentSignature(invalid,role:.daemon,host:true)}}
for key in ["com.apple.security.cs.allow-dyld-environment-variables","com.apple.security.cs.allow-unsigned-executable-memory","com.apple.security.cs.disable-library-validation","com.apple.security.get-task-allow","get-task-allow","com.apple.security.cs.disable-executable-page-protection"] {var bad=entitlements;bad[key]=true;refuse{try validateCapturedDevelopmentSignature(signature(entitlements:bad),role:.daemon,host:true)}}
var wrongType=entitlements;wrongType["com.apple.security.cs.allow-jit"]="true";refuse{try validateCapturedDevelopmentSignature(signature(entitlements:wrongType),role:.daemon,host:true)}
var extraGrant=entitlements;extraGrant["com.apple.security.personal-information.contacts"]=true;refuse{try validateCapturedDevelopmentSignature(signature(entitlements:extraGrant),role:.daemon,host:true)}
try validateCapturedDevelopmentSignature(signature(identifier:"dev.aux.browser.runtime",application:"",groups:[],flags:0,entitlements:[:]),role:.daemon,host:false);checks += 1
refuse{try validateCapturedDevelopmentSignature(signature(identifier:"dev.aux.browser.runtime",application:"",groups:[],flags:0,entitlements:["get-task-allow":false]),role:.daemon,host:false)}
let bundle="/private/tmp/AuxSynthetic.app",host=bundle+"/Contents/MacOS/aux-daemon",runtime=bundle+"/Contents/Resources/native/aux-runtime-owned.node",pdf=bundle+"/"+AuxReviewedDevelopmentPdfIdentity.relativePath
try validateCapturedDevelopmentImagePaths([host,runtime,"/usr/lib/libSystem.B.dylib"],bundle:bundle,policy:contents);checks += 1
refuse{try validateCapturedDevelopmentImagePaths([host,runtime,pdf],bundle:bundle,policy:contents)}
var v2=json;v2["format"]="aux.development.host.policy.v2";v2["pdfModule"]=["path":AuxReviewedDevelopmentPdfIdentity.relativePath,"identifier":AuxReviewedDevelopmentPdfIdentity.identifier,"sha256":AuxReviewedDevelopmentPdfIdentity.sha256,"bytes":AuxReviewedDevelopmentPdfIdentity.bytes]
let pdfPolicy=try AuxDevelopmentPolicyContents.decode(encoded(v2));check(pdfPolicy.includesPdf)
try validateCapturedDevelopmentImagePaths([host,runtime,pdf],bundle:bundle,policy:pdfPolicy);checks += 1
for paths in [[host,runtime],[host,runtime,pdf,pdf],[host,runtime,pdf,"/private/tmp/foreign.node"],[host,runtime,bundle+"/Contents/Resources/native/../native/aux-pdf.node"]] {refuse{try validateCapturedDevelopmentImagePaths(paths,bundle:bundle,policy:pdfPolicy)}}
for (key,value) in [("path","Contents/Resources/native/other.node"),("identifier","other"),("sha256",String(repeating:"0",count:64)),("bytes",true)] as [(String,Any)] {var bad=v2;var image=bad["pdfModule"] as! [String:Any];image[key]=value;bad["pdfModule"]=image;refuse{_ = try AuxDevelopmentPolicyContents.decode(encoded(bad))}}
var cli=v2;cli["role"]="cli";refuse{_ = try AuxDevelopmentPolicyContents.decode(encoded(cli))}
try validateCapturedDevelopmentPdfSignature(signature(identifier:AuxReviewedDevelopmentPdfIdentity.identifier,application:"",groups:[],flags:0,entitlements:[:]));checks += 1
for invalid in [signature(identifier:"dev.aux.browser.runtime",application:"",groups:[],flags:0,entitlements:[:]),signature(identifier:AuxReviewedDevelopmentPdfIdentity.identifier,team:"OTHERTEAM0",application:"",groups:[],flags:0,entitlements:[:]),signature(identifier:AuxReviewedDevelopmentPdfIdentity.identifier,certificate:String(repeating:"0",count:64),application:"",groups:[],flags:0,entitlements:[:]),signature(identifier:AuxReviewedDevelopmentPdfIdentity.identifier,application:"",groups:[],flags:2,entitlements:[:]),signature(identifier:AuxReviewedDevelopmentPdfIdentity.identifier,application:"",groups:[],flags:0,entitlements:["get-task-allow":false])] {refuse{try validateCapturedDevelopmentPdfSignature(invalid)}}
try validateCapturedDevelopmentPdfBytes(sha256:AuxReviewedDevelopmentPdfIdentity.sha256,bytes:AuxReviewedDevelopmentPdfIdentity.bytes);checks += 1
refuse{try validateCapturedDevelopmentPdfBytes(sha256:String(repeating:"0",count:64),bytes:AuxReviewedDevelopmentPdfIdentity.bytes)}
refuse{try validateCapturedDevelopmentPdfBytes(sha256:AuxReviewedDevelopmentPdfIdentity.sha256,bytes:AuxReviewedDevelopmentPdfIdentity.bytes-1)}
print("\(checks) public development-policy/signature checks; signed loader, attachment, key imports and Security never executed")
