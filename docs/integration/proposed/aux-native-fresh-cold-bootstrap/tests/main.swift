// Actual service state machine with explicit fake authentication/crypto/guard
// components. Disposable FS reservation inventory only; no Security or factories.
import Foundation
import Darwin
enum FixtureError:Error{case pending,invalid}
enum AuxFreshHomeError:Error{case generationAlreadyAttempted}
enum FX {
 static var parent=""
 static var generation=0,captures=0,submits=0,observes=0,resumes=0,targets=0,providers=0
 static var generationFails=false,submitThrows=false,resumeFails=false,guardLive=true
 static var onGeneration:(()->Void)?
 static var targetOutcomes:[NativeFreshTargetOutcome]=[]
 static func reset(){generation=0;captures=0;submits=0;observes=0;resumes=0;targets=0;providers=0;generationFails=false;submitThrows=false;resumeFails=false;guardLive=true;onGeneration=nil;targetOutcomes=[]}
}
struct Contents{let canonicalPrivateParent:String}
struct AuxAuthenticatedFreshBootstrapPolicy{
 var contents:Contents{.init(canonicalPrivateParent:FX.parent)}
 func revalidateCurrentIdentity()throws{}
 func createFreshHome()throws->AuxFreshNativeHome{FileManager.default.createFile(atPath:FX.parent+"/"+AuxFreshNativeHome.reservationName,contents:Data());return .init()}
}
struct AuxLiveNativeParentConnection{}
final class AuxFreshColdInstallerGuard{
 static let installerName=".aux-native-cold-installer.v1"
 let policy=AuxAuthenticatedFreshBootstrapPolicy()
 static func acquire(peer:AuxLiveNativeParentConnection)throws->AuxFreshColdInstallerGuard{.init()}
 func createFreshHome()throws->AuxFreshNativeHome{try policy.createFreshHome()}
 func revalidate()throws{if !FX.guardLive{throw FixtureError.pending}}
 func duplicateRetainedParentDescriptor()throws->Int32{open(FX.parent,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)}
}
final class AuxFreshNativeHome{
 static let reservationName=".aux-first-installation.v1"
 func validateRetainedIdentity()throws{}
 func duplicateDirectoryForNativeBootstrap()throws->Int32{open(FX.parent,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)}
}
struct AuxFreshNativeSecureCapture{
 static func capture(policy:AuxAuthenticatedFreshBootstrapPolicy,home:AuxFreshNativeHome)throws->Self{FX.captures += 1;return .init()}
}
struct NativeFreshStagedContext{
 func revalidateNativeStageBinding()throws{}
 func duplicateRetainedHomeDescriptor()throws->Int32{open(FX.parent,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)}
 static func resume(coldGuard:AuxFreshColdInstallerGuard)throws->Self{FX.resumes += 1;if FX.resumeFails{throw FixtureError.invalid};return .init()}
}
enum NativeFreshStageSubmitOutcome{case staged(NativeFreshStagedContext),unresolved(String),blocked(String)}
final class AuxNativeFreshStageCoordinator{
 static func prepare(capture:AuxFreshNativeSecureCapture,coldGuard:AuxFreshColdInstallerGuard)throws->AuxNativeFreshStageCoordinator{
  FX.generation += 1;FX.onGeneration?();if FX.generationFails{throw FixtureError.invalid};return .init()
 }
 func submitStageOnce()throws->NativeFreshStageSubmitOutcome{FX.submits += 1;if FX.submitThrows{throw FixtureError.pending};return .unresolved("unknown-stage")}
 func observeStageWithoutReplay()throws->NativeFreshStageSubmitOutcome{FX.observes += 1;return .staged(.init())}
}
struct StoredNativeFreshTargetCheckpoint{let id:Int}
struct NativeFreshTerminalSelection{}
enum NativeFreshTargetOutcome{case progressed(StoredNativeFreshTargetCheckpoint),unresolved(String),blocked(StoredNativeFreshTargetCheckpoint),ready(NativeFreshTerminalSelection)}
final class AuxNativeFreshTargetCoordinator{
 init(context:NativeFreshStagedContext)throws{}
 func advanceOne()throws->NativeFreshTargetOutcome{FX.targets += 1;return FX.targetOutcomes.isEmpty ? .ready(.init()):FX.targetOutcomes.removeFirst()}
}
final class AuxPreparedFreshRuntimeProvider{
 static func prepare(terminal:NativeFreshTerminalSelection)throws->AuxPreparedFreshRuntimeProvider{FX.providers += 1;return .init()}
 func closeCreationAdmission()->Int32{0}
}
final class AuxFreshColdBootstrapRegistration{init(service:AuxAuthenticatedFreshColdBootstrap)throws{}}
var checks=0
func check(_ b:Bool){precondition(b);checks += 1}
func scenario(_ body:(AuxAuthenticatedFreshColdBootstrap)throws->Void)throws{
 FX.reset()
 let dir=FileManager.default.temporaryDirectory.appendingPathComponent("aux-cold-service-"+UUID().uuidString)
 try FileManager.default.createDirectory(at:dir,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
 defer{try? FileManager.default.removeItem(at:dir)}
 guard let ptr=realpath(dir.path,nil)else{fatalError()};FX.parent=String(cString:ptr);free(ptr)
 let service=try AuxAuthenticatedFreshColdBootstrap.authenticate(connectedParent:.init())
 try body(service)
}
func reachProvider(_ service:AuxAuthenticatedFreshColdBootstrap){
 for _ in 0..<16{if case .ready=service.advance(){check(true);return}}
 fatalError("no provider")
}
try scenario{s in
 FX.submitThrows=true
 FX.targetOutcomes=[.unresolved("locked-target"),.progressed(.init(id:1)),.ready(.init())]
 reachProvider(s)
 check(FX.generation==1 && FX.submits==1 && FX.observes==1 && FX.providers==1)
 _ = s.advance();check(FX.providers==1)
}
try scenario{s in
 FX.generationFails=true
 for _ in 0..<7{_ = s.advance()}
 check(FX.generation==1 && FX.submits==0)
 if case .failed(.generationAndDraft,_)=s.lastOutcome!{check(true)}else{fatalError()}
}
try scenario{s in
 FX.onGeneration={if case .busy=s.advance(){check(true)}else{fatalError()}}
 reachProvider(s);check(FX.generation==1)
}
try scenario{s in
 FileManager.default.createFile(atPath:FX.parent+"/"+AuxFreshNativeHome.reservationName,contents:Data())
 reachProvider(s);check(FX.generation==0 && FX.captures==0 && FX.submits==0 && FX.resumes==1)
}
try scenario{s in
 FileManager.default.createFile(atPath:FX.parent+"/"+AuxFreshNativeHome.reservationName,contents:Data())
 FX.resumeFails=true
 for _ in 0..<5{_ = s.advance()}
 check(FX.generation==0 && FX.captures==0 && FX.submits==0 && FX.resumes==4)
 if case .failed(.resume,_)=s.lastOutcome!{check(true)}else{fatalError()}
}
try scenario{s in
 FileManager.default.createFile(atPath:FX.parent+"/legacy.json",contents:Data())
 for _ in 0..<3{_ = s.advance()}
 check(FX.generation==0 && FX.captures==0)
 check(!FileManager.default.fileExists(atPath:FX.parent+"/"+AuxFreshNativeHome.reservationName))
}
try scenario{s in
 FX.onGeneration={FX.guardLive=false}
 _ = s.advance();_ = s.advance()
 if case .guardStopped(_, .progressed(.generationAndDraft))=s.advance(){check(true)}else{fatalError()}
 FX.guardLive=true
 if case .guardStopped=s.advance(){check(true)}else{fatalError()}
 check(FX.generation==1 && FX.submits==0 && FX.providers==0)
}
try scenario{s in
 FX.targetOutcomes=[.blocked(.init(id:42))]
 for _ in 0..<12{_ = s.advance()}
 check(FX.targets==1 && FX.providers==0)
 if case .target(.blocked(let checkpoint))=s.lastOutcome!{check(checkpoint.id==42)}else{fatalError()}
}
print("PASS:\(checks) actual cold service state-machine cases; explicit fake auth/crypto/guard and disposable FS only")
