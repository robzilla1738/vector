// Bounded development identity, not a production-policy override or admission.
import Foundation
import CryptoKit
import Security

enum AuxDevelopmentHostError:Error {case identity,policy,signature(OSStatus),resource,path,image,scope}
enum AuxReviewedDevelopmentIdentity {
    static let team="9F2JXY8TCK"
    static let leafCertificateSha256="ff0293a06f20704a1f3b3f2571b3362ef439a2dfb3b0bc90bcf3d5debfc73a1c"
    static let home="/private/var/folders/98/j36zgdnd0h507whjl16gxl780000gp/T/aux-provided-dp-approval-mqbKLj"
    static let scope="dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476"
    static let group=team+".dev.aux.dp."+scope
    static let resource="AuxDevelopmentHostPolicy.json"
    static let resourceRelative="Resources/"+resource // SecCode resource base is Contents.
}
func developmentDigest(_ bytes:Data)->String{SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()}
enum AuxReviewedDevelopmentPdfIdentity {
    // Reviewed unsigned engine bytes. Any later signing changes require a new
    // reviewed immutable pin; this is not permission to sign or admit that image.
    static let relativePath="Contents/Resources/native/aux-pdf.node"
    static let identifier="dev.aux.browser.pdf"
    static let sha256="6febb242a074317dba3edc1848fdfb77da468e32bb87acffdaa7f6143afece8e"
    static let bytes=9_457_632
    static func validate(_ value:Any?)throws {
        guard let object=value as? [String:Any],Set(object.keys)==["path","identifier","sha256","bytes"],
              object["path"] as? String==relativePath,object["identifier"] as? String==identifier,object["sha256"] as? String==sha256,
              let count=object["bytes"] as? NSNumber,CFGetTypeID(count) != CFBooleanGetTypeID(),count.doubleValue==Double(bytes) else{throw AuxDevelopmentHostError.policy}
    }
}
struct AuxDevelopmentPolicyContents {
    enum Role:String {case daemon,cli
        var identifier:String{self == .daemon ? "dev.aux.browser.daemon":"dev.aux.browser.cli"}
        var executable:String{self == .daemon ? "aux-daemon":"aux-cli"}
    }
    let role:Role
    let selection:AuxRuntimeSelection
    let logicalKeys:ImmutableAuxLogicalKeyPolicy
    let includesPdf:Bool
    // Only content validation. Possessing this value cannot create a sealed
    // policy, observation or owner; the actual loader authenticates exact bytes.
    static func decode(_ bytes:Data)throws->Self {
        let object=try strictEnvelopeObject(bytes)
        let format=object["format"] as? String,includesPdf=format=="aux.development.host.policy.v2"
        var expectedKeys:Set<String>=["format","role","home","scope","accessGroup","generationId","scheme","signingPublicKey","kemPublicKey","targetHashes","logicalKeys"]
        if includesPdf {expectedKeys.insert("pdfModule");try AuxReviewedDevelopmentPdfIdentity.validate(object["pdfModule"])}
        guard Set(object.keys)==expectedKeys,(format=="aux.development.host.policy.v1" || includesPdf),let roleText=object["role"] as? String,let role=Role(rawValue:roleText),(!includesPdf || role == .daemon),
              object["home"] as? String==AuxReviewedDevelopmentIdentity.home,object["scope"] as? String==AuxReviewedDevelopmentIdentity.scope,
              object["accessGroup"] as? String==AuxReviewedDevelopmentIdentity.group,
              developmentDigest(Data(AuxReviewedDevelopmentIdentity.home.utf8))==AuxReviewedDevelopmentIdentity.scope,
              let generation=object["generationId"] as? String,let scheme=object["scheme"] as? String,let hashes=object["targetHashes"] as? [String:String],
              let keys=object["logicalKeys"] as? [String],!keys.isEmpty,keys.count<=128,Set(keys).count==keys.count,Set(keys.map{Data($0.utf8)}).count==keys.count else{throw AuxDevelopmentHostError.policy}
        func publicKey(_ name:String)throws->Data{guard let text=object[name] as? String,let value=Data(base64Encoded:text),value.base64EncodedString()==text else{throw AuxDevelopmentHostError.policy};return value}
        let selection=try AuxRuntimeSelection(scope:AuxReviewedDevelopmentIdentity.scope,generationId:generation,accessGroup:AuxReviewedDevelopmentIdentity.group,scheme:scheme,signingPublicKey:publicKey("signingPublicKey"),kemPublicKey:publicKey("kemPublicKey"),targetHashes:hashes)
        return try .init(role:role,selection:selection,logicalKeys:ImmutableAuxLogicalKeyPolicy(allowedLogicalKeys:Set(keys)),includesPdf:includesPdf)
    }
}
struct AuxCapturedDevelopmentSignature {
    let identifier:String;let team:String;let certificateSha256:String
    let applicationIdentifier:String;let accessGroups:[String];let flags:UInt32
    let entitlements:[String:Any]
}
func validateCapturedDevelopmentSignature(_ captured:AuxCapturedDevelopmentSignature,role:AuxDevelopmentPolicyContents.Role,host:Bool)throws {
    guard captured.team==AuxReviewedDevelopmentIdentity.team,captured.certificateSha256==AuxReviewedDevelopmentIdentity.leafCertificateSha256,
          captured.identifier==(host ? role.identifier:"dev.aux.browser.runtime"),captured.flags & 0x2==0 else{throw AuxDevelopmentHostError.identity}
    if host {
        guard captured.applicationIdentifier==AuxReviewedDevelopmentIdentity.team+"."+role.identifier,captured.accessGroups==[AuxReviewedDevelopmentIdentity.group],captured.flags & 0x10000 != 0 else{throw AuxDevelopmentHostError.identity}
        let allowed:Set<String>=["com.apple.application-identifier","com.apple.developer.team-identifier","keychain-access-groups","com.apple.security.cs.allow-jit","com.apple.security.cs.allow-dyld-environment-variables","com.apple.security.cs.allow-unsigned-executable-memory","com.apple.security.cs.disable-library-validation","com.apple.security.cs.disable-executable-page-protection","com.apple.security.get-task-allow","get-task-allow"]
        guard Set(captured.entitlements.keys).isSubset(of:allowed)else{throw AuxDevelopmentHostError.identity}
        if let team=captured.entitlements["com.apple.developer.team-identifier"] {guard team as? String==AuxReviewedDevelopmentIdentity.team else{throw AuxDevelopmentHostError.identity}}
        for key in allowed.subtracting(["com.apple.application-identifier","com.apple.developer.team-identifier","keychain-access-groups"]) {
            if let value=captured.entitlements[key] {guard CFGetTypeID(value as CFTypeRef)==CFBooleanGetTypeID(),let boolean=value as? NSNumber,key=="com.apple.security.cs.allow-jit" || !boolean.boolValue else{throw AuxDevelopmentHostError.identity}}
        }
    } else {guard captured.entitlements.isEmpty else{throw AuxDevelopmentHostError.identity}}
}

