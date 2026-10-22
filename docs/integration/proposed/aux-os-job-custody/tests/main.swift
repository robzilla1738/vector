import Foundation

var checks = 0
func check(_ value: @autoclosure () -> Bool) { precondition(value()); checks += 1 }
func drained(_ value: AuxOSDrainResult) -> Bool { if case .drained = value { return true }; return false }
func pending(_ value: AuxOSDrainResult) -> AuxOSJobSnapshot { if case .pending(let snapshot) = value { return snapshot }; preconditionFailure("Expected pending") }

// Actual shared start/wait/callback mechanism, synthetic delayed QuickLook callback.
let ql = AuxOSJobCustody()
var deliverQL: (() -> Void)?, writes = 0, cancellations = 0
let timeout = AuxUtilityCompletion.tracked(custody: ql, kind: .quickLook, initial: false, timeout: 0, cancel: { job in
    cancellations += 1; job.requestCancellation()
}) { job, complete in
    deliverQL = { let written = job.withWrite { writes += 1; return true }; complete(written ?? false) }
}!
check(!timeout.completed && !timeout.value)
check(cancellations == 1 && ql.snapshot().pendingJobs == 1)
check(ql.snapshot().timedOutJobs == 1 && ql.snapshot().cancellationRequests == 1)
check(pending(ql.closeAdmissionAndDrain(timeout: 0)).pendingJobs == 1)
deliverQL?(); deliverQL = nil
check(writes == 0) // fence checks before even callback mkdir/PNG creation
check(drained(ql.closeAdmissionAndDrain(timeout: 0)))
check(ql.begin(.quickLook) == nil)
var restarted = false
let denied = AuxUtilityCompletion.tracked(custody: ql, kind: .openWith, initial: false, timeout: 0) { _, complete in restarted = true; complete(true) }
check(denied == nil && !restarted)

// Cancel callback genuinely delivered while admission is still open: original
// timeout result remains false, but the synchronized value may have become true.
let cancellationDelivery = AuxOSJobCustody()
var deliveredOnCancel: ((Bool) -> Void)?
let cancelledResult = AuxUtilityCompletion.tracked(custody: cancellationDelivery, kind: .quickLook, initial: false, timeout: 0, cancel: { job in
    job.requestCancellation(); deliveredOnCancel?(true)
}) { _, complete in deliveredOnCancel = complete }!
check(!cancelledResult.completed && cancelledResult.value)
check(drained(cancellationDelivery.closeAdmissionAndDrain(timeout: 0)))

// Neither cancellation nor dropping all callback references fakes completion.
let lost = AuxOSJobCustody()
var missing: ((Bool) -> Void)?
_ = AuxUtilityCompletion.tracked(custody: lost, kind: .quickLook, initial: false, timeout: 0, cancel: { $0.requestCancellation() }) { _, complete in missing = complete }
missing = nil
check(pending(lost.closeAdmissionAndDrain(timeout: 0)).pendingJobs == 1)
check(pending(lost.closeAdmissionAndDrain(timeout: 0)).cancellationRequests == 1)

// Workspace open has no cancel API: timeout remains pending until actual completion.
let workspace = AuxOSJobCustody()
var opened: ((String?) -> Void)?
let opening = AuxUtilityCompletion.tracked(custody: workspace, kind: .openWith, initial: Optional<String>.none, timeout: 0) { _, complete in opened = complete }!
check(!opening.completed && opening.value == nil)
let openingPending = pending(workspace.closeAdmissionAndDrain(timeout: 0))
check(openingPending.pendingJobs == 1 && openingPending.timedOutJobs == 1 && openingPending.cancellationRequests == 0)
opened?(nil); opened = nil
check(drained(workspace.closeAdmissionAndDrain(timeout: 0)))

