// Public synthetic pairing ONLY. No actual collector, Security or key imports.
import Foundation
import CryptoKit
var checks=0
func refuse(_ action:()throws->Void){do{try action();preconditionFailure("bad pairing accepted")}catch{checks += 1}}
let home="/private/tmp/aux-synthetic-pairing/aux-state"
let scope=SHA256.hash(data:Data(home.utf8)).map{String(format:"%02x",$0)}.joined()
let group="TESTTEAM01.dev.aux.browser.cryptography",executable="/private/tmp/Aux.app/Contents/MacOS/aux-daemon"
func policy(role:AuxCleanHostPolicy.Role = .daemon,identifier:String="dev.aux.browser.daemon",scope:String=scope,group:String=group)->AuxCleanHostPolicy {
    .init(role:role,teamIdentifier:"TESTTEAM01",signingIdentifier:identifier,applicationIdentifier:"TESTTEAM01."+identifier,accessGroup:group,executablePath:executable,cdHash:String(repeating:"1",count:40),privateParent:"/private/tmp/aux-synthetic-pairing",canonicalDisposableHome:home,scope:scope,imageSha256:[executable:String(repeating:"2",count:64)])
}
// These are encoding-shaped public bytes, not a claimed cryptographic authority.
let publicEncoding=Data([4])+Data(repeating:0,count:64)
func selection(scope:String=scope,group:String=group)throws->AuxRuntimeSelection {
    try .init(scope:scope,generationId:"546178A9-F6B7-4B7C-B9ED-B85703F12861",accessGroup:group,scheme:"p256_v1",signingPublicKey:publicEncoding,kemPublicKey:publicEncoding,targetHashes:Dictionary(uniqueKeysWithValues:AuxRuntimeSelection.roles.map{($0,String(repeating:"3",count:64))}))
}
try AuxCleanRuntimeHostContext.validatePairing(policy:policy(),selection:selection());checks += 1
try AuxCleanRuntimeHostContext.validatePairing(policy:policy(role:.cli,identifier:"dev.aux.browser.cli"),selection:selection());checks += 1
refuse{try AuxCleanRuntimeHostContext.validatePairing(policy:policy(),selection:selection(scope:String(repeating:"4",count:64)))}
refuse{try AuxCleanRuntimeHostContext.validatePairing(policy:policy(),selection:selection(group:"TESTTEAM01.dev.aux.other"))}
refuse{try AuxCleanRuntimeHostContext.validatePairing(policy:policy(role:.migration,identifier:"dev.aux.browser.installation-migration"),selection:selection())}
refuse{try AuxCleanRuntimeHostContext.validatePairing(policy:policy(scope:String(repeating:"4",count:64)),selection:selection())}
refuse{try AuxCleanRuntimeHostContext.validatePairing(policy:policy(group:"TESTTEAM01.dev.aux.*"),selection:selection())}
print("\(checks) public pairing checks; actual preflight, target capture, private context and Security never invoked")
