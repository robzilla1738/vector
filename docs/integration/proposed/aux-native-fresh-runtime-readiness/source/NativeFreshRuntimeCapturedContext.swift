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
    private init(terminal:NativeFreshTerminalSelection,runtime:AuxRuntimeCapturedCommandContext){
        owner=terminal.context;self.runtime=runtime
        initialSha=terminal.initialJournalSha256;targetSha=terminal.targetJournalSha256
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
        let captured=NativeFreshRuntimeCapturedContext(terminal:terminal,runtime:runtime)
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
