// Fixture-only native producer; never compiled in production.
import Foundation
final class CapturedBoundary:AuxMacOSUtilityBoundary {
 let custody=AuxOSJobCustody();var jobCustody:AuxOSJobCustody?{custody};var pending:AuxOSJobToken?
 func fileExists(_ path:String)->Bool{path != "/missing"}
 func prepareIconDirectory(_ path:String){}
 func applications(for file:URL)->[URL]{[URL(fileURLWithPath:"/synthetic/A.app")]}
 func defaultApplication(for file:URL)->URL?{URL(fileURLWithPath:"/synthetic/A.app")}
 func applicationName(_ application:URL)->String{"Captured App"}
 func iconPath(for application:URL,directory:URL)->String?{directory.appendingPathComponent("captured.png").path}
 func application(bundleIdentifier:String)->URL?{URL(fileURLWithPath:"/synthetic/A.app")}
 func copyFileURL(_ file:URL)->Bool{true}
 func openFile(_ file:URL,with application:URL)->String?{nil}
 func generatePreview(file:String,icon:String,thumbnail:String)->(thumbnail:Bool,icon:Bool){if file == "/pending"{pending=custody.begin(.quickLook)};return (true,true)}
}
private final class WeakBoundary{weak var value:CapturedBoundary?;init(_ value:CapturedBoundary){self.value=value}}
private let fixtureLock=NSLock()
private var fixtures:[WeakBoundary]=[]
private var releases:Int32=0
private final class Owner{let boundary=CapturedBoundary();lazy var core=AuxMacOSUtilityCommandCore(boundary:boundary)
 init(){fixtureLock.lock();fixtures.append(WeakBoundary(boundary));fixtureLock.unlock()}
 deinit{fixtureLock.lock();releases += 1;fixtureLock.unlock()}
}
@_cdecl("AuxFixtureUtilityReleaseCount") func releaseCount()->Int32{fixtureLock.lock();defer{fixtureLock.unlock()};return releases}
@_cdecl("AuxFixtureCompleteUtilityCallbacks") func completeAll(){fixtureLock.lock();let boundaries=fixtures.compactMap{$0.value};fixtureLock.unlock();for b in boundaries{b.pending?.complete();b.pending=nil}}

@_cdecl("AuxCreateMacUtilityOwner") func create()->UnsafeMutableRawPointer{Unmanaged.passRetained(Owner()).toOpaque()}
@_cdecl("AuxRunMacUtilityOwner") func run(_ ptr:UnsafeMutableRawPointer?,_ command:UnsafePointer<CChar>?,_ input:UnsafePointer<CChar>?)->UnsafeMutablePointer<CChar>?{
 guard let ptr,let command,let input else{return nil};return strdup(Unmanaged<Owner>.fromOpaque(ptr).takeUnretainedValue().core.run(command:String(cString:command),input:String(cString:input)) ?? "{\"error\":\"Unknown native macOS utility command\"}")
}
@_cdecl("AuxCloseMacUtilityOwner") func close(_ ptr:UnsafeMutableRawPointer?)->Int32{guard let ptr else{return 2};switch Unmanaged<Owner>.fromOpaque(ptr).takeUnretainedValue().core.closeAdmissionAndDrain(timeout:0){case .drained:return 0;case .pending:return 1;default:return 2}}
@_cdecl("AuxReleaseMacUtilityOwner") func release(_ ptr:UnsafeMutableRawPointer?){if let ptr{Unmanaged<Owner>.fromOpaque(ptr).release()}}
