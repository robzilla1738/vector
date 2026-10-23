// Fixture-only effects. These types prove neither signed policy nor durable
// native ticket acceptance; production typecheck uses their actual source types.
import Foundation

struct NativeFreshStagedContext {
    let journal: NativeFreshBootstrapJournal
    let durableJournalSha256: String
    func revalidateNativeStageBinding() throws { try CapturedNativeContext.revalidate() }
}
enum CapturedNativeError: Error { case stale, consumed }
enum CapturedNativeContext {
    static var revalidate: () throws -> Void = {}
}
final class AuxNativeFreshTargetWriteIntent {
    let row: String
    let initialJournalSha256: String
    let reservationTransactionId: String
    let intentJournalSha256 = String(repeating: "7", count: 64)
    private var consumed = false
    var isCurrent = true
    init(row: String, context: NativeFreshStagedContext) {
        self.row = row
        initialJournalSha256 = context.durableJournalSha256
        reservationTransactionId = context.journal.reservationTransactionId
    }
    func consumeOnceForNativeBoundary() throws {
        guard !consumed, isCurrent else { throw CapturedNativeError.consumed }
        consumed = true
    }
}