// An effect admitted before close remains counted even if completion is called
// while its write body is blocked. No lock is held over the callback body.
let concurrent = AuxOSJobCustody(), token = concurrent.begin(.quickLook)!
let entered = DispatchSemaphore(value: 0), finish = DispatchSemaphore(value: 0), exited = DispatchSemaphore(value: 0)
DispatchQueue.global().async {
    _ = token.withWrite { entered.signal(); finish.wait(); return true }
    token.complete(); exited.signal()
}
check(entered.wait(timeout: .now() + 2) == .success)
token.complete()
let writing = pending(concurrent.closeAdmissionAndDrain(timeout: 0))
check(writing.pendingJobs == 1 && writing.activeWrites == 1 && writing.activeEffects == 1)
finish.signal()
check(exited.wait(timeout: .now() + 2) == .success)
check(drained(concurrent.closeAdmissionAndDrain(timeout: 0)))
check(token.withWrite { true } == nil)

// Synchronous inline completion and throwing write both release exact accounting.
let inline = AuxOSJobCustody()
let inlineValue = AuxUtilityCompletion.tracked(custody: inline, kind: .quickLook, initial: false, timeout: 0) { job, complete in
    complete(job.withWrite { true } ?? false)
}!
check(inlineValue.completed && inlineValue.value)
check(drained(inline.closeAdmissionAndDrain(timeout: 0)))
enum CapturedFailure: Error { case write }
let failedWrite = AuxOSJobCustody(), failingToken = failedWrite.begin(.imageWrite)!
do { _ = try failingToken.withWrite { throw CapturedFailure.write }; preconditionFailure() } catch {}
check(failedWrite.snapshot().activeWrites == 0)
failingToken.complete(); failingToken.complete()
check(drained(failedWrite.closeAdmissionAndDrain(timeout: 0)))

final class TrackedCapturedOS: AuxMacOSUtilityBoundary {
    let tracker = AuxOSJobCustody()
    var jobCustody: AuxOSJobCustody? { tracker }
    var deliver: (() -> Void)?, writes = 0, calls = 0
    func fileExists(_ path: String) -> Bool { calls += 1; return true }
    func prepareIconDirectory(_ path: String) {}
    func applications(for file: URL) -> [URL] { [] }
    func defaultApplication(for file: URL) -> URL? { nil }
    func applicationName(_ application: URL) -> String { "Captured" }
    func iconPath(for application: URL, directory: URL) -> String? { nil }
    func application(bundleIdentifier: String) -> URL? { nil }
    func copyFileURL(_ file: URL) -> Bool { calls += 1; return true }
    func openFile(_ file: URL, with application: URL) -> String? { "Captured open failure" }
    func generatePreview(file: String, icon: String, thumbnail: String) -> (thumbnail: Bool, icon: Bool) {
        let result = AuxUtilityCompletion.tracked(custody: tracker, kind: .quickLook, initial: false, timeout: 0, cancel: { $0.requestCancellation() }) { job, complete in
            self.deliver = { let written = job.withWrite { self.writes += 1; return true }; complete(written ?? false) }
        }!
        return (result.value, result.value)
    }
}
let boundary = TrackedCapturedOS(), core = AuxMacOSUtilityCommandCore(boundary: boundary)
let input = #"{"filePath":"/fixture","iconOutputPath":"/icon","thumbnailOutputPath":"/thumb"}"#
let response = try! JSONSerialization.jsonObject(with: Data(core.run(command: "generate-thumbnail", input: input)!.utf8)) as! [String: Any]
check(response["thumbnailGenerated"] as? Bool == false && response["iconGenerated"] as? Bool == false)
check(pending(core.closeAdmissionAndDrain(timeout: 0)).pendingJobs == 1) // sync run lease ended, actual async remains
boundary.deliver?(); boundary.deliver = nil
check(boundary.writes == 0 && drained(core.closeAdmissionAndDrain(timeout: 0)))
let before = boundary.calls
check(core.run(command: "copy-file", input: #"{"filePath":"/fixture"}"#)!.contains("admission is closed"))
check(boundary.calls == before)
check(core.run(command: "unrelated-installation-route", input: "") == nil)
print("\(checks) controlled OS custody checks passed; zero AppKit/QuickLook actions")
