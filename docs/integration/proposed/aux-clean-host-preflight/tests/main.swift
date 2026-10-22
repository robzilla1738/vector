// Captured synthetic public identity only: never inspect the current signature,
// loaded images, private home, owner state, Security or keys in this fixture.
import Foundation
import CryptoKit
var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
func refuse(_ action:()throws->Void){do{try action();preconditionFailure("invalid policy accepted")}catch{checks += 1}}
let home="/private/tmp/aux-synthetic-policy/aux-state"
let scope=SHA256.hash(data:Data(home.utf8)).map{String(format:"%02x",$0)}.joined()
let executable="/private/tmp/Aux Synthetic.app/Contents/MacOS/aux-daemon"
func policy(role:AuxCleanHostPolicy.Role = .daemon,team:String="TESTTEAM01",identifier:String="dev.aux.browser.daemon",application:String="TESTTEAM01.dev.aux.browser.daemon",group:String="TESTTEAM01.dev.aux.browser.cryptography",path:String=executable,hash:String=String(repeating:"1",count:40),parent:String="/private/tmp/aux-synthetic-policy",home:String=home,scope:String=scope,images:[String:String]=[executable:String(repeating:"2",count:64)]) -> AuxCleanHostPolicy {
    .init(role:role,teamIdentifier:team,signingIdentifier:identifier,applicationIdentifier:application,accessGroup:group,executablePath:path,cdHash:hash,privateParent:parent,canonicalDisposableHome:home,scope:scope,imageSha256:images)
}
let reviewed=policy();try reviewed.validate();checks += 1
func captured(path:String=executable,identifier:String="dev.aux.browser.daemon",team:String="TESTTEAM01",application:String="TESTTEAM01.dev.aux.browser.daemon",groups:[String]=["TESTTEAM01.dev.aux.browser.cryptography"],hash:String=String(repeating:"1",count:40),runtime:Bool=true,adHoc:Bool=false,insecure:Bool=false)->CapturedAuxHostIdentity {
    .init(executablePath:path,signingIdentifier:identifier,teamIdentifier:team,applicationIdentifier:application,accessGroups:groups,cdHash:hash,hardenedRuntime:runtime,adHoc:adHoc,insecureEntitlement:insecure)
}
try validateCapturedAuxHostIdentity(captured(),policy:reviewed);checks += 1
for bad in [policy(team:"wrong"),policy(role:.cli),policy(identifier:"at.studio.AsideBrowser.daemon"),policy(application:"TESTTEAM01.other"),policy(group:"TESTTEAM01.dev.aux.*"),policy(group:"8CPD4K4TBB.at.studio.AsideBrowser.cryptography"),policy(path:"relative"),policy(hash:String(repeating:"a",count:39)),policy(parent:"/Users/owner/.aux"),policy(home:"/Users/owner/.aux"),policy(scope:String(repeating:"0",count:64)),policy(images:[:]),policy(images:[executable:"INVALID"]),policy(images:[executable:String(repeating:"2",count:64),"/private/tmp/libaux-native-boundary.dylib":String(repeating:"3",count:64)])] {refuse{try bad.validate()}}
for bad in [captured(path:"/other/aux-daemon"),captured(identifier:"other"),captured(team:"OTHERTEAM0"),captured(application:"TESTTEAM01.other"),captured(groups:[]),captured(groups:[reviewed.accessGroup,"other"]),captured(hash:String(repeating:"0",count:40)),captured(runtime:false),captured(adHoc:true),captured(insecure:true)]{refuse{try validateCapturedAuxHostIdentity(bad,policy:reviewed)}}
check(try reviewed.policySha256==reviewed.policySha256)
check(try reviewed.policySha256 != policy(hash:String(repeating:"2",count:40)).policySha256)
print("\(checks) captured public policy/identity checks; actual host inspector and Security execution not invoked")
