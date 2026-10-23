import Foundation
import Security
import Darwin

var checks = 0
func check(_ condition: @autoclosure () -> Bool) { precondition(condition()); checks += 1 }
func refuses(_ action: () throws -> Void) {
    do { try action(); preconditionFailure("Expected refusal") }
    catch { checks += 1 }
}
let temporary = FileManager.default.temporaryDirectory
    .appendingPathComponent("aux-native-capture-check-" + UUID().uuidString)
try FileManager.default.createDirectory(at: temporary, withIntermediateDirectories: false, attributes: [.posixPermissions: 0o700])
defer { try? FileManager.default.removeItem(at: temporary) }
let resolved = realpath(temporary.path, nil)!
let root = String(cString: resolved)
free(resolved)
let group = "9F2JXY8TCK.dev.aux.synthetic-fresh"
func fixture(_ name: String) throws -> (AuxAuthenticatedFreshBootstrapPolicy, AuxFreshNativeHome) {
    let parent = root + "/" + name
    guard mkdir(parent, 0o700) == 0 else { throw AuxFreshHomeError.io(errno) }
    // Captured reader fixture only; actual signature/policy decoding is NOT
    // exercised here. The real authenticated reader was separately typechecked.
    let contents = AuxFreshBootstrapPolicyContents(
        role: .cli, canonicalPrivateParent: parent, accessGroup: group
    )
    let policy = AuxAuthenticatedFreshBootstrapPolicy(contents: contents)
    if name == "ordinary" {
        let parserInput = try JSONSerialization.data(withJSONObject: [
            "format": AuxFreshBootstrapPolicyContents.format, "role": "cli",
            "canonicalPrivateParent": parent, "accessGroup": group,
            "authoritySelection": AuxFreshBootstrapPolicyContents.authoritySelection,
        ])
        let accepted = (try? AuxFreshBootstrapPolicyContents.decode(parserInput)) != nil
        print("DISPOSABLE-POLICY-PARSER: accepted=\(accepted); canonical=\(parent); standardized=\(URL(fileURLWithPath: parent).standardizedFileURL.path)")
    }
    return (policy, try .create(inCanonicalPrivateParent: parent))
}
func reset() {
    CapturedPolicyState.calls = 0
    CapturedPolicyState.failAt = nil
    AuxFreshSecureCaptureFixture.calls = 0
    AuxFreshSecureCaptureFixture.effect = { _ in .absent }
}
reset()
let (policy, home) = try fixture("ordinary")
let capture = try AuxFreshNativeSecureCapture.capture(policy: policy, home: home)
check(AuxFreshSecureCaptureFixture.calls == 5 && CapturedPolicyState.calls == 2)
check(capture.targetSelectors.map(\.row) == [.metadata, .signing, .kem, .wrappedRoot])
let service = "aux." + home.scope + ".installation.v2"
check(capture.targetSelectors.map(\.service).allSatisfy { $0 == service })
check(capture.targetSelectors.map(\.account) == ["meta", "sig", "kem", "dk"].map { service + "." + $0 })
check(capture.selectors.allSatisfy { $0.accessGroup == group })
check(capture.stageSelector.service == "aux." + home.scope + ".install.secure-stage.v1")
check(capture.stageSelector.account == "aux." + home.scope + ".fresh." + home.transactionId.lowercased())
for selector in capture.selectors {
    let query = AuxFreshNativeSecureCapture.readQuery(selector)
    check(query[kSecAttrAccessGroup as String] as? String == group)
    check(query[kSecUseDataProtectionKeychain as String] as? Bool == true)
    check(query[kSecMatchLimit as String] as? String == kSecMatchLimitOne as String)
}
let secondCapture = try AuxFreshNativeSecureCapture.capture(policy: policy, home: home)
try capture.takeAbsentForGeneration()
check(AuxFreshSecureCaptureFixture.calls == 15)
let calls = AuxFreshSecureCaptureFixture.calls
refuses { try secondCapture.takeAbsentForGeneration() }
refuses { try capture.takeAbsentForGeneration() }
check(AuxFreshSecureCaptureFixture.calls == calls)
let reservationHash = try home.currentReservationSha256()
check(reservationHash.count == 64)

for row in AuxFreshSecureRow.allCases {
    for mode in 0..<3 {
        reset()
        let (policy, home) = try fixture(row.rawValue + "-" + String(mode))
        AuxFreshSecureCaptureFixture.effect = { selected in
            guard selected.row == row else { return .absent }
            return mode == 0 ? .present : mode == 1 ? .unavailable(errSecInteractionNotAllowed) : .invalid
        }
        refuses { _ = try AuxFreshNativeSecureCapture.capture(policy: policy, home: home) }
    }
}
reset()
let (changedPolicy, changedHome) = try fixture("changed-after-read")
AuxFreshSecureCaptureFixture.effect = { selected in
    if selected.row == .secureStage {
        let fd = try changedHome.duplicateDirectoryForNativeBootstrap()
        defer { close(fd) }
        let file = openat(fd, "unexpected", O_CREAT | O_EXCL | O_WRONLY, 0o600)
        guard file >= 0 else { throw AuxFreshHomeError.io(errno) }
        close(file)
    }
    return .absent
}
refuses { _ = try AuxFreshNativeSecureCapture.capture(policy: changedPolicy, home: changedHome) }
reset()
let (retryPolicy, retryHome) = try fixture("failed-consumed")
let retry = try AuxFreshNativeSecureCapture.capture(policy: retryPolicy, home: retryHome)
AuxFreshSecureCaptureFixture.effect = { _ in .unavailable(errSecInteractionNotAllowed) }
refuses { try retry.takeAbsentForGeneration() }
let failedCalls = AuxFreshSecureCaptureFixture.calls
AuxFreshSecureCaptureFixture.effect = { _ in .absent }
refuses { try retry.takeAbsentForGeneration() }
check(AuxFreshSecureCaptureFixture.calls == failedCalls)
reset()
let (mismatchPolicy, mismatchHome) = try fixture("policy-change")
CapturedPolicyState.failAt = 2
refuses { _ = try AuxFreshNativeSecureCapture.capture(policy: mismatchPolicy, home: mismatchHome) }

let data = Data([1]) as CFData
if case .absent = AuxFreshNativeSecureCapture.classify(status: errSecItemNotFound, result: nil) { checks += 1 } else { preconditionFailure() }
if case .invalid = AuxFreshNativeSecureCapture.classify(status: errSecItemNotFound, result: data) { checks += 1 } else { preconditionFailure() }
if case .unavailable(let status) = AuxFreshNativeSecureCapture.classify(status: errSecInteractionNotAllowed, result: nil) { check(status == errSecInteractionNotAllowed) } else { preconditionFailure() }
let invalidValues: [CFTypeRef?] = [nil, "invalid" as CFString, Data() as CFData, Data(count: 16_385) as CFData]
for value in invalidValues {
    if case .invalid = AuxFreshNativeSecureCapture.classify(status: errSecSuccess, result: value) { checks += 1 } else { preconditionFailure() }
}
if case .present = AuxFreshNativeSecureCapture.classify(status: errSecSuccess, result: data) { checks += 1 } else { preconditionFailure() }
print("PASS:\(checks) exact selector/classifier/captured-effect/real-home checks; no authenticated loader, Security or generation executed")
