// External disposable migration tool. No Security executor or admission grant.
import Foundation

enum DurableCredentialCopyOutcome {case verified(StoredAuxCredentialCopyCheckpoint),unresolved(StoredAuxCredentialCopyCheckpoint),blocked(StoredAuxCredentialCopyCheckpoint)}
final class DurableCapturedAuxCredentialCopy {
    private let binding:CapturedHistoricalAuxCredentialBinding
    private let boundary:AuxCopyOnlyCredentialBoundary
    private let store:PrivateAuxCredentialCopyJournalStore
    private let lock=NSLock()
    private var inFlight=false
    private var fresh:PreparedCapturedAuxCredentialCopy?
    let transactionId:String
    private init(binding:CapturedHistoricalAuxCredentialBinding,boundary:AuxCopyOnlyCredentialBoundary,store:PrivateAuxCredentialCopyJournalStore,transactionId:String,fresh:PreparedCapturedAuxCredentialCopy?){self.binding=binding;self.boundary=boundary;self.store=store;self.transactionId=transactionId;self.fresh=fresh}
    static func begin(canonicalDisposableRoot:String,binding:CapturedHistoricalAuxCredentialBinding,boundary:AuxCopyOnlyCredentialBoundary)throws->DurableCapturedAuxCredentialCopy {
        let prepared=try PreparedCapturedAuxCredentialCopy.prepare(binding:binding,source:boundary.readSource(binding.source),target:boundary.readTarget(binding.target))
        let journal=try AuxCredentialCopyStoreRules.decode(prepared.checkpointBytes())
        let store=try PrivateAuxCredentialCopyJournalStore(canonicalDisposableRoot:canonicalDisposableRoot,transactionId:journal.transactionId)
        _ = try store.commit(journal,expectedHead:nil)
        return .init(binding:binding,boundary:boundary,store:store,transactionId:journal.transactionId,fresh:prepared)
    }
    static func resume(canonicalDisposableRoot:String,transactionId:String,binding:CapturedHistoricalAuxCredentialBinding,boundary:AuxCopyOnlyCredentialBoundary)throws->DurableCapturedAuxCredentialCopy {
        let store=try PrivateAuxCredentialCopyJournalStore(canonicalDisposableRoot:canonicalDisposableRoot,transactionId:transactionId)
        guard let current=try store.loadCurrent(),current.journal.bindingHash==binding.sha256 else{throw AuxCredentialCopyStoreError.corruptCheckpoint}
        // No restored draft/intent can manufacture the lost process's one shot.
        return .init(binding:binding,boundary:boundary,store:store,transactionId:transactionId,fresh:nil)
    }
    func performOneStep()throws->DurableCredentialCopyOutcome {
        lock.lock()
        guard !inFlight else{lock.unlock();throw AuxCredentialCopyStoreError.busy}
        inFlight=true;let prepared=fresh;fresh=nil;lock.unlock()
        defer{lock.lock();inFlight=false;lock.unlock()}
        guard let current=try store.loadCurrent(),current.journal.bindingHash==binding.sha256 else{throw AuxCredentialCopyStoreError.corruptCheckpoint}
        if current.journal.phase == .blocked{return .blocked(current)}
        if let prepared,current.journal.phase == .draft,
           try prepared.checkpointBytes()==current.journal.canonicalBytes() {
            let intent=try prepared.prepareIntent(afterDraft:current.capturedCheckpoint())
            let acknowledged=try store.commit(intent,expectedHead:current.sha256)
            // Intent publication and readback must succeed in THIS invocation.
            // A thrown/uncertain publication consumes fresh before any callback.
            return try persist(prepared.attemptAdd(afterIntent:acknowledged.capturedCheckpoint(),boundary:boundary),after:acknowledged)
        }
        let source=boundary.readSource(binding.source),target=boundary.readTarget(binding.target)
        guard case .bytes(let payload)=source,payload.count==current.journal.payloadBytes,credentialCopyHash(payload)==current.journal.payloadHash else {
            var blocked=current.journal;blocked.phase = .blocked;blocked.revision += 1;blocked.reason="source-changed-or-unavailable"
            return .blocked(try store.commit(blocked,expectedHead:current.sha256))
        }
        let restored=try PreparedCapturedAuxCredentialCopy.restore(binding:binding,capturedJournal:current.journal.canonicalBytes(),source:source)
        return try persist(restored.reconcile(source:source,target:target),after:current)
    }
    private func persist(_ outcome:AuxCredentialCopyOutcome,after previous:StoredAuxCredentialCopyCheckpoint)throws->DurableCredentialCopyOutcome {
        switch outcome {
        case .verified(let j):return .verified(try store.commit(j,expectedHead:previous.sha256))
        case .unresolved(let j):return .unresolved(try store.commit(j,expectedHead:previous.sha256))
        case .blocked(let j):return .blocked(try store.commit(j,expectedHead:previous.sha256))
        case .refused:throw AuxCredentialCopyError.phase
        }
    }
}
