// Process-local Add ticket; durable disk intent alone cannot recreate one.
import Foundation
import Darwin

final class AuxNativeFreshTargetWriteIntent {
    let row:String
    let intentJournalSha256:String
    let initialJournalSha256:String
    let reservationTransactionId:String
    private let store:PrivateNativeFreshTargetJournalStore
    private let expected:NativeFreshTargetJournal
    private let lock=NSLock()
    private var consumed=false
    fileprivate init(newlyCommitted stored:StoredNativeFreshTargetCheckpoint,store:PrivateNativeFreshTargetJournalStore)throws {
        try stored.journal.validate()
        guard stored.journal.phase == .intent,stored.journal.lastAddStatus==nil,let row=stored.journal.intended.last else{throw NativeFreshTargetError.phase}
        self.row=row;intentJournalSha256=stored.sha256;initialJournalSha256=stored.journal.initialJournalSha256;reservationTransactionId=stored.journal.transactionId;self.store=store;expected=stored.journal
    }
    // Real boundary calls this immediately before Add. No protected callback is
    // invoked under the latch; current durable HEAD is independently re-read.
    func consumeOnceForNativeBoundary()throws {
        lock.lock();defer{lock.unlock()}
        guard !consumed,let current=try store.loadCurrent(),current.sha256==intentJournalSha256,current.journal==expected,current.journal.phase == .intent,current.journal.lastAddStatus==nil,current.journal.intended.last==row else{throw NativeFreshTargetError.consumed}
        consumed=true
    }
}

#if AUX_NATIVE_FRESH_TARGET_FIXTURE
enum NativeFreshTargetFixtureEffects {
    static var capture:(()->[String:AuxNativeFreshTargetRead])!
    static var add:((AuxNativeFreshTargetWriteIntent)throws->AuxNativeFreshTargetAddStatus)!
}
#else
struct NativeFreshTerminalSelection {
    let core:AuxInstallationCommandCore
    let selection:AuxRuntimeSelection
    let initialJournalSha256:String
    let targetJournalSha256:String
    let policySha256:String
    let reservationSha256:String
    fileprivate init(core:AuxInstallationCommandCore,selection:AuxRuntimeSelection,initial:NativeFreshBootstrapJournal,initialSha:String,targetSha:String){self.core=core;self.selection=selection;initialJournalSha256=initialSha;targetJournalSha256=targetSha;policySha256=initial.policySha256;reservationSha256=initial.reservationSha256}
}
#endif
enum NativeFreshTargetOutcome {
    case progressed(StoredNativeFreshTargetCheckpoint)
    case unresolved(String)
    case blocked(StoredNativeFreshTargetCheckpoint)
#if AUX_NATIVE_FRESH_TARGET_FIXTURE
    case fixtureReadyCheckpoint(String) // No core/selection authority in this fixture.
#else
    case ready(NativeFreshTerminalSelection)
#endif
}
final class AuxNativeFreshTargetCoordinator {
    private let initial:NativeFreshBootstrapJournal
    private let initialSha:String
    private let store:PrivateNativeFreshTargetJournalStore
    private let operationLock=NSLock()
    private var advancing=false
#if AUX_NATIVE_FRESH_TARGET_FIXTURE
    private let fixtureRoot:String
    private init(root:String,initial:NativeFreshBootstrapJournal,sha:String,store:PrivateNativeFreshTargetJournalStore){fixtureRoot=root;self.initial=initial;initialSha=sha;self.store=store}
    static func capturedFixture(root:String,initial:NativeFreshBootstrapJournal)throws->AuxNativeFreshTargetCoordinator {
        let initialStore=try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot:root,journal:initial)
        let bound=try initialStore.publish()
        let store=try PrivateNativeFreshTargetJournalStore(canonicalDisposableRoot:root,transactionId:initial.transactionId)
        return .init(root:root,initial:initial,sha:bound.sha256,store:store)
    }
#else
    private let context:NativeFreshStagedContext
    private let boundary:AuxNativeFreshTargetBoundary
    init(context:NativeFreshStagedContext)throws {
        try context.revalidateNativeStageBinding()
        let boundary=try AuxNativeFreshTargetBoundary(context:context)
        let fd=try context.capture.home.duplicateDirectoryForNativeBootstrap();defer{Darwin.close(fd)}
        let store=try PrivateNativeFreshTargetJournalStore(canonicalDisposableRoot:context.capture.home.canonicalHome,transactionId:context.journal.transactionId,retainedRootDescriptor:fd)
        self.context=context;self.boundary=boundary;initial=context.journal;initialSha=context.durableJournalSha256;self.store=store
    }
