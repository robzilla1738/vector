// Pure decoding/captured-signature checks. No Security calls, policy installation or module load.
import Foundation
func expect(_ condition:Bool,_ message:String){precondition(condition,message)}
func artifact(_ path:String,_ identifier:String,_ source:String)->[String:Any]{
    ["path":path,"identifier":identifier,"sourceSha256":source,"architecture":"arm64","sha256":String(repeating:"1",count:64),"bytes":200000]
}
func policy(_ version:Int,_ source:String?=nil)->[String:Any]{
    var p:[String:Any] = ["format":"aux.fresh.bootstrap.policy.v\(version)","role":"daemon","canonicalPrivateParent":"/private/tmp/aux-policy-parser-fixture","accessGroup":"9F2JXY8TCK.dev.aux.policy-fixture","authoritySelection":AuxFreshBootstrapPolicyContents.authoritySelection,
    "pdfModule":["path":AuxFreshBootstrapPdfIdentity.relativePath,"identifier":AuxFreshBootstrapPdfIdentity.identifier,"sha256":AuxFreshBootstrapPdfIdentity.sha256,"bytes":AuxFreshBootstrapPdfIdentity.bytes],
    "macOSUtilitiesModule":["path":AuxFreshBootstrapMacUtilitiesIdentity.relativePath,"identifier":AuxFreshBootstrapMacUtilitiesIdentity.identifier,"sha256":AuxFreshBootstrapMacUtilitiesIdentity.sha256,"bytes":AuxFreshBootstrapMacUtilitiesIdentity.bytes]]
    if version>=2 {p["nativeHostLayout"]="embedded-daemon"}
    if version>=3 {
        p["ptyModule"]=artifact(AuxFreshBootstrapPtyArtifacts.modulePath,AuxFreshBootstrapPtyArtifacts.moduleIdentifier,source ?? (version>=6 ? AuxFreshBootstrapPtyArtifacts.containedModuleSourceSha256 : (version==3 ? AuxFreshBootstrapPtyArtifacts.moduleSourceSha256:AuxFreshBootstrapPtyArtifacts.rebuiltModuleSourceSha256)))
        p["ptySpawnHelper"]=artifact(AuxFreshBootstrapPtyArtifacts.helperPath,AuxFreshBootstrapPtyArtifacts.helperIdentifier,AuxFreshBootstrapPtyArtifacts.helperSourceSha256)
    }; if version>=5 {p["canonicalTaskParent"]="/private/tmp/aux-task-parser-fixture";p["taskLayout"]="aux.native.task-control-split.v1"}; if version>=7 {p["browserStartup"]=["format":version==8 ? "aux.browser.recoverable-root-lease.v2":"aux.browser.fresh-root-lease.v1","dataRoot":"/private/tmp/aux-browser-data-fixture","cacheRoot":"/private/tmp/aux-browser-cache-fixture"]}; return p
}
func decode(_ value:[String:Any])throws->AuxFreshBootstrapPolicyContents {try AuxFreshBootstrapPolicyContents.decode(JSONSerialization.data(withJSONObject:value,options:.sortedKeys))}
func refused(_ value:[String:Any])->Bool {do{_ = try decode(value);return false}catch{return true}}
for version in 1...8 {
    let parsed=try decode(policy(version))
    expect(parsed.embeddedDaemon == (version>=2),"embedded legacy semantics")
    expect((parsed.ptyArtifacts != nil) == (version>=3),"PTY legacy semantics")
    expect(parsed.includesRebuiltPtyModule == (version>=4),"rebuilt marker")
    var routeAccepted=false
    do{try validateFreshBootstrapRebuiltDaemonRoute(parsed);routeAccepted=true}catch{}
    expect(routeAccepted == (version==8),"successor daemon route refuses all historical module policies before loading")
}
expect(refused(policy(3,AuxFreshBootstrapPtyArtifacts.rebuiltModuleSourceSha256)),"v3 cannot relabel rebuilt source")
expect(refused(policy(4,AuxFreshBootstrapPtyArtifacts.moduleSourceSha256)),"v4 cannot select original untracked module")
var unchanged=policy(4);var module=unchanged["ptyModule"] as! [String:Any]
module["sha256"]=AuxFreshBootstrapPtyArtifacts.rebuiltModuleSourceSha256;unchanged["ptyModule"]=module
expect(refused(unchanged),"unsigned source hash is not signed output")
var unknown=policy(4);unknown["unexpected"]="field";expect(refused(unknown),"unknown keys refused")
var cli=policy(4);cli["role"]="cli";expect(refused(cli),"v4 remains embedded daemon only")
expect(refused(policy(6,AuxFreshBootstrapPtyArtifacts.rebuiltModuleSourceSha256)),"v6 cannot admit old uncontained PTY")
let parsed=try decode(policy(6));let item=parsed.ptyArtifacts!.module
let captured=AuxCapturedFreshBootstrapSignature(identifier:item.identifier,team:AuxFreshBootstrapIdentity.team,certificateSha256:AuxFreshBootstrapIdentity.leafCertificateSha256,applicationIdentifier:"",accessGroups:[],flags:0x10002,entitlements:[:])
do {try validateCapturedFreshBootstrapPtySignature(captured,artifact:item);preconditionFailure("ad hoc signature admitted")}catch{}
var overlap=policy(7);overlap["browserStartup"]=["format":"aux.browser.fresh-root-lease.v1","dataRoot":"/private/tmp/aux-policy-parser-fixture/nested","cacheRoot":"/private/tmp/cache"]
expect(refused(overlap),"browser root/control overlap refused")
var missing=policy(7);missing.removeValue(forKey:"browserStartup");expect(refused(missing),"v7 missing root grant refused")
print("PASS: v1-v8 decode, v8-only current daemon route, source-version separation, unchanged-source/unknown-key/CLI refusal and ad-hoc captured-signature refusal; no live Security or module execution")

var wrongFormat=policy(8);wrongFormat["browserStartup"]=["format":"aux.browser.fresh-root-lease.v1","dataRoot":"/private/tmp/data","cacheRoot":"/private/tmp/cache"];expect(refused(wrongFormat),"v8 refuses v1 marker contract")
