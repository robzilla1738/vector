import Foundation
var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
func refuse(_ block:()throws->Void){do{try block();preconditionFailure("invalid v3 policy accepted")}catch{checks += 1}}
func encode(_ object:[String:Any])throws->Data{try JSONSerialization.data(withJSONObject:object,options:[.sortedKeys])}
let identity=AuxReviewedDevelopmentIdentity.self,key=(Data([4])+Data(repeating:0,count:64)).base64EncodedString()
let pdf:[String:Any]=["path":AuxReviewedDevelopmentPdfIdentity.relativePath,"identifier":AuxReviewedDevelopmentPdfIdentity.identifier,"sha256":AuxReviewedDevelopmentPdfV3Identity.sha256,"bytes":AuxReviewedDevelopmentPdfV3Identity.bytes]
var json:[String:Any]=["format":"aux.development.host.policy.v3","role":"daemon","home":identity.home,"scope":identity.scope,"accessGroup":identity.group,"generationId":"B2A0464D-388A-4BA8-B55F-502465DCA50C","scheme":"p256_v1","signingPublicKey":key,"kemPublicKey":key,"targetHashes":Dictionary(uniqueKeysWithValues:AuxRuntimeSelection.roles.map{($0,String(repeating:"1",count:64))}),"sourceKnownFamiliesV2":AuxSourceKnownLogicalKeyFamilies.format,"pdfModule":pdf]
let daemon=try AuxDevelopmentPolicyContents.decode(encode(json));check(daemon.includesPdf && daemon.usesSourceKnownFamiliesV2);check(daemon.logicalKeys.sha256==ImmutableAuxLogicalKeyPolicy.sourceKnownV2().sha256)
let bundle="/private/tmp/AuxSynthetic.app",host=bundle+"/Contents/MacOS/aux-daemon",runtime=bundle+"/Contents/Resources/native/aux-runtime-owned.node",image=bundle+"/"+AuxReviewedDevelopmentPdfIdentity.relativePath
try validateCapturedDevelopmentImagePaths([host,runtime,image],bundle:bundle,policy:daemon);checks += 1
try validateCapturedDevelopmentPdfBytes(sha256:AuxReviewedDevelopmentPdfV3Identity.sha256,bytes:AuxReviewedDevelopmentPdfV3Identity.bytes,policy:daemon);checks += 1
refuse{try validateCapturedDevelopmentPdfBytes(sha256:AuxReviewedDevelopmentPdfIdentity.sha256,bytes:AuxReviewedDevelopmentPdfIdentity.bytes,policy:daemon)}
var cli=json;cli["role"]="cli";cli.removeValue(forKey:"pdfModule");let cliPolicy=try AuxDevelopmentPolicyContents.decode(encode(cli));check(!cliPolicy.includesPdf && cliPolicy.usesSourceKnownFamiliesV2);check(cliPolicy.logicalKeys.sha256==daemon.logicalKeys.sha256)
for changes in [["sourceKnownFamiliesV2":"other"],["sourceKnownFamiliesV2":true],["logicalKeys":["arbitrary"]]] as [[String:Any]] {var bad=json;for(k,v) in changes{bad[k]=v};refuse{_ = try AuxDevelopmentPolicyContents.decode(encode(bad))}}
var missing=json;missing.removeValue(forKey:"pdfModule");refuse{_ = try AuxDevelopmentPolicyContents.decode(encode(missing))}
var cliPdf=cli;cliPdf["pdfModule"]=pdf;refuse{_ = try AuxDevelopmentPolicyContents.decode(encode(cliPdf))}
var v2=json;v2["format"]="aux.development.host.policy.v2";v2.removeValue(forKey:"sourceKnownFamiliesV2");v2["logicalKeys"]=["fixture"];v2["pdfModule"]=["path":AuxReviewedDevelopmentPdfIdentity.relativePath,"identifier":AuxReviewedDevelopmentPdfIdentity.identifier,"sha256":AuxReviewedDevelopmentPdfIdentity.sha256,"bytes":AuxReviewedDevelopmentPdfIdentity.bytes]
let old=try AuxDevelopmentPolicyContents.decode(encode(v2));check(!old.usesSourceKnownFamiliesV2 && old.pdfSha256==AuxReviewedDevelopmentPdfIdentity.sha256)
v2["pdfModule"]=pdf;refuse{_ = try AuxDevelopmentPolicyContents.decode(encode(v2))}
print("\(checks) changed v3 sealed-policy checks; fixed native family selection and distinct v2/v3 PDF pins. No loader/factory/Security/OS execution.")
