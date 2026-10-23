// Non-JS native invocation. Peer IDs refer only to actual private-Connect
// objects; they are routing handles, never custody/installation evidence.
import Foundation
import Darwin
final class AuxFreshColdBootstrapRegistration {
    let nativeHandle:UInt64
    init(service:AuxAuthenticatedFreshColdBootstrap)throws{nativeHandle=try FreshColdNativeServices.publish(service)}
    deinit{FreshColdNativeServices.release(nativeHandle)}
}
private enum FreshColdNativeServices {
    private final class Entry {
        let service:AuxAuthenticatedFreshColdBootstrap
        var references:UInt64=1
        var active:UInt64=0
        var closed=false
        init(_ service:AuxAuthenticatedFreshColdBootstrap){self.service=service}
    }
    private static let process=getpid()
    private static let lock=NSLock()
    private static var next:UInt64=1
    private static var entries:[UInt64:Entry]=[:]
    static func publish(_ service:AuxAuthenticatedFreshColdBootstrap)throws->UInt64 {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()}
        guard next != 0,next != UInt64.max else{throw AuxPreparedFreshRuntimeError.exhausted}
        let id=next;next += 1;entries[id]=Entry(service);return id
    }
    static func retain(_ id:UInt64)->Int32 {
        guard getpid()==process else{return -1}
        lock.lock();defer{lock.unlock()}
        guard let e=entries[id],!e.closed,e.references<UInt64.max else{return -1}
        e.references += 1;return 0
    }
    static func release(_ id:UInt64){
        guard getpid()==process else{return}
        var released:Entry?
        lock.lock()
        if let e=entries[id],e.references>0 {
            e.references -= 1
            if e.references==0{e.closed=true;if e.active==0{released=entries.removeValue(forKey:id)}}
        }
        lock.unlock();withExtendedLifetime(released){}
    }
    static func copyHome(_ id:UInt64,_ result:UnsafeMutablePointer<Int32>)->Int32 {
        guard getpid()==process else{return -1}
        let entry:Entry
        lock.lock()
        guard let e=entries[id],!e.closed,e.active<UInt64.max else{lock.unlock();return -1}
        e.active += 1;entry=e;lock.unlock()
        let fd=(try? entry.service.copySelectedHomeDescriptor()) ?? -1
        lock.lock();let closed=entry.closed
        if !closed && fd>=0{result.pointee=fd}
        entry.active -= 1
        if entry.references==0 && entry.active==0{entries.removeValue(forKey:id)}
        lock.unlock()
        if closed && fd>=0{Darwin.close(fd)}
        return !closed && fd>=0 ? 0:-1
    }
    static func advance(_ id:UInt64,_ ready:UnsafeMutablePointer<UInt64>)->Int32 {
        guard getpid()==process else{return -1}
        let entry:Entry
        lock.lock()
        guard let e=entries[id],!e.closed,e.active<UInt64.max else{lock.unlock();return -1}
        e.active += 1;entry=e;lock.unlock()
        let outcome=entry.service.advance() // actual auth/protected work, no mutex held
        var copiedProvider:UInt64=0
        var status:Int32
        switch outcome {
        case .ready(let provider):
            copiedProvider=provider.nativeHandle
            status=AuxRetainPreparedFreshRuntimeProvider(copiedProvider)==0 ? 0:-1
            if status != 0{copiedProvider=0}
        case .progressed:status=1
        case .busy:status=2
        case .stageDeferredBeforeAdd:status=9
        case .stageUnresolved:status=3
        case .stageBlocked:status=4
        case .target(let target):
            switch target{case .unresolved:status=5;case .blocked:status=6;case .progressed:status=1;case .ready:status = -1}
        case .failed:status=7
        case .guardStopped:status=8
        }
        lock.lock()
        let closed=entry.closed
        if !closed && status==0{ready.pointee=copiedProvider}
        entry.active -= 1
        if entry.references==0 && entry.active==0{entries.removeValue(forKey:id)}
        lock.unlock()
        if closed {
            if case .ready(let provider)=outcome{_ = provider.closeCreationAdmission()}
            if copiedProvider != 0{AuxReleasePreparedFreshRuntimeProvider(copiedProvider)}
            return -1
        }
        return status
    }
}
// Only a real registered parent connection plus actual signature/private-FD
// acquisition can construct a service. No policy/path/row/generation flag input.
// This function is NOT registered with Node and must remain before userland in
// the eventual native child entry. Current state2 startup refusal stays intact.
@_cdecl("AuxCreateAuthenticatedFreshColdBootstrap")
func AuxCreateAuthenticatedFreshColdBootstrap(_ parent:UInt64,_ result:UnsafeMutablePointer<UInt64>?)->Int32 {
    guard let result else{return -1};result.pointee=0
    do {
        let peer=try AuxLiveNativeParentConnection.retainingNativeConnection(parent)
        let service=try AuxAuthenticatedFreshColdBootstrap.authenticate(connectedParent:peer)
        result.pointee=try FreshColdNativeServices.publish(service);return 0
    }catch{return -1}
}
@_cdecl("AuxRetainAuthenticatedFreshColdBootstrap")
func AuxRetainAuthenticatedFreshColdBootstrap(_ id:UInt64)->Int32{FreshColdNativeServices.retain(id)}
@_cdecl("AuxReleaseAuthenticatedFreshColdBootstrap")
func AuxReleaseAuthenticatedFreshColdBootstrap(_ id:UInt64){FreshColdNativeServices.release(id)}
@_cdecl("AuxAdvanceAuthenticatedFreshColdBootstrap")
func AuxAdvanceAuthenticatedFreshColdBootstrap(_ id:UInt64,_ provider:UnsafeMutablePointer<UInt64>?)->Int32 {
    guard let provider else{return -1};provider.pointee=0
    // On status0 caller owns ONE provider reference; explicit WorkerHost ctor
    // acquires its own reference, so native caller then releases this copy.
    return FreshColdNativeServices.advance(id,provider)
}

@_cdecl("AuxCopyAuthenticatedFreshColdHomeDescriptor")
func AuxCopyAuthenticatedFreshColdHomeDescriptor(_ id:UInt64,_ descriptor:UnsafeMutablePointer<Int32>?)->Int32 {
    guard let descriptor else{return -1};descriptor.pointee = -1
    // Child-native caller owns/then closes returned duplicate. A raw FD number
    // is process-local; send a kernel fileport, never serialize the integer/path.
    return FreshColdNativeServices.copyHome(id,descriptor)
}
