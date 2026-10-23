// Inactive in-process lifetime boundary. Not host authentication/admission.
import Foundation
import Darwin
import CryptoKit

enum AuxDispatcherLifetimeError:Error { case invalidHandle,retiring,reentrantRetirement,reentrantCall,exhaustedHandles,invalidInput }

// Contains no globally selected scope. Entries are immutable distinct contexts;
// integer IDs are never pointers and never reused during this process lifetime.
final class AuxCommandDispatcherRegistry {
    static let shared=AuxCommandDispatcherRegistry()
    private enum Phase { case open,retiring,closed }
    private struct RetainedRead {
        let command:String
        let inputSha256:Data
        let response:String
    }
    // Pinned actual core routes: these return reads, public material/signatures
    // or imported root bytes. init aliases only return existing captured keys;
    // actual absent-state generation is refused by the unchanged core.
    private static let readOnlyCommands:Set<String>=["install-status","keys-status","get-public-keys","public-keys","install-init","init-keys","cdp-sign","dk-unwrap","secure-read"]
    private static func requestDigest(_ input:String)->Data{Data(SHA256.hash(data:Data(input.utf8)))}
    private final class Entry {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        var nativeFreshRuntime:NativeFreshRuntimeCapturedContext? = nil
        var nativeGuardFailure:AuxNativeFreshGuardFailure? = nil
        var pendingPostGuardObservation:AuxNativeFreshGuardFailure? = nil
        // Exact completed read reply stays private process memory only. Never
        // persist/log the response (which may contain credential/root bytes).
        var retainedRead:RetainedRead? = nil
        var reconcilingRead=false
#endif
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
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            nativeFreshRuntime=context.nativeFreshRuntime
#endif
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
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            nativeFreshRuntime=entry.nativeFreshRuntime
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
            secureStore=entry.secureStore
#endif
        }
#endif
    }
    private let process=getpid()
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
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();defer{condition.unlock()}
        guard next<UInt64.max else{throw AuxDispatcherLifetimeError.exhaustedHandles}
        let handle=next;next += 1;entries[handle]=entry;return handle
    }
    // Trusted in-process operation seam. Scope is not an action argument.
    func withContext<T>(_ handle:UInt64,_ action:(AuxInstallationCommandCore)throws->T)throws->T {
        try withEntry(handle){try action($0.core)}
    }
    fileprivate func withCommandHandler<T>(_ handle:UInt64,_ action:((String,String)throws->String)throws->T)throws->T {
        try withEntry(handle,guardGenericAction:false){entry in
            try action({command,input in try self.runKnownCommand(entry,command:command,input:input)})
        }
    }
    private func dispatchKnownCommand(_ entry:Entry,command:String,input:String)->String {
#if AUX_SCOPED_SECURE_STORE_DISPATCH
        var secureCommands=["secure-save","secure-read","secure-clear"]
#if AUX_ATOMIC_CSK_DISPATCH
        secureCommands.append("csk-publish-absent-or-same")
#endif
        if let secure=entry.secureStore,secureCommands.contains(command){return secure.run(command:command,input:input)}
#endif
#if AUX_MACOS_UTILITY_DISPATCH
        if let reply=entry.macOSUtilities?.run(command:command,input:input){return reply}
#endif
        return entry.core.run(command:command,input:input)
    }
    private func runKnownCommand(_ entry:Entry,command:String,input:String)throws->String {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        if let previous=try reconcileRetainedRead(entry) {
            // Same explicit request gets the ORIGINAL result; no repeated sign,
            // unwrap, credential query or native action occurs. A new request
            // acknowledges the reconciled read and runs only its new action.
            if previous.command==command,previous.inputSha256==Self.requestDigest(input){return previous.response}
        }
#endif
        try requireFreshGuard(entry,moment:.beforeAction)
        let result=dispatchKnownCommand(entry,command:command,input:input)
        do{try requireFreshGuard(entry,moment:.afterAction)}
        catch {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
            // Only this actual source-known route can bind a completed result.
            // Generic trusted closures/account callbacks never enter this path.
            if let failure=error as? AuxNativeFreshGuardFailure,
               failure.disposition == .postOutcomeUnknown,Self.readOnlyCommands.contains(command) {
                condition.lock()
                if entry.nativeGuardFailure==nil,entry.pendingPostGuardObservation != nil {
                    entry.retainedRead=RetainedRead(command:command,inputSha256:Self.requestDigest(input),response:result)
                }
                condition.unlock()
            }
#endif
            throw error
        }
        return result
    }
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
    private func reconcileRetainedRead(_ entry:Entry,closing:Bool=false)throws->RetainedRead? {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock()
        if let lost=entry.nativeGuardFailure{condition.unlock();throw lost}
        guard let pending=entry.pendingPostGuardObservation else{condition.unlock();return nil}
        let permitted=entry.phase == .open || (closing && entry.phase == .retiring)
        guard permitted,let read=entry.retainedRead,let captured=entry.nativeFreshRuntime else{condition.unlock();throw pending}
        guard !entry.reconcilingRead else{condition.unlock();throw AuxDispatcherLifetimeError.reentrantRetirement}
        entry.reconcilingRead=true;condition.unlock()
        defer{if getpid()==process{condition.lock();entry.reconcilingRead=false;condition.broadcast();condition.unlock()}}
        // The actual command has already returned. This checks only current
        // authority; it cannot repeat or reinterpret an unknown write/CAS.
        do{try captured.revalidateCurrentCommandBinding()}
        catch {
            let disposition=classifyAuxNativeFreshGuard(error)
            if disposition == .provenBindingLoss {
                let lost=AuxNativeFreshGuardFailure(moment:.beforeAction,underlying:error,operationError:nil,disposition:.provenBindingLoss)
                condition.lock();entry.nativeGuardFailure=lost;entry.phase = .retiring
                // This reply can never be released under lost authority. Drop
                // only its private response reference; retain failure/context.
                // Swift String storage zeroization is NOT claimed.
                entry.retainedRead=nil
                condition.broadcast();condition.unlock()
#if AUX_MACOS_UTILITY_DISPATCH
                entry.macOSUtilities?.closeAdmission()
#endif
                throw lost
            }
            // Retain exact prior reply/failure on timeout, locked DP or unknown
            // read errors. Later native requests may freshly observe again.
            throw AuxNativeFreshGuardFailure(moment:.beforeAction,underlying:error,operationError:nil,disposition:disposition)
        }
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();defer{condition.unlock()}
        if let lost=entry.nativeGuardFailure{throw lost}
        guard (entry.phase == .open || (closing && entry.phase == .retiring)),entry.pendingPostGuardObservation != nil else{throw AuxDispatcherLifetimeError.retiring}
        entry.pendingPostGuardObservation=nil;entry.retainedRead=nil
        return read
    }