// Pure captured snapshot validation. No signature, image loading or owner call.
func developmentExpectedImageIdentifiers(bundle:String,policy:AuxDevelopmentPolicyContents)->[String:String] {
    var result=[bundle+"/Contents/MacOS/"+policy.role.executable:policy.role.identifier,bundle+"/Contents/Resources/native/aux-runtime-owned.node":"dev.aux.browser.runtime"]
    if policy.includesPdf {result[bundle+"/"+AuxReviewedDevelopmentPdfIdentity.relativePath]=AuxReviewedDevelopmentPdfIdentity.identifier}
    return result
}
func validateCapturedDevelopmentImagePaths(_ paths:[String],bundle:String,policy:AuxDevelopmentPolicyContents)throws {
    let expected=developmentExpectedImageIdentifiers(bundle:bundle,policy:policy);var observed=Set<String>()
    guard !paths.isEmpty,paths.count<=4096 else{throw AuxDevelopmentHostError.image}
    for path in paths {
        guard path.hasPrefix("/"),URL(fileURLWithPath:path).standardizedFileURL.path==path else{throw AuxDevelopmentHostError.image}
        if path.hasPrefix("/System/Library/") || path.hasPrefix("/usr/lib/"){continue}
        guard expected[path] != nil,observed.insert(path).inserted else{throw AuxDevelopmentHostError.image}
    }
    guard observed==Set(expected.keys)else{throw AuxDevelopmentHostError.image}
}
func validateCapturedDevelopmentPdfSignature(_ captured:AuxCapturedDevelopmentSignature)throws {
    guard captured.team==AuxReviewedDevelopmentIdentity.team,captured.certificateSha256==AuxReviewedDevelopmentIdentity.leafCertificateSha256,
          captured.identifier==AuxReviewedDevelopmentPdfIdentity.identifier,captured.flags & 0x2==0,captured.entitlements.isEmpty,
          captured.applicationIdentifier.isEmpty,captured.accessGroups.isEmpty else{throw AuxDevelopmentHostError.identity}
}
func validateCapturedDevelopmentPdfBytes(sha256:String,bytes:Int)throws {
    guard sha256==AuxReviewedDevelopmentPdfIdentity.sha256,bytes==AuxReviewedDevelopmentPdfIdentity.bytes else{throw AuxDevelopmentHostError.image}
}
