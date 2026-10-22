// Inactive in-process lifetime boundary. Not host authentication/admission.
import Foundation
import Darwin

enum AuxDispatcherLifetimeError:Error { case invalidHandle,retiring,reentrantRetirement,reentrantCall,exhaustedHandles,invalidInput }

// Contains no globally selected scope. Entries are immutable distinct contexts;
// integer IDs are never pointers and never reused during this process lifetime.
final class AuxCommandDispatcherRegistry {
    static let shared=AuxCommandDispatcherRegistry()
    private enum Phase { case open,retiring,closed }
    private final class Entry {
        let core:AuxInstallationCommandCore
        let execution=NSLock() // Serialize operations on one imported authority.
        var phase=Phase.open
        var active=0
        init(_ context:CapturedTerminalCommandContext){core=context.core}
#if AUX_RECOVERED_FRESH_DISPATCH
        init(_ context:RecoveredFreshTerminalCommandContext){core=context.core}
#endif
    }
    private let condition=NSCondition()
    private var entries=[UInt64:Entry]()
    private var next:UInt64=1
    private let threadKey="aux.native.dispatcher.active-handles.v1"
    private init(){}
    fileprivate func install(_ context:CapturedTerminalCommandContext)throws->UInt64 {
        try insert(Entry(context))
    }
#if AUX_RECOVERED_FRESH_DISPATCH
    fileprivate func install(_ context:RecoveredFreshTerminalCommandContext)throws->UInt64 {
        try insert(Entry(context))
    }
#endif
    private func insert(_ entry:Entry)throws->UInt64 {
        condition.lock();defer{condition.unlock()}
        guard next<UInt64.max else{throw AuxDispatcherLifetimeError.exhaustedHandles}
        let handle=next;next += 1;entries[handle]=entry;return handle
    }
    // Trusted in-process operation seam. Scope is not an action argument.
    func withContext<T>(_ handle:UInt64,_ action:(AuxInstallationCommandCore)throws->T)throws->T {
        let threadActive=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        guard threadActive[handle,default:0]==0 else{throw AuxDispatcherLifetimeError.reentrantCall}
        condition.lock()
        guard let entry=entries[handle]else{condition.unlock();throw AuxDispatcherLifetimeError.invalidHandle}
        guard entry.phase == .open else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}
        entry.active += 1
        condition.unlock()
        entry.execution.lock()
        var active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        active[handle,default:0] += 1;Thread.current.threadDictionary[threadKey]=active
        defer {
            var current=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
            let count=current[handle,default:1]-1
            if count==0{current.removeValue(forKey:handle)}else{current[handle]=count}
            Thread.current.threadDictionary[threadKey]=current
            entry.execution.unlock()
            condition.lock();entry.active -= 1
            if entry.active==0 && entry.phase == .retiring {
                entry.phase = .closed;entries.removeValue(forKey:handle)
            }
            condition.broadcast();condition.unlock()
        }
        return try action(entry.core)
    }
    // Owner destruction cannot wait on its own lease; close now and let the
    // last acquired operation remove the entry. No further acquisition succeeds.
    fileprivate func closeOwner(_ handle:UInt64) {
        condition.lock();defer{condition.unlock()}
        guard let entry=entries[handle]else{return}
        entry.phase = .retiring
        if entry.active==0{entry.phase = .closed;entries.removeValue(forKey:handle)}
        condition.broadcast()
    }
    func isAccepting(_ handle:UInt64)->Bool {
        condition.lock();defer{condition.unlock()};return entries[handle]?.phase == .open
    }
    func retire(_ handle:UInt64)throws {
        // Reentrant close would wait for this same thread's acquired lease.
        let active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        guard active[handle,default:0]==0 else{throw AuxDispatcherLifetimeError.reentrantRetirement}
        condition.lock();defer{condition.unlock()}
        guard let entry=entries[handle]else{throw AuxDispatcherLifetimeError.invalidHandle}
        entry.phase = .retiring
        while entry.active>0 {condition.wait()}
        entry.phase = .closed
        // A simultaneous retiring caller can still hold the same entry, but
        // no call can acquire it once retirement begins or after removal.
        entries.removeValue(forKey:handle);condition.broadcast()
    }
}

// Only the trusted Swift host can construct an owner from a checked captured
// context. No C/JS factory accepts scope, JSON rows or arbitrary core callbacks.
final class AuxOwnedCommandDispatcher {
    let handle:UInt64
    init(capturedTerminal:CapturedTerminalCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(capturedTerminal)
    }
#if AUX_RECOVERED_FRESH_DISPATCH
    // Declaration composition only: the sealed type validates actual recovered
    // terminal evidence. This flag supplies no runtime admission or bypass.
    init(recoveredFreshTerminal:RecoveredFreshTerminalCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(recoveredFreshTerminal)
    }
#endif
    func retire()throws{try AuxCommandDispatcherRegistry.shared.retire(handle)}
    deinit{AuxCommandDispatcherRegistry.shared.closeOwner(handle)}
}

private func dispatcherCString(_ text:String)->UnsafeMutablePointer<CChar>? { strdup(text) }
private func dispatcherError(_ error:Error)->UnsafeMutablePointer<CChar>? {
    let text:String
    switch error {
    case AuxDispatcherLifetimeError.invalidHandle:text="Invalid dispatcher handle"
    case AuxDispatcherLifetimeError.retiring:text="Dispatcher is retiring"
    case AuxDispatcherLifetimeError.invalidInput:text="Invalid native command input"
    default:text="Native dispatcher operation failed"
    }
    return dispatcherCString("{\"error\":\""+text+"\"}")
}
private func dispatcherString(_ pointer:UnsafePointer<UInt8>?,_ length:Int,_ maximum:Int)throws->String {
    guard length>=0,length<=maximum else{throw AuxDispatcherLifetimeError.invalidInput}
    if length==0{return ""}
    guard let pointer,let text=String(data:Data(bytes:pointer,count:length),encoding:.utf8),!text.contains("\0")else{throw AuxDispatcherLifetimeError.invalidInput}
    return text
}

// New INTERNAL context-bearing ABI, deliberately not a fake original Run ABI.
// Caller must supply valid readable buffers for lengths on a valid owned handle.
// Handle lookup occurs BEFORE any caller input pointer is dereferenced.
@_cdecl("AuxNativeContextRun")
func auxNativeContextRun(_ handle:UInt64,_ command:UnsafePointer<UInt8>?,_ commandLength:Int,
                         _ input:UnsafePointer<UInt8>?,_ inputLength:Int)->UnsafeMutablePointer<CChar>? {
    do {
        return try AuxCommandDispatcherRegistry.shared.withContext(handle){core in
            let name=try dispatcherString(command,commandLength,128)
            let value=try dispatcherString(input,inputLength,16_384)
            return dispatcherCString(core.run(command:name,input:value))
        }
    }catch{return dispatcherError(error)}
}
// Standard owned C result: copy string first, then free exactly once. A pointer
// not returned by ContextRun is not a permitted argument (ordinary C contract).
@_cdecl("AuxNativeResultFree")
func auxNativeResultFree(_ result:UnsafeMutablePointer<CChar>?){free(result)}
@_cdecl("AuxNativeContextRetire")
func auxNativeContextRetire(_ handle:UInt64)->Int32 {
    do{try AuxCommandDispatcherRegistry.shared.retire(handle);return 0}
    catch AuxDispatcherLifetimeError.reentrantRetirement{return -2}
    catch{return -1}
}
