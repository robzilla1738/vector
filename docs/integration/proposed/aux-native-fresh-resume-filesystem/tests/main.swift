import Foundation
import Darwin
import CryptoKit

var checks = 0
func check(_ value: @autoclosure () -> Bool, line: Int = #line) {
    guard value() else { fputs("Failed assertion at line \(line)\n", stderr); exit(1) }
    checks += 1
}
func refuses(line: Int = #line, _ action: () throws -> Void) {
    do { try action() } catch { checks += 1; return }
    fputs("Expected refusal at line \(line)\n", stderr); exit(1)
}
let proposed = FileManager.default.temporaryDirectory.appendingPathComponent("aux-resume-fs-" + UUID().uuidString).path
try FileManager.default.createDirectory(atPath: proposed, withIntermediateDirectories: false, attributes: [.posixPermissions: 0o700])
let canonical = realpath(proposed, nil)!
let root = String(cString: canonical)
free(canonical)
defer { try? FileManager.default.removeItem(atPath: root) }
let group = "9F2JXY8TCK.dev.aux.synthetic-resume"
func parent(_ name: String) throws -> (String, AuxAuthenticatedFreshBootstrapPolicy) {
    let path = root + "/" + name
    guard mkdir(path, 0o700) == 0 else { throw AuxFreshHomeError.io(errno) }
    return (path, .init(contents: .init(role: .cli, canonicalPrivateParent: path, accessGroup: group)))
}
func entries(_ path: String) throws -> [String] { try FileManager.default.contentsOfDirectory(atPath: path).sorted() }
func replaceMarker(_ parent: String, bytes: Data) throws {
    let marker = parent + "/" + AuxFreshNativeHome.reservationName
    let fd = open(marker, O_WRONLY | O_TRUNC | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC)
    guard fd >= 0 else { throw AuxFreshHomeError.io(errno) }
    defer { close(fd) }
    let count = bytes.withUnsafeBytes { Darwin.write(fd, $0.baseAddress, $0.count) }
    guard count == bytes.count else { throw AuxFreshHomeError.io(errno) }
}
func initial(_ home: AuxFreshNativeHome, _ policy: AuxAuthenticatedFreshBootstrapPolicy) throws -> NativeFreshBootstrapJournal {
    let service = "aux." + home.scope + ".installation.v2"
    let bindings = zip(nativeFreshBootstrapRoles, ["meta", "sig", "kem", "dk"]).map {
        NativeFreshTargetBinding(row: $0.0, target: .init(service: service, account: service + "." + $0.1, accessGroup: group))
    }
    // Nonsecret shape/hash fixture only; not a real staged authority or keys.
    let hashes = Dictionary(uniqueKeysWithValues: nativeFreshBootstrapRoles.map { ($0, String(repeating: "a", count: 64)) })
    let publicDescriptor = ["scheme": "p256_v1", "sig_pub": Data([4, 1]).base64EncodedString(), "kem_pub": Data([4, 2]).base64EncodedString()]
    let candidate = nativeBootstrapHash(try JSONSerialization.data(withJSONObject: [
        "format": "aux.install.fresh.cohort.v1", "targets": hashes, "public": publicDescriptor,
    ], options: [.sortedKeys, .withoutEscapingSlashes]))
    return .init(
        format: "aux.install.native-fresh.initial-journal.v2", reservationTransactionId: home.transactionId,
        reservationSha256: try home.currentReservationSha256(), policySha256: policy.policySha256,
        scope: home.scope, role: "cli", accessGroup: group, targetBindings: bindings,
        stageSelector: .init(service: "aux." + home.scope + ".install.secure-stage.v1", account: "aux." + home.scope + ".fresh." + home.transactionId.lowercased(), accessGroup: group),
        initialObservedAbsentRoles: ["metadata", "signing", "kem", "wrappedRoot", "secureStage"],
        candidateSha256: candidate, publicDescriptor: publicDescriptor, targetHashes: hashes,
        stagePayloadSha256: String(repeating: "c", count: 64)
    )
}
let (ordinaryParent, ordinaryPolicy) = try parent("ordinary")
let fresh = try AuxFreshNativeHome.create(inCanonicalPrivateParent: ordinaryParent)
let resumed = try AuxResumedFreshNativeHome.reopen(policy: ordinaryPolicy)
let alias = try AuxResumedFreshNativeHome.reopen(policy: ordinaryPolicy)
check(resumed === alias)
check(resumed.canonicalHome == fresh.canonicalHome && resumed.scope == fresh.scope && resumed.transactionId == fresh.transactionId)
check(resumed.targetProgressLease === fresh.targetProgressLease)
let held = fresh.targetProgressLease.tryAcquire()!
check(resumed.targetProgressLease.tryAcquire() == nil)
held.finish()
let resumedOperation = resumed.targetProgressLease.tryAcquire()!
check(fresh.targetProgressLease.tryAcquire() == nil)
resumedOperation.finish()
let beforeMissing = try entries(fresh.canonicalHome)
refuses { _ = try resumed.readExistingInitialJournal() }
let afterMissing = try entries(fresh.canonicalHome)
check(beforeMissing.isEmpty && afterMissing == beforeMissing)
let journal = try initial(fresh, ordinaryPolicy)
let fd = try fresh.duplicateDirectoryForNativeBootstrap()
let store = try PrivateNativeFreshBootstrapJournalStore(canonicalDisposableRoot: fresh.canonicalHome, journal: journal, retainedRootDescriptor: fd)
close(fd)
let checkpoint = try store.publish()
let beforeRead = try entries(fresh.canonicalHome)
let directory = fresh.canonicalHome + "/.aux-native-fresh-initial-journal-v2-" + fresh.transactionId.lowercased()
let lockPath = directory + "/LOCK"
guard unlink(lockPath) == 0 else { throw AuxFreshHomeError.io(errno) }
let insideBefore = try entries(directory)
let observed = try resumed.readExistingInitialJournal()
check(observed.sha256 == checkpoint.sha256 && observed.journal == checkpoint.journal)
let insideAfter = try entries(directory)
check(insideBefore == insideAfter && !insideAfter.contains("LOCK"))
let rootAfterRead = try entries(fresh.canonicalHome)
check(rootAfterRead == beforeRead)
check(CapturedPolicyEffects.revalidations > 0)

