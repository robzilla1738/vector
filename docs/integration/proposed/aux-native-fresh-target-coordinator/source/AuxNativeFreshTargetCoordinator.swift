// Process-local Add ticket; durable disk intent alone cannot recreate one.
import Foundation

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
