    // No JS/exported handle endpoint invokes this. The exact retained Swift
    // Owner supplies its own opaque identity to the real native WorkerHost.
    func completeBrowserCleanShutdown(_ handle:UInt64,ownerPointer:UnsafeMutableRawPointer)throws {
        guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
        let active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
        guard active[handle,default:0]==0 else{throw AuxDispatcherLifetimeError.reentrantRetirement}
        condition.lock()
        guard let entry=entries[handle],entry.phase == .retiring,entry.active==0,
              entry.browserGrantUnresolved,!hasUntrackedFreshGuard(entry) else{
            condition.unlock();throw AuxDispatcherLifetimeError.retiring
        }
        entry.active += 1 // retain owner and pending completion through both fsyncs
        condition.unlock()
        entry.execution.lock()
        defer {
            entry.execution.unlock()
            condition.lock();entry.active -= 1;condition.broadcast();condition.unlock()
            withExtendedLifetime(entry){}
        }
        // This native query must resolve the actual retained owner, not trust
        // status flags from the embedding or a renderer. Pending/unknown refuses.
        guard nativeOwnerCleanSettlement(ownerPointer)==0 else{throw AuxDispatcherLifetimeError.retiring}
#if AUX_MACOS_UTILITY_DISPATCH
        if let utility=entry.macOSUtilities {
            switch utility.closeAdmissionAndDrain(timeout:0) {
            case .notPresent,.drained:break
            case .pending,.untracked:throw AuxDispatcherLifetimeError.retiring
            }
        }
#endif
#if AUX_NATIVE_FRESH_RUNTIME_CONSUMER
        guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
        try captured.revalidateCurrentCommandBinding()
        guard nativeOwnerCleanSettlement(ownerPointer)==0 else{throw AuxDispatcherLifetimeError.retiring}
        try captured.owner.completeBrowserCleanShutdown()
#else
        throw AuxDispatcherLifetimeError.invalidInput
#endif
        condition.lock();defer{condition.unlock()}
        // The retired entry never reopened during the physical finalization.
        // Other calls were refused while active=1 and root Host admission closed.
        guard entry.phase == .retiring,entry.active==1,!hasUntrackedFreshGuard(entry) else{throw AuxDispatcherLifetimeError.retiring}
        entry.browserGrantUnresolved=false
        condition.broadcast()
    }