#endif
#if AUX_ATOMIC_CSK_DISPATCH && AUX_SCOPED_SECURE_STORE_DISPATCH
    func withAccountRegistryLock(_ handle:UInt64,_ body:()throws->Int32)throws->Int32 {
        try withEntry(handle){entry in
            guard let secure=entry.secureStore else{throw AuxAccountsCskError.unavailable}
            return try secure.withAccountRegistryLock {
                try self.guardedFreshAction(entry,before:.beforeAccountCallback,after:.afterAccountCallback,afterThrow:.afterThrownAccountCallback,body)
            }
        }
    }
#endif
    private func withEntry<T>(_ handle:UInt64,guardGenericAction:Bool=true,_ action:(Entry)throws->T)throws->T {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
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
          if getpid()==process {
            var current=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
            let count=current[handle,default:1]-1
            if count==0{current.removeValue(forKey:handle)}else{current[handle]=count}
            Thread.current.threadDictionary[threadKey]=current
            entry.execution.unlock()
            condition.lock();entry.active -= 1
            if entry.active==0 && entry.phase == .retiring && !hasUntrackedFreshGuard(entry) {
                entry.phase = .closed;entries.removeValue(forKey:handle)
            }
            condition.broadcast();condition.unlock()
            withExtendedLifetime(entry){} // No imported-owner destructor under registry lock.
          }
        }
        if guardGenericAction{return try guardedFreshAction(entry,before:.beforeAction,after:.afterAction,afterThrow:.afterThrownAction){try action(entry)}}
        return try action(entry)
    }
    private func hasUntrackedFreshGuard(_ entry:Entry)->Bool {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        return entry.nativeGuardFailure != nil || entry.pendingPostGuardObservation != nil
#else
        return false
#endif
    }
    private func requireFreshGuard(_ entry:Entry,moment:AuxNativeFreshGuardMoment,operationError:Error?=nil)throws {
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        guard let captured=entry.nativeFreshRuntime else{return}
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();let prior=entry.nativeGuardFailure ?? entry.pendingPostGuardObservation;let open=entry.phase == .open;condition.unlock()
        if let prior{throw prior}
        let requiresOpen=moment == .beforeAction || moment == .beforeAccountCallback
        guard open || !requiresOpen else{throw AuxDispatcherLifetimeError.retiring}
        do{try captured.revalidateCurrentCommandBinding()}
        catch {
            let classified=classifyAuxNativeFreshGuard(error)
            let disposition:AuxNativeFreshGuardDisposition=classified == .provenBindingLoss ? .provenBindingLoss : (moment.beforeProtectedBoundary ? classified:.postOutcomeUnknown)
            let failure=AuxNativeFreshGuardFailure(moment:moment,underlying:error,operationError:operationError,disposition:disposition)
            // Read-only pre-timeout/unavailable failures refuse this call but
            // permit a later real guard check. They do not poison the owner.
            if disposition == .retryableNoCommand || disposition == .unknownNoCommand{throw failure}
            condition.lock()
            if disposition == .provenBindingLoss {
                entry.nativeGuardFailure=entry.nativeGuardFailure ?? failure;entry.phase = .retiring
                entry.retainedRead=nil // Never retain a now-unusable secret reply.
            }else{
                // An operation may already have happened. Retain an unresolved
                // observation fence, not a permanent identity-loss assertion.
                entry.pendingPostGuardObservation=entry.pendingPostGuardObservation ?? failure
            }
            let retained=entry.nativeGuardFailure ?? entry.pendingPostGuardObservation!;condition.broadcast();condition.unlock()
#if AUX_MACOS_UTILITY_DISPATCH
            if disposition == .provenBindingLoss{entry.macOSUtilities?.closeAdmission()}
#endif
            throw retained
        }
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();let later=entry.nativeGuardFailure ?? entry.pendingPostGuardObservation;let stillOpen=entry.phase == .open;condition.unlock()
        if let later{throw later}
        guard stillOpen || !requiresOpen else{throw AuxDispatcherLifetimeError.retiring}
#endif
    }
    private func guardedFreshAction<T>(_ entry:Entry,before:AuxNativeFreshGuardMoment,after:AuxNativeFreshGuardMoment,afterThrow:AuxNativeFreshGuardMoment,_ action:()throws->T)throws->T {
        try requireFreshGuard(entry,moment:before)
        let result:T
        do{result=try action()}
        catch{
            let original=error
            // An inner acquired callback already records its exact boundary;
            // don't relabel a before-callback timeout as an attempted command.
            if original is AuxNativeFreshGuardFailure{throw original}
            try requireFreshGuard(entry,moment:afterThrow,operationError:original);throw original
        }
        try requireFreshGuard(entry,moment:after)
        return result
    }
    // Owner destruction cannot wait on its own lease; close now and let the
    // last acquired operation remove the entry. No further acquisition succeeds.
    fileprivate func closeOwner(_ handle:UInt64) {
        guard getpid()==process else{return}
        condition.lock()
        guard let entry=entries[handle]else{condition.unlock();return}
        defer{condition.unlock();withExtendedLifetime(entry){}}
        entry.phase = .retiring
#if AUX_MACOS_UTILITY_DISPATCH
        entry.macOSUtilities?.closeAdmission()
#endif
        if entry.active==0 && !hasUntrackedFreshGuard(entry){entry.phase = .closed;entries.removeValue(forKey:handle)}
        condition.broadcast()
    }
    func isAccepting(_ handle:UInt64)->Bool {
        guard getpid()==process else{return false}
        condition.lock();defer{condition.unlock()}
        guard let entry=entries[handle],entry.phase == .open else{return false}
        return !hasUntrackedFreshGuard(entry)
    }
    // 0 idle/no unknown result;1 acquired native call;2 completed unknown read;
    // 3 completed unknown generic/write;4 proven binding loss;-1 no owned entry;
    // -4 wrong process. This says NOTHING about separate OS/PDF image custody.
    func observeOperationState(_ handle:UInt64)->Int32 {
        guard getpid()==process else{return -4}
        condition.lock();defer{condition.unlock()}
        guard let entry=entries[handle]else{return -1}
        if entry.active>0{return 1}
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        if entry.reconcilingRead{return 1}
#endif
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        if entry.nativeGuardFailure != nil{return 4}
        if entry.pendingPostGuardObservation != nil{return entry.retainedRead == nil ? 3:2}
#endif
        return 0
    }
    func retire(_ handle:UInt64)throws {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        let active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        guard active[handle,default:0]==0 else{throw AuxDispatcherLifetimeError.reentrantRetirement}
        condition.lock()
        guard let entry=entries[handle]else{condition.unlock();throw AuxDispatcherLifetimeError.invalidHandle}
        entry.phase = .retiring
#if AUX_MACOS_UTILITY_DISPATCH
        entry.macOSUtilities?.closeAdmission()
#endif
        while entry.active>0 {condition.wait()}
        condition.unlock()
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        // Explicit native close acknowledges any completed READ reply only
        // after real current authority revalidation, with no mutex over it.
        // Unknown writes/generic callbacks cannot pass this reconciliation.
        _ = try reconcileRetainedRead(entry,closing:true)
#endif
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        condition.lock();defer{condition.unlock();withExtendedLifetime(entry){}}
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        if let failure=entry.nativeGuardFailure ?? entry.pendingPostGuardObservation{throw failure}
#endif
        entry.phase = .closed
        entries.removeValue(forKey:handle);condition.broadcast()
    }
}

