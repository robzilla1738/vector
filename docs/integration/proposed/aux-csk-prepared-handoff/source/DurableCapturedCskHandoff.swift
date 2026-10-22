// Captured external migration coordinator. No Security adapter/admission/custody grant.
import Foundation
import CryptoKit

enum DurableCskHandoffOutcome {case verified(StoredCskHandoffCheckpoint),unresolved(StoredCskHandoffCheckpoint),blocked(StoredCskHandoffCheckpoint)}
final class DurableCapturedCskHandoff {
    private let binding:CapturedHistoricalAuxCredentialBinding
    private let accountId:Int64
    private let owner:CapturedCskOwner?
    private let root:SymmetricKey
    private let boundary:AuxCopyOnlyCredentialBoundary
    private let store:PrivateCskHandoffJournalStore
    private let lock=NSLock()
    private var inFlight=false
    private var fresh:PreparedCapturedCskV2?
    let transactionId:String
    private init(binding:CapturedHistoricalAuxCredentialBinding,accountId:Int64,owner:CapturedCskOwner?,root:Data,boundary:AuxCopyOnlyCredentialBoundary,store:PrivateCskHandoffJournalStore,transactionId:String,fresh:PreparedCapturedCskV2?){self.binding=binding;self.accountId=accountId;self.owner=owner;self.root=SymmetricKey(data:root);self.boundary=boundary;self.store=store;self.transactionId=transactionId;self.fresh=fresh}
    static func begin(canonicalDisposableRoot:String,binding:CapturedHistoricalAuxCredentialBinding,accountId:Int64,expectedOwner:CapturedCskOwner?,capturedRoot:Data,preparedBytes:Data,boundary:AuxCopyOnlyCredentialBoundary)throws->DurableCapturedCskHandoff {
        guard case .bytes(let source)=boundary.readSource(binding.source),case .missing=boundary.readTarget(binding.target)else{throw CapturedCskHandoffError.binding}
        let prepared=try PreparedCapturedCskV2.authenticate(binding:binding,accountId:accountId,expectedOwner:expectedOwner,source:source,prepared:preparedBytes,capturedRoot:capturedRoot)
        let j=CskHandoffJournal(format:"aux.csk.prepared-handoff.v2",transactionId:prepared.preparationId,bindingHash:binding.sha256,sourceHash:prepared.sourceHash,targetHash:prepared.targetHash,sourceBytes:prepared.sourceBytes,targetBytes:prepared.targetBytes,phase:.draft,revision:0,reason:nil)
        let store=try PrivateCskHandoffJournalStore(canonicalDisposableRoot:canonicalDisposableRoot,transactionId:j.transactionId)
        _ = try store.commit(j,expectedHead:nil)
        return .init(binding:binding,accountId:accountId,owner:expectedOwner,root:capturedRoot,boundary:boundary,store:store,transactionId:j.transactionId,fresh:prepared)
    }
    static func resume(canonicalDisposableRoot:String,transactionId:String,binding:CapturedHistoricalAuxCredentialBinding,accountId:Int64,expectedOwner:CapturedCskOwner?,capturedRoot:Data,boundary:AuxCopyOnlyCredentialBoundary)throws->DurableCapturedCskHandoff {
        guard capturedRoot.count==32,(0...9_007_199_254_740_991).contains(accountId),binding.logicalKeyHash==credentialCopyHash(Data("aux.csk_\(accountId)".utf8)),expectedOwner==nil || expectedOwner!.accountId==accountId else{throw CapturedCskHandoffError.binding}
        let store=try PrivateCskHandoffJournalStore(canonicalDisposableRoot:canonicalDisposableRoot,transactionId:transactionId)
        guard let current=try store.loadCurrent(),current.journal.bindingHash==binding.sha256 else{throw CskHandoffStoreError.corruptCheckpoint}
        // Hash-only disk state cannot reconstruct lost randomized ciphertext.
        // Even a restored draft has no Add capability.
        return .init(binding:binding,accountId:accountId,owner:expectedOwner,root:capturedRoot,boundary:boundary,store:store,transactionId:transactionId,fresh:nil)
    }
    func performOneStep()throws->DurableCskHandoffOutcome {
        lock.lock();guard !inFlight else{lock.unlock();throw CskHandoffStoreError.busy}
        inFlight=true;let prepared=fresh;fresh=nil;lock.unlock()
        defer{lock.lock();inFlight=false;lock.unlock()}
        guard let current=try store.loadCurrent(),current.journal.bindingHash==binding.sha256 else{throw CskHandoffStoreError.corruptCheckpoint}
        if current.journal.phase == .blocked{return .blocked(current)}
        if let prepared,current.journal.phase == .draft,
           current.journal.sourceHash==prepared.sourceHash,current.journal.targetHash==prepared.targetHash,
           current.journal.sourceBytes==prepared.sourceBytes,current.journal.targetBytes==prepared.targetBytes {
            var j=current.journal;j.phase = .intent;j.revision += 1
            let intent=try store.commit(j,expectedHead:current.sha256)
            guard sourceMatches(intent.journal,boundary.readSource(binding.source))else{return try blocked("source-changed-or-unavailable",after:intent)}
            guard case .missing=boundary.readTarget(binding.target)else{return try blocked("target-not-absent",after:intent)}
            let status:CapturedAuxCredentialAddStatus
            do{status=try prepared.addCapturedTarget(after:intent,using:boundary)}catch{return .unresolved(intent)}
            switch status {
            case .duplicate:return try blocked("add-duplicate",after:intent)
            case .failure:return try blocked("add-failed",after:intent)
            case .added:return try observe(after:intent)
            }
        }
        return try observe(after:current)
    }
    private func sourceMatches(_ j:CskHandoffJournal,_ capture:CapturedAuxCredentialRow)->Bool {
        guard case .bytes(let bytes)=capture else{return false}
        return bytes.count==j.sourceBytes && credentialCopyHash(bytes)==j.sourceHash
    }
    private func blocked(_ reason:String,after checkpoint:StoredCskHandoffCheckpoint)throws->DurableCskHandoffOutcome {
        var j=checkpoint.journal;j.phase = .blocked;j.revision += 1;j.reason=reason
        return .blocked(try store.commit(j,expectedHead:checkpoint.sha256))
    }
    private func observe(after checkpoint:StoredCskHandoffCheckpoint)throws->DurableCskHandoffOutcome {
        let j=checkpoint.journal,source=boundary.readSource(binding.source)
        guard sourceMatches(j,source),case .bytes(let original)=source else{return try blocked("source-changed-or-unavailable",after:checkpoint)}
        switch boundary.readTarget(binding.target) {
        case .missing:return j.phase == .verified ? try blocked("verified-target-missing",after:checkpoint):.unresolved(checkpoint)
        case .bytes(let bytes):
            guard bytes.count==j.targetBytes,credentialCopyHash(bytes)==j.targetHash else{return try blocked("target-conflict-or-unauthenticated",after:checkpoint)}
            var rootBytes=root.withUnsafeBytes{Data($0)};defer{rootBytes.resetBytes(in:0..<rootBytes.count)}
            do{_ = try PreparedCapturedCskV2.authenticate(binding:binding,accountId:accountId,expectedOwner:owner,source:original,prepared:bytes,capturedRoot:rootBytes)}catch{return try blocked("target-conflict-or-unauthenticated",after:checkpoint)}
            if j.phase == .verified{return .verified(checkpoint)}
            var next=j;next.phase = .verified;next.revision += 1
            return .verified(try store.commit(next,expectedHead:checkpoint.sha256))
        case .inaccessible,.invalid:return try blocked("target-unavailable",after:checkpoint)
        }
    }
}
