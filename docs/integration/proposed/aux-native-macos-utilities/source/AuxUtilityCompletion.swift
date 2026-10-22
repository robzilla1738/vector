import Foundation

/// Actual shared callback/wait mechanism, testable without invoking AppKit/QuickLook.
/// A timeout does not destroy callback-owned storage; cancellation is not completion.
enum AuxUtilityCompletion {
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
