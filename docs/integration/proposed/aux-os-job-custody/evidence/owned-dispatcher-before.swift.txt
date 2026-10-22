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
#if AUX_MACOS_UTILITY_DISPATCH
        let macOSUtilities:AuxMacOSUtilityCommandCore?
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
        let secureStore:AuxSecureStoreCommandCore?
#endif
        let execution=NSLock() // Serialize operations on one imported authority.
        var phase=Phase.open
        var active=0
#if !AUX_MINIMAL_RUNTIME_DISPATCH
        init(_ context:CapturedTerminalCommandContext){
            core=context.core
#if AUX_MACOS_UTILITY_DISPATCH
            macOSUtilities=nil
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=nil
#endif
        }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
        init(_ context:AuxRuntimeCapturedCommandContext){
            core=context.core
#if AUX_MACOS_UTILITY_DISPATCH
            macOSUtilities=nil
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=nil
#endif
        }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
        init(_ context:RecoveredFreshTerminalCommandContext){
            core=context.core
#if AUX_MACOS_UTILITY_DISPATCH
            macOSUtilities=nil
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=nil
#endif
        }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
        init(_ context:ScopedAuxCommandContext){
            core=context.installation;secureStore=context.secureStore
#if AUX_MACOS_UTILITY_DISPATCH
            macOSUtilities=nil
#endif
        }
#endif
#if AUX_MACOS_UTILITY_DISPATCH
        // This wrapper only composes an already sealed context with a host-owned
        // immutable utility capability. It cannot create an installation authority.
        init(wrapping entry:Entry,utilities:AuxMacOSUtilityCommandCore){
            core=entry.core;macOSUtilities=utilities
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=entry.secureStore
#endif
        }
#endif
    }
    private let condition=NSCondition()
    private var entries=[UInt64:Entry]()
    private var next:UInt64=1
    private let threadKey="aux.native.dispatcher.active-handles.v1"
    private init(){}
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    fileprivate func install(_ context:CapturedTerminalCommandContext)throws->UInt64 {
        try insert(Entry(context))
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    fileprivate func install(_ context:AuxRuntimeCapturedCommandContext)throws->UInt64 {try insert(Entry(context))}
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    fileprivate func install(_ context:RecoveredFreshTerminalCommandContext)throws->UInt64 {
        try insert(Entry(context))
    }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
    fileprivate func install(_ context:ScopedAuxCommandContext)throws->UInt64 {try insert(Entry(context))}
#endif
#if AUX_MACOS_UTILITY_DISPATCH
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    fileprivate func install(_ context:CapturedTerminalCommandContext,utilities:AuxMacOSUtilityCommandCore)throws->UInt64 {try insert(Entry(wrapping:Entry(context),utilities:utilities))}
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    fileprivate func install(_ context:AuxRuntimeCapturedCommandContext,utilities:AuxMacOSUtilityCommandCore)throws->UInt64 {try insert(Entry(wrapping:Entry(context),utilities:utilities))}
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    fileprivate func install(_ context:RecoveredFreshTerminalCommandContext,utilities:AuxMacOSUtilityCommandCore)throws->UInt64 {try insert(Entry(wrapping:Entry(context),utilities:utilities))}
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
    fileprivate func install(_ context:ScopedAuxCommandContext,utilities:AuxMacOSUtilityCommandCore)throws->UInt64 {try insert(Entry(wrapping:Entry(context),utilities:utilities))}
#endif
#endif
    private func insert(_ entry:Entry)throws->UInt64 {
        condition.lock();defer{condition.unlock()}
        guard next<UInt64.max else{throw AuxDispatcherLifetimeError.exhaustedHandles}
        let handle=next;next += 1;entries[handle]=entry;return handle
    }
    // Trusted in-process operation seam. Scope is not an action argument.
    func withContext<T>(_ handle:UInt64,_ action:(AuxInstallationCommandCore)throws->T)throws->T {
        try withEntry(handle){try action($0.core)}
    }
    fileprivate func withCommandHandler<T>(_ handle:UInt64,_ action:((String,String)->String)throws->T)throws->T {
        try withEntry(handle){entry in
            try action({command,input in
#if AUX_SCOPED_SECURE_STORE_DISPATCH
                if let secure=entry.secureStore,["secure-save","secure-read","secure-clear"].contains(command) {
                    return secure.run(command:command,input:input)
                }
#endif
#if AUX_MACOS_UTILITY_DISPATCH
                if let reply=entry.macOSUtilities?.run(command:command,input:input){return reply}
#endif
                return entry.core.run(command:command,input:input)
            })
        }
    }
    private func withEntry<T>(_ handle:UInt64,_ action:(Entry)throws->T)throws->T {
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
        return try action(entry)
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
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    init(capturedTerminal:CapturedTerminalCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(capturedTerminal)
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    init(runtimeCaptured:AuxRuntimeCapturedCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(runtimeCaptured)
    }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    // Declaration composition only: the sealed type validates actual recovered
    // terminal evidence. This flag supplies no runtime admission or bypass.
    init(recoveredFreshTerminal:RecoveredFreshTerminalCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(recoveredFreshTerminal)
    }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
    init(scopedTerminal:ScopedAuxCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(scopedTerminal)
    }
#endif
#if AUX_MACOS_UTILITY_DISPATCH
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    init(capturedTerminal:CapturedTerminalCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(capturedTerminal,utilities:macOSUtilities)
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    init(runtimeCaptured:AuxRuntimeCapturedCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(runtimeCaptured,utilities:macOSUtilities)
    }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    init(recoveredFreshTerminal:RecoveredFreshTerminalCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(recoveredFreshTerminal,utilities:macOSUtilities)
    }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
    init(scopedTerminal:ScopedAuxCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(scopedTerminal,utilities:macOSUtilities)
    }
#endif
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
        return try AuxCommandDispatcherRegistry.shared.withCommandHandler(handle){run in
            let name=try dispatcherString(command,commandLength,128)
            let value=try dispatcherString(input,inputLength,16_384)
            return dispatcherCString(run(name,value))
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
