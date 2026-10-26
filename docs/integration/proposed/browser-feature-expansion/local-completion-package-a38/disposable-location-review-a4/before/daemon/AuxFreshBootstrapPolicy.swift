// Bounded development identity, not a production-policy override or admission.
import Foundation
import CryptoKit
import Security
import Darwin

// Native OS facts select these fixed Aux locations; this value alone grants no
// installation, profile, migration, key or writer authority.
struct AuxNativeCurrentUserLocation:Equatable {
    static let format="aux.current-os-user-location.v1"
    let uid:uid_t
    let home:String
    let supportRoot:String
    let dataRoot:String
    let controlRoot:String
    let taskRoot:String
    let cacheRoot:String
    private init(uid:uid_t,home:String,supportRoot:String,dataRoot:String,controlRoot:String,taskRoot:String,cacheRoot:String) {
        self.uid=uid;self.home=home;self.supportRoot=supportRoot;self.dataRoot=dataRoot
        self.controlRoot=controlRoot;self.taskRoot=taskRoot;self.cacheRoot=cacheRoot
    }
    // Pure validation for a captured native home, not a caller-selectable root.
    // Production uses capture() below; tests may exercise these data rules with
    // synthetic paths without consulting or touching a real user's home.
    fileprivate static func deriveFixedRoots(canonicalHome:String,uid:uid_t)throws->Self {
        guard uid != 0,AuxFreshBootstrapPolicyContents.validCanonicalParentSyntax(canonicalHome) else{throw AuxFreshBootstrapPolicyError.path}
        let support=canonicalHome+"/Library/Application Support/Aux Browser"
        let data=support+"/User Data",control=support+"/Control",tasks=support+"/Tasks"
        let cache=canonicalHome+"/Library/Caches/Aux Browser"
        for path in [support,data,control,tasks,cache] {
            guard AuxFreshBootstrapPolicyContents.validCanonicalParentSyntax(path) else{throw AuxFreshBootstrapPolicyError.path}
        }
        return .init(uid:uid,home:canonicalHome,supportRoot:support,dataRoot:data,controlRoot:control,taskRoot:tasks,cacheRoot:cache)
    }
    static func capture()throws->Self {
        let uid=geteuid();guard uid != 0,getuid()==uid else{throw AuxFreshBootstrapPolicyError.identity}
        let suggested=sysconf(_SC_GETPW_R_SIZE_MAX)
        var count=suggested>0 && suggested<=1_048_576 ? Int(suggested):16_384
        while count<=1_048_576 {
            var buffer=[CChar](repeating:0,count:count),entry=passwd()
            var result:UnsafeMutablePointer<passwd>?,named:String?
            let status=buffer.withUnsafeMutableBufferPointer {
                let status=getpwuid_r(uid,&entry,$0.baseAddress,$0.count,&result)
                // Copy the OS string while its actual C storage is retained.
                if status==0,result != nil,entry.pw_uid==uid,let raw=entry.pw_dir {
                    named=String(validatingCString:raw)
                }
                return status
            }
            if status==ERANGE {count *= 2;continue}
            guard status==0,result != nil,entry.pw_uid==uid,let named,
                  AuxFreshBootstrapPolicyContents.validCanonicalParentSyntax(named),
                  let resolved=realpath(named,nil) else{throw AuxFreshBootstrapPolicyError.path}
            defer{free(resolved)}
            let home=String(cString:resolved)
            let fd=open(home,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
            guard fd>=0 else{throw AuxFreshBootstrapPolicyError.path};defer{close(fd)}
            var st=stat()
            guard fstat(fd,&st)==0,(st.st_mode&S_IFMT)==S_IFDIR,st.st_uid==uid,
                  st.st_mode&0o022==0 else{throw AuxFreshBootstrapPolicyError.path}
            return try deriveFixedRoots(canonicalHome:home,uid:uid)
        }
        throw AuxFreshBootstrapPolicyError.path
    }
    func requireCurrent()throws {
        guard try Self.capture()==self else{throw AuxFreshBootstrapPolicyError.identity}
    }
}


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
    var canonicalTaskParent:String?=nil
    var browserStartupRoots:[String]?=nil
    var nativeUserLocation:AuxNativeCurrentUserLocation?=nil
    var browserPreparedRecovery:Bool=false
    var embeddedDaemon:Bool=false
    var ptyArtifacts:AuxFreshBootstrapPtyArtifacts?=nil
    // A successor host must require this before its native PTY capability route.
    var includesRebuiltPtyModule:Bool=false
    var includesContainedPtyModule:Bool=false
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    var includesPdf:Bool{false}
    var includesMacUtilities:Bool{false}
#else
    var includesPdf:Bool{role == .daemon}
    var includesMacUtilities:Bool{role == .daemon}
#endif
    var pdfSha256:String{AuxFreshBootstrapPdfIdentity.sha256}
    var pdfBytes:Int{AuxFreshBootstrapPdfIdentity.bytes}
    static func validAccessGroup(_ group:String)->Bool {
        let prefix=AuxFreshBootstrapIdentity.team+".dev.aux."
        guard group.hasPrefix(prefix),group.utf8.count<=200 else{return false}
        let suffix=group.dropFirst(prefix.count)
        return !suffix.isEmpty && suffix.utf8.allSatisfy{($0>=97 && $0<=122) || ($0>=48 && $0<=57) || $0==46 || $0==45}
    }
    // Lexical validation only. Foundation standardization resolves existing /private
    // aliases on macOS; realpath/retained-FD validation belongs to the signed reader.
    static func validCanonicalParentSyntax(_ parent:String)->Bool {
        guard parent.hasPrefix("/"),parent != "/",parent.utf8.count<=4096,!parent.utf8.contains(0) else{return false}
        return parent.dropFirst().split(separator:"/",omittingEmptySubsequences:false).allSatisfy{!$0.isEmpty && $0 != "." && $0 != ".."}
    }
    static func decode(_ bytes:Data)throws->Self {
        let object=try strictEnvelopeObject(bytes)
        guard let roleText=object["role"] as? String,let role=Role(rawValue:roleText) else{throw AuxFreshBootstrapPolicyError.policy}
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        if object["format"] as? String=="aux.fresh.bootstrap.policy.v9" {
            guard role == .daemon,
                  Set(object.keys)==["format","role","accessGroup","authoritySelection","nativeHostLayout","taskLayout","storageLocation"],
                  object["authoritySelection"] as? String==authoritySelection,
                  object["nativeHostLayout"] as? String=="embedded-daemon",
                  object["taskLayout"] as? String=="aux.native.task-control-split.v1",
                  let group=object["accessGroup"] as? String,validAccessGroup(group),
                  let location=object["storageLocation"] as? [String:Any],Set(location.keys)==["format"],
                  location["format"] as? String==AuxNativeCurrentUserLocation.format else{throw AuxFreshBootstrapPolicyError.policy}
            let native=try AuxNativeCurrentUserLocation.capture()
            return .init(role:role,canonicalPrivateParent:native.controlRoot,accessGroup:group,
                canonicalTaskParent:native.taskRoot,browserStartupRoots:[native.dataRoot,native.cacheRoot],
                nativeUserLocation:native,browserPreparedRecovery:true,embeddedDaemon:true)
        }
#endif
        var keys:Set<String>=["format","role","canonicalPrivateParent","accessGroup","authoritySelection"]
#if !AUX_BROWSER_ONLY_NATIVE_STARTUP
        if role == .daemon {keys.formUnion(["pdfModule","macOSUtilitiesModule"]);try AuxFreshBootstrapPdfIdentity.validate(object["pdfModule"]);try AuxFreshBootstrapMacUtilitiesIdentity.validate(object["macOSUtilitiesModule"])}
#endif
        let recoverable=object["format"] as? String=="aux.fresh.bootstrap.policy.v8"
        let browserStartup=object["format"] as? String=="aux.fresh.bootstrap.policy.v7" || recoverable
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        let containedPty=false
#else
        let containedPty=object["format"] as? String=="aux.fresh.bootstrap.policy.v6" || browserStartup
#endif
        if browserStartup{keys.insert("browserStartup")}
        let splitTask=object["format"] as? String=="aux.fresh.bootstrap.policy.v5" || containedPty || browserStartup
        if splitTask{keys.formUnion(["canonicalTaskParent","taskLayout"])}
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        let rebuiltPty=false,ptyVersion=false
#else
        let rebuiltPty=object["format"] as? String=="aux.fresh.bootstrap.policy.v4" || splitTask
        let ptyVersion=object["format"] as? String=="aux.fresh.bootstrap.policy.v3" || rebuiltPty
#endif
        let pty:AuxFreshBootstrapPtyArtifacts?
        if ptyVersion {pty=try AuxFreshBootstrapPtyArtifacts.decode(object)} else {pty=nil}
        if ptyVersion {keys.formUnion(["ptyModule","ptySpawnHelper"])}
        let embedded=object["format"] as? String=="aux.fresh.bootstrap.policy.v2" || ptyVersion || browserStartup
        if embedded { keys.insert("nativeHostLayout");guard role == .daemon,object["nativeHostLayout"] as? String=="embedded-daemon" else{throw AuxFreshBootstrapPolicyError.policy} }
        guard Set(object.keys)==keys,(embedded || object["format"] as? String==format),object["authoritySelection"] as? String==authoritySelection,
              let parent=object["canonicalPrivateParent"] as? String,validCanonicalParentSyntax(parent),
              parent != AuxFreshBootstrapIdentity.historicalHome,!parent.hasPrefix(AuxFreshBootstrapIdentity.historicalHome+"/"),
              let group=object["accessGroup"] as? String,validAccessGroup(group) else{throw AuxFreshBootstrapPolicyError.policy}
        var taskParent:String?=nil
        if splitTask {
            guard role == .daemon,object["taskLayout"] as? String=="aux.native.task-control-split.v1",
                  let task=object["canonicalTaskParent"] as? String,validCanonicalParentSyntax(task),
                  task != parent,!task.hasPrefix(parent+"/"),!parent.hasPrefix(task+"/"),
                  task != AuxFreshBootstrapIdentity.historicalHome,!task.hasPrefix(AuxFreshBootstrapIdentity.historicalHome+"/") else{throw AuxFreshBootstrapPolicyError.policy}
            taskParent=task
        }
        var browserRoots:[String]?=nil
        if browserStartup {
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
            guard recoverable else{throw AuxFreshBootstrapPolicyError.policy}
            let expectedRootFormat="aux.browser.ordinary-root-lease.v1"
#else
            let expectedRootFormat=recoverable ? "aux.browser.recoverable-root-lease.v2":"aux.browser.fresh-root-lease.v1"
#endif
            guard let b=object["browserStartup"] as? [String:Any],Set(b.keys)==["format","dataRoot","cacheRoot"],
                  b["format"] as? String==expectedRootFormat,
                  let data=b["dataRoot"] as? String,let cache=b["cacheRoot"] as? String,
                  validCanonicalParentSyntax(data),validCanonicalParentSyntax(cache),let taskParent else{throw AuxFreshBootstrapPolicyError.policy}
            let roots=[data,cache,parent,taskParent,AuxFreshBootstrapIdentity.historicalHome]
            for i in roots.indices {for j in roots.indices where i<j {
                guard roots[i] != roots[j],!roots[i].hasPrefix(roots[j]+"/"),!roots[j].hasPrefix(roots[i]+"/") else{throw AuxFreshBootstrapPolicyError.policy}
            }}
            browserRoots=[data,cache]
        }
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        guard recoverable,browserRoots != nil else{throw AuxFreshBootstrapPolicyError.policy}
#endif
        return .init(role:role,canonicalPrivateParent:parent,accessGroup:group,canonicalTaskParent:taskParent,browserStartupRoots:browserRoots,browserPreparedRecovery:recoverable,embeddedDaemon:embedded,ptyArtifacts:pty,includesRebuiltPtyModule:rebuiltPty,includesContainedPtyModule:containedPty)
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
    var result=[bundle+"/Contents/MacOS/"+policy.role.executable:policy.role.identifier]
    if !policy.embeddedDaemon {result[bundle+"/Contents/Resources/native/aux-runtime-owned.node"]="dev.aux.browser.runtime"}
    if policy.includesPdf {result[bundle+"/"+AuxFreshBootstrapPdfIdentity.relativePath]=AuxFreshBootstrapPdfIdentity.identifier}
    if policy.includesMacUtilities {result[bundle+"/"+AuxFreshBootstrapMacUtilitiesIdentity.relativePath]=AuxFreshBootstrapMacUtilitiesIdentity.identifier}
    if policy.ptyArtifacts != nil {result[bundle+"/"+AuxFreshBootstrapPtyArtifacts.modulePath]=AuxFreshBootstrapPtyArtifacts.moduleIdentifier}
    return result
}
// Loaded image names must be absolute and already lexically normalized.
// Do not ask Foundation to infer file/directory kind for every sealed-system
// image. Actual non-system realpath, census and signature checks are separate.
func freshBootstrapImagePathIsLexicallyCanonical(_ path:String)->Bool {
    guard path.first == "/" else{return false}
    let components=path.split(separator:"/",omittingEmptySubsequences:false)
    return components.count>1 && components.dropFirst().allSatisfy{
        !$0.isEmpty && $0 != "." && $0 != ".."
    }
}

func validateCapturedFreshBootstrapImagePaths(_ paths:[String],bundle:String,policy:AuxFreshBootstrapPolicyContents)throws {
    let expected=freshBootstrapExpectedImageIdentifiers(bundle:bundle,policy:policy);var observed=Set<String>()
    guard !paths.isEmpty,paths.count<=4096 else{throw AuxFreshBootstrapPolicyError.image}
    for path in paths {
        guard freshBootstrapImagePathIsLexicallyCanonical(path) else{throw AuxFreshBootstrapPolicyError.image}
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

// v3 and v4 each have exactly two finite arm64 resources. Whole signed output bytes are
// explicit sealed-policy values, populated only after a separate exact review.
struct AuxFreshBootstrapPtyArtifact {
    let relativePath:String
    let identifier:String
    let sha256:String
    let bytes:Int
}
struct AuxFreshBootstrapPtyArtifacts {
    static let modulePath="Contents/Resources/native/node-pty/prebuilds/darwin-arm64/pty.node"
    static let helperPath="Contents/Resources/native/node-pty/prebuilds/darwin-arm64/spawn-helper"
    static let moduleIdentifier="dev.aux.browser.pty"
    static let helperIdentifier="dev.aux.browser.pty-spawn-helper"
    static let moduleSourceSha256="a8b049f93353a68a8c289c1a868e8c8ae29fa4caf2f56af676b57b780d25c19a"
    // The actual retained unsigned successor, never an alias for the original v3 bytes.
    static let rebuiltModuleSourceSha256="5b703ca2ae0901cc2b8e8e1064aaf4b78a386f402578a995834a8024de433726"
    static let containedModuleSourceSha256="03f4124086be96716bf1666555aa6d1a2b3d055efd103d5af8b984de5d0c03be"
    static let helperSourceSha256="b9cf27a0832388cf154434f192d59739b2ce4c18463d7b4387b0c49e2857f79f"
    let module:AuxFreshBootstrapPtyArtifact
    let helper:AuxFreshBootstrapPtyArtifact
    static func decode(_ object:[String:Any])throws->Self {
        let moduleSource:String
        switch object["format"] as? String {
        case "aux.fresh.bootstrap.policy.v3":moduleSource=moduleSourceSha256
        case "aux.fresh.bootstrap.policy.v4","aux.fresh.bootstrap.policy.v5":moduleSource=rebuiltModuleSourceSha256
        case "aux.fresh.bootstrap.policy.v6","aux.fresh.bootstrap.policy.v7","aux.fresh.bootstrap.policy.v8":moduleSource=containedModuleSourceSha256
        default:throw AuxFreshBootstrapPolicyError.policy
        }
        func artifact(_ value:Any?,path:String,identifier:String,source:String)throws->AuxFreshBootstrapPtyArtifact {
            guard let fields=value as? [String:Any],Set(fields.keys)==["path","identifier","sha256","bytes","sourceSha256","architecture"],
                  fields["path"] as? String==path,fields["identifier"] as? String==identifier,
                  fields["sourceSha256"] as? String==source,fields["architecture"] as? String=="arm64",
                  let hash=fields["sha256"] as? String,hash.utf8.count==64,hash.utf8.allSatisfy({($0>=48 && $0<=57)||($0>=97 && $0<=102)}),hash != source,
                  let count=fields["bytes"] as? NSNumber,CFGetTypeID(count) != CFBooleanGetTypeID(),count.doubleValue==Double(count.intValue),count.intValue>0,count.intValue<=32*1024*1024 else{throw AuxFreshBootstrapPolicyError.policy}
            return .init(relativePath:path,identifier:identifier,sha256:hash,bytes:count.intValue)
        }
        return try .init(module:artifact(object["ptyModule"],path:modulePath,identifier:moduleIdentifier,source:moduleSource),helper:artifact(object["ptySpawnHelper"],path:helperPath,identifier:helperIdentifier,source:helperSourceSha256))
    }
}
func validateCapturedFreshBootstrapPtySignature(_ captured:AuxCapturedFreshBootstrapSignature,artifact:AuxFreshBootstrapPtyArtifact)throws {
    guard captured.team==AuxFreshBootstrapIdentity.team,captured.certificateSha256==AuxFreshBootstrapIdentity.leafCertificateSha256,
          captured.identifier==artifact.identifier,captured.flags & 0x2==0,captured.flags & 0x10000 != 0,
          captured.entitlements.isEmpty,captured.applicationIdentifier.isEmpty,captured.accessGroups.isEmpty else{throw AuxFreshBootstrapPolicyError.identity}
}

// This successor host has native PTY custody; historical daemon modules cannot
// enter its prepare/load route. Pure decoding remains backward compatible.
func validateFreshBootstrapRebuiltDaemonRoute(_ policy:AuxFreshBootstrapPolicyContents)throws {
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    guard policy.role == .daemon,policy.embeddedDaemon,policy.browserStartupRoots != nil,
          policy.browserPreparedRecovery,!policy.includesPdf,!policy.includesMacUtilities,
          !policy.includesRebuiltPtyModule,!policy.includesContainedPtyModule,policy.ptyArtifacts == nil else{throw AuxFreshBootstrapPolicyError.policy}
#else
    guard policy.role != .daemon || (policy.includesContainedPtyModule && policy.browserStartupRoots != nil && policy.browserPreparedRecovery) else {throw AuxFreshBootstrapPolicyError.policy}
#endif
}