// Only the trusted Swift host can construct an owner from a checked captured
// context. No C/JS factory accepts scope, JSON rows or arbitrary core callbacks.
final class AuxOwnedCommandDispatcher {
    let handle:UInt64
#if AUX_MACOS_UTILITY_DISPATCH
    // Retain exact immutable custody after registry retirement. This is a native
    // query capability, not a new JS handle or host acceptance declaration.
    private let macOSUtilities:AuxMacOSUtilityCommandCore?
#endif
    func closeOSAdmissionAndDrain(timeout:TimeInterval)->AuxOSDrainResult {
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities?.closeAdmissionAndDrain(timeout:timeout) ?? .notPresent
#else
        .notPresent
#endif
    }
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    init(capturedTerminal:CapturedTerminalCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(capturedTerminal)
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities=nil
#endif
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    init(runtimeCaptured:AuxRuntimeCapturedCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(runtimeCaptured)
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities=nil
#endif
    }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    // Declaration composition only: the sealed type validates actual recovered
    // terminal evidence. This flag supplies no runtime admission or bypass.
    init(recoveredFreshTerminal:RecoveredFreshTerminalCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(recoveredFreshTerminal)
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities=nil
#endif
    }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
    convenience init(nativeFresh:NativeFreshRuntimeCapturedContext)throws {
        try self.init(scopedTerminal:ScopedAuxCommandContext.nativeFresh(nativeFresh))
    }
#endif
    init(scopedTerminal:ScopedAuxCommandContext)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(scopedTerminal)
#if AUX_MACOS_UTILITY_DISPATCH
        macOSUtilities=nil
#endif
    }
#endif
#if AUX_MACOS_UTILITY_DISPATCH
#if !AUX_MINIMAL_RUNTIME_DISPATCH
    init(capturedTerminal:CapturedTerminalCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(capturedTerminal,utilities:macOSUtilities)
        self.macOSUtilities=macOSUtilities
    }
#endif
#if AUX_MINIMAL_RUNTIME_DISPATCH
    init(runtimeCaptured:AuxRuntimeCapturedCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(runtimeCaptured,utilities:macOSUtilities)
        self.macOSUtilities=macOSUtilities
    }
#endif
#if AUX_RECOVERED_FRESH_DISPATCH
    init(recoveredFreshTerminal:RecoveredFreshTerminalCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(recoveredFreshTerminal,utilities:macOSUtilities)
        self.macOSUtilities=macOSUtilities
    }
#endif
#if AUX_SCOPED_SECURE_STORE_DISPATCH
    init(scopedTerminal:ScopedAuxCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws {
        handle=try AuxCommandDispatcherRegistry.shared.install(scopedTerminal,utilities:macOSUtilities)
        self.macOSUtilities=macOSUtilities
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
    case let failure as AuxNativeFreshGuardFailure:
        switch failure.moment {
        case .beforeAction,.beforeAccountCallback:text="Fresh native guard unavailable before command boundary"
        default:text="Fresh native guard unavailable; command outcome unknown"
        }
    case AuxNativeFreshGuardProcessError.wrongProcess:text="Wrong native dispatcher process"
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
            return dispatcherCString(try run(name,value))
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
    catch AuxDispatcherLifetimeError.invalidHandle{return -1}
    catch AuxDispatcherLifetimeError.reentrantRetirement{return -2}
    catch is AuxNativeFreshGuardFailure{return -3}
    catch AuxNativeFreshGuardProcessError.wrongProcess{return -4}
    catch{return -5}
}

#if AUX_ATOMIC_CSK_DISPATCH && AUX_SCOPED_SECURE_STORE_DISPATCH
@_cdecl("AuxNativeContextWithAccountRegistryLock")
func auxNativeContextWithAccountRegistryLock(_ handle:UInt64,_ body:(@convention(c)(UnsafeMutableRawPointer?)->Int32)?,_ context:UnsafeMutableRawPointer?)->Int32 {
    guard let body else{return -1}
    do{return try AuxCommandDispatcherRegistry.shared.withAccountRegistryLock(handle){body(context)}}catch{return -2}
}
#endif

@_cdecl("AuxNativeContextObserveOperationState")
func auxNativeContextObserveOperationState(_ handle:UInt64)->Int32{AuxCommandDispatcherRegistry.shared.observeOperationState(handle)}
