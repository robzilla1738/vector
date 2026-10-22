import Foundation
import CryptoKit

var checks = 0
func check(_ value: @autoclosure () -> Bool) { precondition(value()); checks += 1 }
func drained(_ value: AuxOSDrainResult) -> Bool { if case .drained = value { return true }; return false }
func pending(_ value: AuxOSDrainResult) -> Bool { if case .pending(let state) = value { return state.pendingJobs > 0 }; return false }
func context() throws -> AuxRuntimeCapturedCommandContext {
    var raw = Data(repeating: 0, count: 32); raw[31] = 15
    let signing = try P256.Signing.PrivateKey(rawRepresentation: raw)
    raw[31] = 16; let kem = try P256.KeyAgreement.PrivateKey(rawRepresentation: raw)
    let wrap = try AuxNativeEnvelopeV2.wrap(root: Data(repeating: 15, count: 32), existingPublicKey: kem.publicKey.x963Representation)
    let metadata = Data(#"{"scheme":"p256_v1","key_storage":"software"}"#.utf8)
    let rows = ["metadata": metadata, "signing": signing.rawRepresentation, "kem": kem.rawRepresentation, "wrappedRoot": try wrap.auxJson()]
    let hashes = rows.mapValues { SHA256.hash(data: $0).map { String(format: "%02x", $0) }.joined() }
    let selection = try AuxRuntimeSelection(scope: String(repeating: "f", count: 64), generationId: UUID().uuidString, accessGroup: "TEST.aux.synthetic", scheme: "p256_v1", signingPublicKey: signing.publicKey.x963Representation, kemPublicKey: kem.publicKey.x963Representation, targetHashes: hashes)
    return try AuxRuntimeCapturedCommandContext.validate(selection: selection, rows: AuxRuntimeTargetRows(metadata: .bytes(metadata), signing: .bytes(signing.rawRepresentation), kem: .bytes(kem.rawRepresentation), wrappedRoot: .bytes(try wrap.auxJson())))
}
func run(_ handle: UInt64, _ command: String, _ input: String = "") -> String {
    let c = Array(command.utf8), i = Array(input.utf8)
    return c.withUnsafeBufferPointer { c in i.withUnsafeBufferPointer { i in
        guard let result = auxNativeContextRun(handle, c.baseAddress, c.count, i.baseAddress, i.count) else { return "" }
        defer { auxNativeResultFree(result) }; return String(cString: result)
    }}
}
final class CapturedOS: AuxMacOSUtilityBoundary {
    let jobCustody: AuxOSJobCustody?
    var deliver: (() -> Void)?, writes = 0
    var closeOnApps = false, closeOnCopy = false
    init(custody: AuxOSJobCustody?) { jobCustody = custody }
    func fileExists(_ path: String) -> Bool { true }
    func prepareIconDirectory(_ path: String) {}
    func applications(for file: URL) -> [URL] { if closeOnApps { jobCustody?.closeAdmission() }; return [] }
    func defaultApplication(for file: URL) -> URL? { nil }
    func applicationName(_ application: URL) -> String { "Captured" }
    func iconPath(for application: URL, directory: URL) -> String? { nil }
    func application(bundleIdentifier: String) -> URL? { nil }
    func copyFileURL(_ file: URL) -> Bool { if closeOnCopy { jobCustody?.closeAdmission(); return true }; return false }
    func openFile(_ file: URL, with application: URL) -> String? { "Captured failure" }
    func generatePreview(file: String, icon: String, thumbnail: String) -> (thumbnail: Bool, icon: Bool) {
        guard let custody = jobCustody else { return (false, false) }
        let result = AuxUtilityCompletion.tracked(custody: custody, kind: .quickLook, initial: false, timeout: 0, cancel: { $0.requestCancellation() }) { job, complete in
            self.deliver = { let value = job.withWrite { self.writes += 1; return true }; complete(value ?? false) }
        }!
        return (result.value, result.value)
    }
}
let input = #"{"filePath":"/fixture","iconOutputPath":"/icon","thumbnailOutputPath":"/thumb"}"#
let terminal = try context(), boundary = CapturedOS(custody: AuxOSJobCustody())
let capability = AuxMacOSUtilityCommandCore(boundary: boundary)
let owner = try AuxOwnedCommandDispatcher(runtimeCaptured: terminal, macOSUtilities: capability)
check(run(owner.handle, "install-status").contains("p256_v1"))
check(run(owner.handle, "generate-thumbnail", input).contains("thumbnailGenerated"))
check(auxNativeContextRetire(owner.handle) == 0)
check(run(owner.handle, "install-status").contains("Invalid dispatcher handle"))
check(pending(owner.closeOSAdmissionAndDrain(timeout: 0))) // exact capability survives registry removal
boundary.deliver?(); boundary.deliver = nil
check(boundary.writes == 0 && drained(owner.closeOSAdmissionAndDrain(timeout: 0)))
check(capability.run(command: "generate-thumbnail", input: input)!.contains("admission is closed"))

let deinitBoundary = CapturedOS(custody: AuxOSJobCustody())
let deinitCapability = AuxMacOSUtilityCommandCore(boundary: deinitBoundary)
var closingOwner: AuxOwnedCommandDispatcher? = try AuxOwnedCommandDispatcher(runtimeCaptured: terminal, macOSUtilities: deinitCapability)
_ = run(closingOwner!.handle, "generate-thumbnail", input)
closingOwner = nil // nonblocking destruction must still close OS admission
check(pending(deinitCapability.closeAdmissionAndDrain(timeout: 0)))
deinitBoundary.deliver?(); deinitBoundary.deliver = nil
check(deinitBoundary.writes == 0 && drained(deinitCapability.closeAdmissionAndDrain(timeout: 0)))

let absent = try AuxOwnedCommandDispatcher(runtimeCaptured: terminal)
if case .notPresent = absent.closeOSAdmissionAndDrain(timeout: 0) { check(true) } else { preconditionFailure("Absence is not unknown custody") }
try absent.retire()
let untracked = try AuxOwnedCommandDispatcher(runtimeCaptured: terminal, macOSUtilities: AuxMacOSUtilityCommandCore(boundary: CapturedOS(custody: nil)))
if case .untracked = untracked.closeOSAdmissionAndDrain(timeout: 0) { check(true) } else { preconditionFailure("Untracked cannot claim absence or drain") }
try untracked.retire()

// Cancellation itself is an in-flight effect, even if its delivered callback
// completes inline before cancel returns. Drain cannot precede cancel completion.
let cancelled = AuxOSJobCustody(), cancelEntered = DispatchSemaphore(value: 0), finishCancel = DispatchSemaphore(value: 0), done = DispatchSemaphore(value: 0)
DispatchQueue.global().async {
    var callback: ((Bool) -> Void)?
    _ = AuxUtilityCompletion.tracked(custody: cancelled, kind: .quickLook, initial: false, timeout: 0, cancel: { job in
        job.requestCancellation(); callback?(true); cancelEntered.signal(); finishCancel.wait()
    }) { _, complete in callback = complete }
    done.signal()
}
check(cancelEntered.wait(timeout: .now() + 2) == .success)
check(pending(cancelled.closeAdmissionAndDrain(timeout: 0)))
finishCancel.signal()
check(done.wait(timeout: .now() + 2) == .success)
check(drained(cancelled.closeAdmissionAndDrain(timeout: 0)))
// Controlled real begin->close->start race through the production start helper.
let raced = AuxOSJobCustody(), unusedJob = raced.begin(.openWith)!
raced.closeAdmission()
var osStarted = false
let refusedStart = AuxUtilityCompletion.tracked(job: unusedJob, initial: Optional<String>.none, timeout: 0) { _, complete in
    osStarted = true; complete(nil)
}
check(refusedStart == nil && !osStarted)
check(drained(raced.closeAdmissionAndDrain(timeout: 0)))

let partialApps = CapturedOS(custody: AuxOSJobCustody()); partialApps.closeOnApps = true
let partialCore = AuxMacOSUtilityCommandCore(boundary: partialApps)
let appResult = partialCore.run(command: "list-open-apps", input: #"{"filePath":"/fixture"}"#)!
check(appResult.contains("admission is closed") && !appResult.contains("apps"))
check(drained(partialCore.closeAdmissionAndDrain(timeout: 0)))
let partialCopy = CapturedOS(custody: AuxOSJobCustody()); partialCopy.closeOnCopy = true
let copyCore = AuxMacOSUtilityCommandCore(boundary: partialCopy)
let copyResult = copyCore.run(command: "copy-file", input: #"{"filePath":"/fixture"}"#)!
check(copyResult.contains("admission is closed") && !copyResult.contains("success"))
print("\(checks) actual owned C-route/custody checks passed; software authority and captured OS only")
