import Foundation

/// Actual shared callback/wait mechanism, testable without invoking AppKit/QuickLook.
/// A timeout does not destroy callback-owned storage; cancellation is not completion.
enum AuxUtilityCompletion {
    /// Actual asynchronous start/callback custody. Cancellation requests never
    /// discharge the callback's job; only its delivered completion can do that.
    static func tracked<Value>(custody: AuxOSJobCustody, kind: AuxOSJobKind, initial: Value, timeout: TimeInterval, cancel: (AuxOSJobToken) -> Void = { _ in }, start: (AuxOSJobToken, @escaping (Value) -> Void) -> Void) -> (completed: Bool, value: Value)? {
        guard let job = custody.begin(kind) else { return nil }
        return tracked(job: job, initial: initial, timeout: timeout, cancel: cancel, start: start)
    }

    // Internal actual start boundary, also usable by a controlled native fixture
    // with a real token closed between begin and start. No synthetic admission flag.
    static func tracked<Value>(job: AuxOSJobToken, initial: Value, timeout: TimeInterval, cancel: (AuxOSJobToken) -> Void = { _ in }, start: (AuxOSJobToken, @escaping (Value) -> Void) -> Void) -> (completed: Bool, value: Value)? {
        let semaphore = DispatchSemaphore(value: 0), result = CallbackResult(initial)
        let started = job.performIfAdmitted {
            start(job) { value in result.set(value); job.complete(); semaphore.signal() }
            return true
        }
        // No OS request began. Discharge the unused job, not an invented callback
        // completion that could be interpreted as successful open-with(nil).
        guard started == true else { job.complete(); return nil }
        let completed = semaphore.wait(timeout: .now() + timeout) == .success
        if !completed { job.markTimedOut(); _ = job.performCancellation { cancel(job) } }
        return (completed, result.get())
    }

    static func wait<Value>(initial: Value, timeout: TimeInterval, cancel: () -> Void = {}, start: (@escaping (Value) -> Void) -> Void) -> (completed: Bool, value: Value) {
        let semaphore = DispatchSemaphore(value: 0), result = CallbackResult(initial)
        start { value in result.set(value); semaphore.signal() }
        let completed = semaphore.wait(timeout: .now() + timeout) == .success
        if !completed { cancel() }
        return (completed, result.get())
    }
}
private final class CallbackResult<Value>: @unchecked Sendable {
    private let lock = NSLock()
    private var value: Value
    init(_ value: Value) { self.value = value }
    func set(_ value: Value) { lock.lock(); defer { lock.unlock() }; self.value = value }
    func get() -> Value { lock.lock(); defer { lock.unlock() }; return value }
}
