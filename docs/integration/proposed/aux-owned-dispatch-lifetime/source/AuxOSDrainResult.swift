import Foundation

public struct AuxOSJobSnapshot {
    public let pendingJobs: Int
    public let activeEffects: Int
    public let activeWrites: Int
    public let timedOutJobs: Int
    public let cancellationRequests: Int
}
public enum AuxOSDrainResult {
    case drained
    /// Native owner has no attached OS capability; not a broader host receipt.
    case notPresent
    case pending(AuxOSJobSnapshot)
    /// A captured/other boundary that has no tracked OS capability cannot prove drain.
    case untracked
}
