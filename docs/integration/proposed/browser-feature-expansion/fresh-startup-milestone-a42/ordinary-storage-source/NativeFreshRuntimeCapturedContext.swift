// Native-only typed terminal consumer. No NAPI/bootstrap admission or effects
// occur until a trusted native caller deliberately invokes capture below.
import Foundation
import Darwin

enum NativeFreshRuntimeConsumerError:Error {case busy,binding}
final class NativeFreshRuntimeCapturedContext {
    let owner:NativeFreshStagedContext
    let runtime:AuxRuntimeCapturedCommandContext
    private let initialSha:String
    private let targetSha:String
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    private let retainedInitialStore:PrivateNativeFreshBootstrapJournalStore
    private let retainedTargetStore:PrivateNativeFreshTargetJournalStore
#endif
    private init(terminal:NativeFreshTerminalSelection,runtime:AuxRuntimeCapturedCommandContext)throws {
        let owner=terminal.context
        self.owner=owner;self.runtime=runtime
        initialSha=terminal.initialJournalSha256;targetSha=terminal.targetJournalSha256
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
        let fd=try owner.duplicateRetainedHomeDescriptor();defer{Darwin.close(fd)}
        retainedInitialStore=try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot:owner.canonicalHome,journal:owner.journal,retainedRootDescriptor:fd)
        retainedTargetStore=try PrivateNativeFreshTargetJournalStore(canonicalDisposableRoot:owner.canonicalHome,transactionId:owner.journal.reservationTransactionId,retainedRootDescriptor:fd)
#endif
    }
    // Actual protected read path, deliberately not invoked by parser/compile tests.
    // No captured caller rows, selected-home strings or Boolean grants accepted.
    static func capture(_ terminal:NativeFreshTerminalSelection)throws->NativeFreshRuntimeCapturedContext {
        let owner=terminal.context
        guard let lease=owner.targetProgressLease.tryAcquire()else{throw NativeFreshRuntimeConsumerError.busy}
        defer{lease.finish()}
        try owner.revalidateNativeStageBinding()
        guard terminal.policySha256==owner.journal.policySha256,
              terminal.reservationSha256==owner.journal.reservationSha256,
              terminal.selection.scope==owner.journal.scope,
              terminal.selection.accessGroup==owner.authenticatedPolicy.contents.accessGroup else{throw NativeFreshRuntimeConsumerError.binding}
        let rows=try AuxRuntimeDataProtectionCapture.capture(terminal.selection)
        let runtime=try AuxRuntimeCapturedCommandContext.validate(selection:terminal.selection,rows:rows)
        let captured=try NativeFreshRuntimeCapturedContext(terminal:terminal,runtime:runtime)
        try captured.revalidate()
        return captured
    }
    // No injected grant: use this exact immutable selected runtime plus actual
    // current four-row recapture/import and the genuine ready HEAD/live guard.
    func revalidateCurrentCommandBinding()throws {
        try revalidate()
        let current=try AuxRuntimeCapturedCommandContext.validate(selection:runtime.selection,
            rows:AuxRuntimeDataProtectionCapture.capture(runtime.selection))
        guard current.selection.targetHashes==runtime.selection.targetHashes,
              current.selection.scope==runtime.selection.scope,
              current.selection.generationId==runtime.selection.generationId else{throw NativeFreshRuntimeConsumerError.binding}
        try revalidate()
    }
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    func revalidateOrdinaryStorageBinding()throws {
        try owner.revalidateOrdinaryStorageBinding()
        guard initialSha==owner.durableJournalSha256,runtime.selection.scope==owner.journal.scope,
              runtime.selection.generationId==owner.journal.reservationTransactionId,
              runtime.selection.accessGroup==owner.journal.accessGroup,
              runtime.selection.targetHashes==owner.journal.targetHashes,
              let initial=try retainedInitialStore.loadRetained(),initial.journal==owner.journal,
              initial.sha256==initialSha,
              let current=try retainedTargetStore.loadRetained(),current.sha256==targetSha,
              current.journal.phase == .ready else{throw NativeFreshRuntimeConsumerError.binding}
        try NativeFreshTargetTransaction.validateBinding(current.journal,initial:owner.journal,initialSha256:initialSha)
    }
#endif
    func revalidate()throws {
        try owner.revalidateNativeStageBinding()
        guard initialSha==owner.durableJournalSha256,runtime.selection.scope==owner.journal.scope,
              runtime.selection.generationId==owner.journal.reservationTransactionId,
              runtime.selection.accessGroup==owner.journal.accessGroup,
              runtime.selection.targetHashes==owner.journal.targetHashes else{throw NativeFreshRuntimeConsumerError.binding}
        let fd=try owner.duplicateRetainedHomeDescriptor();defer{Darwin.close(fd)}
        let store=try PrivateNativeFreshTargetJournalStore(canonicalDisposableRoot:owner.canonicalHome,
            transactionId:owner.journal.reservationTransactionId,retainedRootDescriptor:fd)
        guard let current=try store.loadCurrent(),current.sha256==targetSha,current.journal.phase == .ready else{throw NativeFreshRuntimeConsumerError.binding}
        try NativeFreshTargetTransaction.validateBinding(current.journal,initial:owner.journal,initialSha256:initialSha)
    }
}