#endif
    private func validateContext()throws {
#if AUX_NATIVE_FRESH_TARGET_FIXTURE
        let initialStore=try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot:fixtureRoot,journal:initial)
        guard let bound=try initialStore.load(),bound.sha256==initialSha else{throw NativeFreshTargetError.binding}
#else
        try context.revalidateNativeStageBinding()
#endif
    }
    private func captureTargets()throws->[String:AuxNativeFreshTargetRead] {
#if AUX_NATIVE_FRESH_TARGET_FIXTURE
        return NativeFreshTargetFixtureEffects.capture()
#else
        return try boundary.captureTargets()
#endif
    }
    private func add(_ intent:AuxNativeFreshTargetWriteIntent)throws->AuxNativeFreshTargetAddStatus {
#if AUX_NATIVE_FRESH_TARGET_FIXTURE
        return try NativeFreshTargetFixtureEffects.add(intent)
#else
        return try boundary.addTarget(intent)
#endif
    }
    private func persist(_ next:NativeFreshTargetJournal,after old:StoredNativeFreshTargetCheckpoint)throws->StoredNativeFreshTargetCheckpoint{try store.commit(next,expectedHead:old.sha256)}
    private func observe(_ stored:StoredNativeFreshTargetCheckpoint)throws->NativeFreshTargetOutcome {
        let captures=try captureTargets()
        switch try NativeFreshTargetTransaction.observe(stored.journal,initial:initial,captured:captures) {
        case .unresolved:return .unresolved("pending-row-absent-no-add-replay")
        case .advanced(let next):return .progressed(try persist(next,after:stored))
        case .blocked(let next):return .blocked(try persist(next,after:stored))
        }
    }
    // Recreated coordinators consume the same actual retained staged context.
    // They do NOT adopt a home or reconstruct native admission from disk JSON.
    func advanceOne()throws->NativeFreshTargetOutcome {
        operationLock.lock();guard !advancing else{operationLock.unlock();return .unresolved("advance-in-flight")};advancing=true;operationLock.unlock()
        defer{operationLock.lock();advancing=false;operationLock.unlock()}
        try validateContext()
        let stored:StoredNativeFreshTargetCheckpoint
        if let current=try store.loadCurrent(){stored=current}else{stored=try store.commit(NativeFreshTargetTransaction.initial(initial,sha256:initialSha),expectedHead:nil)}
        let j=stored.journal;try NativeFreshTargetTransaction.validateBinding(j,initial:initial,initialSha256:initialSha)
        switch j.phase {
        case .blocked:return .blocked(stored)
        case .intent,.awaitingReadback:return try observe(stored) // NO ticket/Add branch.
        case .draft:
            let intended=try NativeFreshTargetTransaction.intend(j,initial:initial,captured:captureTargets())
            if intended.phase == .blocked{return .blocked(try persist(intended,after:stored))}
            let committed=try persist(intended,after:stored)
            // This only constructor call follows THIS process's actual NEW CAS.
            let ticket=try AuxNativeFreshTargetWriteIntent(newlyCommitted:committed,store:store)
            let status:AuxNativeFreshTargetAddStatus
            do{status=try add(ticket)}catch{return .unresolved("target-add-outcome-unknown-no-replay")}
            let reported=try persist(NativeFreshTargetTransaction.recordAdd(committed.journal,status:status),after:committed)
            if reported.journal.phase == .intent{return .unresolved("target-add-non-success-observation-required")}
            return try observe(reported)
        case .ready:
            if let failure=try NativeFreshTargetTransaction.readyFailure(j,initial:initial,captured:captureTargets()){return .blocked(try persist(NativeFreshTargetTransaction.block(j,failure),after:stored))}
#if AUX_NATIVE_FRESH_TARGET_FIXTURE
            return .fixtureReadyCheckpoint(stored.sha256)
#else
            // Actual boundary independently re-captures/re-imports real target
            // signer/KEM/wrapped root, not merely the staged or public hashes.
            let core=try boundary.validateStageAndMakeCommandCore()
            try validateContext()
            guard let current=try store.loadCurrent(),current.sha256==stored.sha256,current.journal==j,
                  let scheme=initial.publicDescriptor["scheme"],let sigText=initial.publicDescriptor["sig_pub"],let kemText=initial.publicDescriptor["kem_pub"],let sig=Data(base64Encoded:sigText),let kem=Data(base64Encoded:kemText)else{throw NativeFreshTargetError.binding}
            let selection=try AuxRuntimeSelection(scope:initial.scope,generationId:initial.reservationTransactionId,accessGroup:initial.accessGroup,scheme:scheme,signingPublicKey:sig,kemPublicKey:kem,targetHashes:initial.targetHashes)
            return .ready(.init(core:core,selection:selection,initial:initial,initialSha:initialSha,targetSha:stored.sha256))
#endif
        }
    }
}
