// Bounded development identity, not a production-policy override or admission.
import Foundation
import CryptoKit
import Security

enum AuxFreshBootstrapPolicyError:Error {case identity,policy,signature(OSStatus),resource,path,image,scope}
enum AuxFreshBootstrapIdentity {
    static let team="9F2JXY8TCK"
    static let leafCertificateSha256="ff0293a06f20704a1f3b3f2571b3362ef439a2dfb3b0bc90bcf3d5debfc73a1c"
    static let historicalHome="/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T/aux-provided-dp-approval-mqbKLj"
    static let resource="AuxFreshBootstrapPolicy.json"
    static let resourceRelative="Resources/"+resource // SecCode resource base is Contents.
}
func freshBootstrapDigest(_ bytes:Data)->String{SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()}
enum AuxFreshBootstrapPdfIdentity {
    static let relativePath="Contents/Resources/native/aux-pdf.node"
    static let identifier="dev.aux.browser.pdf"
    static let sha256="ed5b4faec15d3fc3c29a97f0dd304b388844cf0bf16fad5a69a62b357a52dcc0"
    static let bytes=9_474_752
    static func validate(_ value:Any?)throws {
        guard let object=value as? [String:Any],Set(object.keys)==["path","identifier","sha256","bytes"],
              object["path"] as? String==relativePath,object["identifier"] as? String==identifier,object["sha256"] as? String==sha256,
              let count=object["bytes"] as? NSNumber,CFGetTypeID(count) != CFBooleanGetTypeID(),count.doubleValue==Double(bytes) else{throw AuxFreshBootstrapPolicyError.policy}
    }
}
enum AuxFreshBootstrapMacUtilitiesIdentity {
    static let relativePath="Contents/Resources/native/aux-macos-utilities.node"
    static let identifier="dev.aux.browser.macos-utilities"
    // Actual retained unsigned production build; signing requires a new review.
    static let sha256="7aff7611505145a5629cf42496be506200e7c1026087b2e397057e646d220e5e"
    static let bytes=393_720
    static func validate(_ value:Any?)throws {
        guard let object=value as? [String:Any],Set(object.keys)==["path","identifier","sha256","bytes"],
              object["path"] as? String==relativePath,object["identifier"] as? String==identifier,object["sha256"] as? String==sha256,
              let count=object["bytes"] as? NSNumber,CFGetTypeID(count) != CFBooleanGetTypeID(),count.doubleValue==Double(bytes) else{throw AuxFreshBootstrapPolicyError.policy}
    }
}
// A pre-generation resource contract. Decoding content grants no authority.
struct AuxFreshBootstrapPolicyContents {
    enum Role:String {case daemon,cli
        var identifier:String{self == .daemon ? "dev.aux.browser.daemon":"dev.aux.browser.cli"}
        var executable:String{self == .daemon ? "aux-daemon":"aux-cli"}
    }
    static let format="aux.fresh.bootstrap.policy.v1"
    static let authoritySelection="aux.fresh.authority.host-availability.v1"
    let role:Role
    let canonicalPrivateParent:String
    let accessGroup:String
    var includesPdf:Bool{role == .daemon}
    var includesMacUtilities:Bool{role == .daemon}
    var pdfSha256:String{AuxFreshBootstrapPdfIdentity.sha256}
    var pdfBytes:Int{AuxFreshBootstrapPdfIdentity.bytes}
    static func validAccessGroup(_ group:String)->Bool {
        let prefix=AuxFreshBootstrapIdentity.team+".dev.aux."
        guard group.hasPrefix(prefix),group.utf8.count<=200 else{return false}
        let suffix=group.dropFirst(prefix.count)
        return !suffix.isEmpty && suffix.utf8.allSatisfy{($0>=97 && $0<=122) || ($0>=48 && $0<=57) || $0==46 || $0==45}
    }
    static func decode(_ bytes:Data)throws->Self {
        let object=try strictEnvelopeObject(bytes)
        guard let roleText=object["role"] as? String,let role=Role(rawValue:roleText) else{throw AuxFreshBootstrapPolicyError.policy}
        var keys:Set<String>=["format","role","canonicalPrivateParent","accessGroup","authoritySelection"]
        if role == .daemon {keys.formUnion(["pdfModule","macOSUtilitiesModule"]);try AuxFreshBootstrapPdfIdentity.validate(object["pdfModule"]);try AuxFreshBootstrapMacUtilitiesIdentity.validate(object["macOSUtilitiesModule"])}
        guard Set(object.keys)==keys,object["format"] as? String==format,object["authoritySelection"] as? String==authoritySelection,
              let parent=object["canonicalPrivateParent"] as? String,parent.hasPrefix("/"),parent != "/",parent.utf8.count<=4096,!parent.utf8.contains(0),URL(fileURLWithPath:parent).standardizedFileURL.path==parent,
              parent != AuxFreshBootstrapIdentity.historicalHome,!parent.hasPrefix(AuxFreshBootstrapIdentity.historicalHome+"/"),
              let group=object["accessGroup"] as? String,validAccessGroup(group) else{throw AuxFreshBootstrapPolicyError.policy}
        return .init(role:role,canonicalPrivateParent:parent,accessGroup:group)
    }
}
struct AuxCapturedFreshBootstrapSignature {
    let identifier:String;let team:String;let certificateSha256:String
    let applicationIdentifier:String;let accessGroups:[String];let flags:UInt32
    let entitlements:[String:Any]
}
func validateCapturedFreshBootstrapSignature(_ captured:AuxCapturedFreshBootstrapSignature,role:AuxFreshBootstrapPolicyContents.Role,host:Bool,accessGroup:String)throws {
    guard captured.team==AuxFreshBootstrapIdentity.team,captured.certificateSha256==AuxFreshBootstrapIdentity.leafCertificateSha256,
          captured.identifier==(host ? role.identifier:"dev.aux.browser.runtime"),captured.flags & 0x2==0 else{throw AuxFreshBootstrapPolicyError.identity}
    if host {
        guard captured.applicationIdentifier==AuxFreshBootstrapIdentity.team+"."+role.identifier,AuxFreshBootstrapPolicyContents.validAccessGroup(accessGroup),captured.accessGroups==[accessGroup],captured.flags & 0x10000 != 0 else{throw AuxFreshBootstrapPolicyError.identity}
        let allowed:Set<String>=["com.apple.application-identifier","com.apple.developer.team-identifier","keychain-access-groups","com.apple.security.cs.allow-jit","com.apple.security.cs.allow-dyld-environment-variables","com.apple.security.cs.allow-unsigned-executable-memory","com.apple.security.cs.disable-library-validation","com.apple.security.cs.disable-executable-page-protection","com.apple.security.get-task-allow","get-task-allow"]
        guard Set(captured.entitlements.keys).isSubset(of:allowed)else{throw AuxFreshBootstrapPolicyError.identity}
        if let team=captured.entitlements["com.apple.developer.team-identifier"] {guard team as? String==AuxFreshBootstrapIdentity.team else{throw AuxFreshBootstrapPolicyError.identity}}
        for key in allowed.subtracting(["com.apple.application-identifier","com.apple.developer.team-identifier","keychain-access-groups"]) {
            if let value=captured.entitlements[key] {guard CFGetTypeID(value as CFTypeRef)==CFBooleanGetTypeID(),let boolean=value as? NSNumber,key=="com.apple.security.cs.allow-jit" || !boolean.boolValue else{throw AuxFreshBootstrapPolicyError.identity}}
        }
    } else {guard captured.entitlements.isEmpty else{throw AuxFreshBootstrapPolicyError.identity}}
}

