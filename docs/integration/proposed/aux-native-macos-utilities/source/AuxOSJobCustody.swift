import Foundation

public enum AuxOSJobKind: String { case command, systemRead, clipboard, imageWrite, quickLook, openWith }
/// Instance-owned custody, not host authentication/admission proof. Closure is final.
/// Completion is explicit: dropped callbacks/tokens never silently complete a job.
public final class AuxOSJobCustody: @unchecked Sendable {
    private struct Job { let kind: AuxOSJobKind; var effects = 0; var writes = 0; var completion = false; var timedOut = false; var cancelled = false }
    private let condition = NSCondition()
    private var accepting = true
    private var jobs: [UInt64: Job] = [:]
    private var next: UInt64 = 1
    public init() {}
    public func begin(_ kind: AuxOSJobKind) -> AuxOSJobToken? {
        condition.lock(); defer { condition.unlock() }
        guard accepting, next < UInt64.max else { return nil }
        let id = next; next += 1; jobs[id] = Job(kind: kind)
        return AuxOSJobToken(custody: self, id: id)
    }
    public var isAccepting: Bool { condition.lock(); defer { condition.unlock() }; return accepting }
    public func closeAdmission() { condition.lock(); accepting = false; condition.broadcast(); condition.unlock() }
    public func snapshot() -> AuxOSJobSnapshot { condition.lock(); defer { condition.unlock() }; return snapshotLocked() }
    private func snapshotLocked() -> AuxOSJobSnapshot {
        AuxOSJobSnapshot(pendingJobs: jobs.count, activeEffects: jobs.values.reduce(0) { $0 + $1.effects }, activeWrites: jobs.values.reduce(0) { $0 + $1.writes }, timedOutJobs: jobs.values.filter { $0.timedOut }.count, cancellationRequests: jobs.values.filter { $0.cancelled }.count)
    }
    public func closeAdmissionAndDrain(timeout: TimeInterval) -> AuxOSDrainResult {
        condition.lock(); defer { condition.unlock() }
        accepting = false
        guard timeout.isFinite, timeout >= 0 else { return .pending(snapshotLocked()) }
        let deadline = Date().addingTimeInterval(timeout)
        while !jobs.isEmpty {
            guard condition.wait(until: deadline) || jobs.isEmpty else { return .pending(snapshotLocked()) }
        }
        return .drained
    }
    fileprivate func perform<T>(_ id: UInt64, write: Bool, allowClosed: Bool = false, _ body: () throws -> T) rethrows -> T? {
        condition.lock()
        guard (accepting || allowClosed), var job = jobs[id], !job.completion else { condition.unlock(); return nil }
        job.effects += 1; if write { job.writes += 1 }; jobs[id] = job
        condition.unlock()
        // Admission and accounting happen atomically. Close may occur now, but
        // this already admitted effect keeps drain pending until the body exits.
        defer { endEffect(id, write: write) }
        return try body()
    }
    private func endEffect(_ id: UInt64, write: Bool) {
        condition.lock(); defer { condition.unlock() }
        guard var job = jobs[id] else { return }
        job.effects -= 1; if write { job.writes -= 1 }
        if job.completion && job.effects == 0 { jobs.removeValue(forKey: id) } else { jobs[id] = job }
        condition.broadcast()
    }
    fileprivate func complete(_ id: UInt64) {
        condition.lock(); defer { condition.unlock() }
        guard var job = jobs[id] else { return }
        job.completion = true
        if job.effects == 0 { jobs.removeValue(forKey: id) } else { jobs[id] = job }
        condition.broadcast()
    }
    fileprivate func timedOut(_ id: UInt64, cancellation: Bool) {
        condition.lock(); defer { condition.unlock() }
        guard var job = jobs[id] else { return }
        job.timedOut = true; job.cancelled = job.cancelled || cancellation; jobs[id] = job
    }
}

public final class AuxOSJobToken: @unchecked Sendable {
    private let custody: AuxOSJobCustody
    private let id: UInt64
    fileprivate init(custody: AuxOSJobCustody, id: UInt64) { self.custody = custody; self.id = id }
    public func performIfAdmitted<T>(_ body: () throws -> T) rethrows -> T? { try custody.perform(id, write: false, body) }
    /// Every callback filesystem write must pass this fence before any mkdir/write.
    public func withWrite<T>(_ body: () throws -> T) rethrows -> T? { try custody.perform(id, write: true, body) }
    /// Cancellation is allowed after closure, but still owns an accounted effect.
    /// A completed/missing job does not start a redundant untracked cancel action.
    func performCancellation<T>(_ body: () throws -> T) rethrows -> T? { try custody.perform(id, write: false, allowClosed: true, body) }
    public func markTimedOut() { custody.timedOut(id, cancellation: false) }
    public func requestCancellation() { custody.timedOut(id, cancellation: true) }
    public func complete() { custody.complete(id) }
    // Deliberately no completion-on-deinit: cancelled/dropped callback is not proof.
}
