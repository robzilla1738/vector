import Foundation

/// Actual shared callback/wait mechanism, testable without invoking AppKit/QuickLook.
/// A timeout does not destroy callback-owned storage; cancellation is not completion.
enum AuxUtilityCompletion {
    /// Actual asynchronous start/callback custody. Cancellation requests never
    /// discharge the callback's job; only its delivered completion can do that.
    static func tracked<Value>(custody: AuxOSJobCustody, kind: AuxOSJobKind, initial: Value, timeout: TimeInterval, cancel: (AuxOSJobToken) -> Void = { _ in }, start: (AuxOSJobToken, @escaping (Value) -> Void) -> Void) -> (completed: Bool, value: Value)? {
        guard let job = custody.begin(kind) else { return nil }
        return wait(initial: initial, timeout: timeout, cancel: {
            job.markTimedOut(); _ = job.performCancellation { cancel(job) }
        }) { complete in
            let started = job.performIfAdmitted {
                start(job) { value in job.complete(); complete(value) }
                return true
            }
            if started != true { job.complete(); complete(initial) }
        }
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