// Pure captured snapshot validation. No signature, image loading or owner call.
func freshBootstrapExpectedImageIdentifiers(bundle:String,policy:AuxFreshBootstrapPolicyContents)->[String:String] {
    var result=[bundle+"/Contents/MacOS/"+policy.role.executable:policy.role.identifier,bundle+"/Contents/Resources/native/aux-runtime-owned.node":"dev.aux.browser.runtime"]
    if policy.includesPdf {result[bundle+"/"+AuxFreshBootstrapPdfIdentity.relativePath]=AuxFreshBootstrapPdfIdentity.identifier}
    if policy.includesMacUtilities {result[bundle+"/"+AuxFreshBootstrapMacUtilitiesIdentity.relativePath]=AuxFreshBootstrapMacUtilitiesIdentity.identifier}
    return result
}
func validateCapturedFreshBootstrapImagePaths(_ paths:[String],bundle:String,policy:AuxFreshBootstrapPolicyContents)throws {
    let expected=freshBootstrapExpectedImageIdentifiers(bundle:bundle,policy:policy);var observed=Set<String>()
    guard !paths.isEmpty,paths.count<=4096 else{throw AuxFreshBootstrapPolicyError.image}
    for path in paths {
        guard path.hasPrefix("/"),URL(fileURLWithPath:path).standardizedFileURL.path==path else{throw AuxFreshBootstrapPolicyError.image}
        if path.hasPrefix("/System/Library/") || path.hasPrefix("/usr/lib/"){continue}
        guard expected[path] != nil,observed.insert(path).inserted else{throw AuxFreshBootstrapPolicyError.image}
    }
    guard observed==Set(expected.keys)else{throw AuxFreshBootstrapPolicyError.image}
}
func validateCapturedFreshBootstrapPdfSignature(_ captured:AuxCapturedFreshBootstrapSignature)throws {
    guard captured.team==AuxFreshBootstrapIdentity.team,captured.certificateSha256==AuxFreshBootstrapIdentity.leafCertificateSha256,
          captured.identifier==AuxFreshBootstrapPdfIdentity.identifier,captured.flags & 0x2==0,captured.entitlements.isEmpty,
          captured.applicationIdentifier.isEmpty,captured.accessGroups.isEmpty else{throw AuxFreshBootstrapPolicyError.identity}
}
func validateCapturedFreshBootstrapPdfBytes(sha256:String,bytes:Int,policy:AuxFreshBootstrapPolicyContents)throws {
    guard policy.includesPdf,sha256==policy.pdfSha256,bytes==policy.pdfBytes else{throw AuxFreshBootstrapPolicyError.image}
}

func validateCapturedFreshBootstrapMacUtilitySignature(_ captured:AuxCapturedFreshBootstrapSignature)throws {
    guard captured.team==AuxFreshBootstrapIdentity.team,captured.certificateSha256==AuxFreshBootstrapIdentity.leafCertificateSha256,
          captured.identifier==AuxFreshBootstrapMacUtilitiesIdentity.identifier,captured.flags & 0x2==0,captured.entitlements.isEmpty,
          captured.applicationIdentifier.isEmpty,captured.accessGroups.isEmpty else{throw AuxFreshBootstrapPolicyError.identity}
}
func validateCapturedFreshBootstrapMacUtilityBytes(sha256:String,bytes:Int,policy:AuxFreshBootstrapPolicyContents)throws {
    guard policy.includesMacUtilities,sha256==AuxFreshBootstrapMacUtilitiesIdentity.sha256,bytes==AuxFreshBootstrapMacUtilitiesIdentity.bytes else{throw AuxFreshBootstrapPolicyError.image}
}
