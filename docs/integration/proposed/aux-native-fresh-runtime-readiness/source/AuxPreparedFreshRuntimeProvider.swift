// Native-only typed producer; no module initializer, JS factory or admission flag.
import Foundation
import Darwin
#if !AUX_NATIVE_FRESH_RUNTIME_CONSUMER || !AUX_MINIMAL_RUNTIME_DISPATCH || !AUX_SCOPED_SECURE_STORE_DISPATCH || !AUX_MACOS_UTILITY_DISPATCH || !AUX_ATOMIC_CSK_DISPATCH
#error("Fresh runtime provider requires the reviewed typed/scoped/utility graph")
#endif

enum AuxPreparedFreshRuntimeError:Error {case closed,exhausted,wrongProcess}
// This token routes a native process-local lifetime only. It is not secret,
// unguessable, serialized authority or a writer-custody grant.
final class AuxPreparedFreshRuntimeProvider {
    let nativeHandle:UInt64
    private init(_ id:UInt64){nativeHandle=id}
    static func prepare(terminal:NativeFreshTerminalSelection)throws->AuxPreparedFreshRuntimeProvider {
        // Real native caller must already own upstream admission. These real
        // protected recapture/imports validate coherence, not all-process custody.
        let captured=try NativeFreshRuntimeCapturedContext.capture(terminal)
        let scoped=try ScopedAuxCommandContext.nativeFresh(captured)
        let id=try PreparedFreshRuntimeProviders.publish(terminal:terminal,captured:captured,scoped:scoped)
        return .init(id)
    }
    // 0: creation settled, 1: creation pending, 2: quarantined/untracked late owner, -1: invalid handle.
    // Existing per-Environment owners must separately retire through WorkerHost.
    func copyReadyHomeDescriptor()throws->Int32{try PreparedFreshRuntimeProviders.copyReadyHome(nativeHandle)}
    func closeCreationAdmission()->Int32{PreparedFreshRuntimeProviders.close(nativeHandle)}
    deinit{PreparedFreshRuntimeProviders.release(nativeHandle)}
}
private enum PreparedFreshRuntimeProviders {
    private final class Entry {
        let terminal:NativeFreshTerminalSelection
        let preparedCapture:NativeFreshRuntimeCapturedContext
        let preparedScoped:ScopedAuxCommandContext
        var references:UInt64=1
        var active:UInt64=0
        var handoffs:UInt64=0
        var closed=false
        var quarantinedOwners:[AuxOwnedCommandDispatcher]=[]
        init(terminal:NativeFreshTerminalSelection,captured:NativeFreshRuntimeCapturedContext,scoped:ScopedAuxCommandContext){
            self.terminal=terminal;preparedCapture=captured;preparedScoped=scoped
        }
    }
    private static let process=getpid()
    private static let lock=NSLock()
    private static var next:UInt64=1
    private static var entries:[UInt64:Entry]=[:]
    static func publish(terminal:NativeFreshTerminalSelection,captured:NativeFreshRuntimeCapturedContext,scoped:ScopedAuxCommandContext)throws->UInt64 {
        guard getpid()==process else{throw AuxPreparedFreshRuntimeError.wrongProcess}
        lock.lock();defer{lock.unlock()}
        guard next != 0,next != UInt64.max else{throw AuxPreparedFreshRuntimeError.exhausted}
        let id=next;next += 1;entries[id]=Entry(terminal:terminal,captured:captured,scoped:scoped);return id
    }
    static func retain(_ id:UInt64)->Int32 {
        guard getpid()==process else{return -1}
        lock.lock();defer{lock.unlock()}
        guard let e=entries[id],!e.closed,e.references<UInt64.max else{return -1}
        e.references += 1;return 0
    }
    static func release(_ id:UInt64){
        guard getpid()==process else{return}
        // Move the last strong Entry outside the lock before releasing it:
        // destruction can retire retained native authority/FD resources.
        var released:Entry?
        lock.lock()
        if let e=entries[id],e.references>0 {
            e.references -= 1
            if e.references==0 {
                e.closed=true
                if e.active==0 && e.handoffs==0 && e.quarantinedOwners.isEmpty{released=entries.removeValue(forKey:id)}
            }
        }
        lock.unlock();withExtendedLifetime(released){}
    }
    static func close(_ id:UInt64)->Int32 {
        guard getpid()==process else{return -1}
        lock.lock();defer{lock.unlock()}
        guard let e=entries[id]else{return -1};e.closed=true
        if !e.quarantinedOwners.isEmpty{return 2}
        return e.active==0 && e.handoffs==0 ? 0:1
    }
    static func copyReadyHome(_ id:UInt64)throws->Int32 {
        guard getpid()==process else{throw AuxPreparedFreshRuntimeError.wrongProcess}
        let entry:Entry
        lock.lock()
        guard let e=entries[id],!e.closed,e.handoffs<UInt64.max else{lock.unlock();throw AuxPreparedFreshRuntimeError.closed}
        e.handoffs += 1;entry=e;lock.unlock()
        var descriptor:Int32 = -1
        do {
            let current=try NativeFreshRuntimeCapturedContext.capture(entry.terminal)
            let scoped=try ScopedAuxCommandContext.nativeFresh(current)
            let expected=entry.preparedScoped.evidence,actual=scoped.evidence
            guard expected.scope==actual.scope,expected.accessGroupSha256==actual.accessGroupSha256,
                  expected.runtimeGenerationId==actual.runtimeGenerationId,expected.runtimeSelectionSha256==actual.runtimeSelectionSha256,
                  expected.installationBindingsSha256==actual.installationBindingsSha256,
                  expected.logicalKeyPolicySha256==actual.logicalKeyPolicySha256 else{throw NativeFreshRuntimeConsumerError.binding}
            try current.revalidateCurrentCommandBinding()
            descriptor=try current.owner.duplicateRetainedHomeDescriptor()
            try current.revalidateCurrentCommandBinding()
        }catch {
            guard getpid()==process else{throw AuxPreparedFreshRuntimeError.wrongProcess}
            if descriptor>=0{Darwin.close(descriptor)}
            lock.lock();entry.handoffs -= 1
            if entry.references==0 && entry.active==0 && entry.handoffs==0 && entry.quarantinedOwners.isEmpty{entries.removeValue(forKey:id)}
            lock.unlock();throw error
        }
        guard getpid()==process else{throw AuxPreparedFreshRuntimeError.wrongProcess}
        lock.lock();let closed=entry.closed;entry.handoffs -= 1
        if entry.references==0 && entry.active==0 && entry.handoffs==0 && entry.quarantinedOwners.isEmpty{entries.removeValue(forKey:id)}
        lock.unlock()
        if closed{Darwin.close(descriptor);throw AuxPreparedFreshRuntimeError.closed}
        return descriptor
    }
    static func create(_ id:UInt64,_ handle:UnsafeMutablePointer<UInt64>,_ retained:UnsafeMutablePointer<UnsafeMutableRawPointer?>)->Int32 {
        guard getpid()==process else{return -1}
        let entry:Entry
        lock.lock()
        guard let found=entries[id],!found.closed,found.active<UInt64.max else{lock.unlock();return -1}
        found.active += 1;entry=found;lock.unlock()
        var owner:AuxOwnedCommandDispatcher?
        var preparationSucceeded=false
        do {
            // Each Environment imports its own actual current target authority;
            // never share one mutable dispatcher/root handle across Environments.
            let captured=try NativeFreshRuntimeCapturedContext.capture(entry.terminal)
            let scoped=try ScopedAuxCommandContext.nativeFresh(captured)
            let custody=AuxOSJobCustody()
            let utilities=AuxMacOSUtilityCommandCore(boundary:AuxAppKitUtilityBoundary(custody:custody))
            owner=try AuxOwnedCommandDispatcher(scopedTerminal:scoped,macOSUtilities:utilities)
            try captured.revalidate()
            preparationSucceeded=true
        }catch{}
        lock.lock()
        if let owner,preparationSucceeded,!entry.closed {
            // Only pointer stores/ARC retain here; no callback or protected call.
            handle.pointee=owner.handle;retained.pointee=Unmanaged.passRetained(owner).toOpaque()
            entry.active -= 1;lock.unlock();return 0
        }
        lock.unlock()
        // Keep creation pending until a late owner has actually retired. Never
        // hold the registry mutex across retirement or any native destructor.
        var unresolved:AuxOwnedCommandDispatcher?
        if let owner {
            do{try owner.retire()}
            catch AuxDispatcherLifetimeError.invalidHandle {} // Exact owner already absent.
            catch{unresolved=owner} // Reentrant/retiring/unknown is NOT observed completion.
        }
        lock.lock()
        if let unresolved{entry.quarantinedOwners.append(unresolved)}
        entry.active -= 1
        // Even after all native references release, uncertain owners retain the
        // genuine context and remain observable; no timeout/reset/reopen/delete.
        if entry.references==0 && entry.active==0 && entry.handoffs==0 && entry.quarantinedOwners.isEmpty{entries.removeValue(forKey:id)}
        lock.unlock();return -1
    }
}
@_cdecl("AuxRetainPreparedFreshRuntimeProvider")
func AuxRetainPreparedFreshRuntimeProvider(_ id:UInt64)->Int32{PreparedFreshRuntimeProviders.retain(id)}
@_cdecl("AuxReleasePreparedFreshRuntimeProvider")
func AuxReleasePreparedFreshRuntimeProvider(_ id:UInt64){PreparedFreshRuntimeProviders.release(id)}
@_cdecl("AuxClosePreparedFreshRuntimeCreation")
func AuxClosePreparedFreshRuntimeCreation(_ id:UInt64)->Int32{PreparedFreshRuntimeProviders.close(id)}
@_cdecl("AuxCreatePreparedFreshRuntimeOwner")
func AuxCreatePreparedFreshRuntimeOwner(_ id:UInt64,_ handle:UnsafeMutablePointer<UInt64>?,_ retained:UnsafeMutablePointer<UnsafeMutableRawPointer?>?)->Int32{
    guard let handle,let retained else{return -1};handle.pointee=0;retained.pointee=nil
    return PreparedFreshRuntimeProviders.create(id,handle,retained)
}