let (absentParent, absentPolicy) = try parent("absent")
refuses { _ = try AuxResumedFreshNativeHome.reopen(policy: absentPolicy) }
let absentEntries = try entries(absentParent)
check(absentEntries.isEmpty)
for (name, bytes) in [
    ("malformed", Data("{".utf8)),
    ("duplicate", Data("{\"format\":\"aux.first-installation.reservation.v1\",\"format\":\"aux.first-installation.reservation.v1\"}".utf8)),
] {
    let (path, policy) = try parent(name)
    let owner = try AuxFreshNativeHome.create(inCanonicalPrivateParent: path)
    try replaceMarker(path, bytes: bytes)
    refuses { _ = try AuxResumedFreshNativeHome.reopen(policy: policy) }
    refuses { try owner.validateRetainedIdentity() }
}
let (unsafeParent, unsafePolicy) = try parent("unsafe-mode")
let unsafe = try AuxFreshNativeHome.create(inCanonicalPrivateParent: unsafeParent)
guard chmod(unsafe.canonicalHome, 0o755) == 0 else { throw AuxFreshHomeError.io(errno) }
refuses { _ = try AuxResumedFreshNativeHome.reopen(policy: unsafePolicy) }
guard chmod(unsafe.canonicalHome, 0o700) == 0 else { throw AuxFreshHomeError.io(errno) }
let (changedParent, changedPolicy) = try parent("changed-path")
let changed = try AuxFreshNativeHome.create(inCanonicalPrivateParent: changedParent)
let changedResume = try AuxResumedFreshNativeHome.reopen(policy: changedPolicy)
let oldHome = changed.canonicalHome + ".retained"
guard rename(changed.canonicalHome, oldHome) == 0, mkdir(changed.canonicalHome, 0o700) == 0 else { throw AuxFreshHomeError.io(errno) }
refuses { try changedResume.validateRetainedIdentity() }
refuses { _ = try changedResume.duplicateDirectoryForNativeBootstrap() }
// Newly opening the substitute path cannot adopt the old retained journal.
refuses { _ = try AuxResumedFreshNativeHome.reopen(policy: changedPolicy) }
let (symlinkParent, symlinkPolicy) = try parent("symlink-marker")
let symlinkOwner = try AuxFreshNativeHome.create(inCanonicalPrivateParent: symlinkParent)
let marker = symlinkParent + "/" + AuxFreshNativeHome.reservationName
let keptMarker = marker + ".retained"
guard rename(marker, keptMarker) == 0, symlink(keptMarker, marker) == 0 else { throw AuxFreshHomeError.io(errno) }
refuses { _ = try AuxResumedFreshNativeHome.reopen(policy: symlinkPolicy) }
refuses { try symlinkOwner.validateRetainedIdentity() }
print("PASS:\(checks) actual resumed-owner disposable filesystem checks; captured policy is not authenticated; no Security or generation")
