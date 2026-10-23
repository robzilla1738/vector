import CryptoKit
import Darwin
import Foundation

var checks = 0
func check(_ condition: @autoclosure () -> Bool) {
    precondition(condition())
    checks += 1
}
func refuses(_ operation: () throws -> Void) {
    do { try operation(); preconditionFailure("Expected refusal") }
    catch { checks += 1 }
}
let temporary = FileManager.default.temporaryDirectory
    .appendingPathComponent("aux-fresh-home-check-" + UUID().uuidString)
try FileManager.default.createDirectory(
    at: temporary, withIntermediateDirectories: false, attributes: [.posixPermissions: 0o700]
)
defer { try? FileManager.default.removeItem(at: temporary) }
let resolved = realpath(temporary.path, nil)!
let root = String(cString: resolved)
free(resolved)
func parent(_ name: String) throws -> String {
    let path = root + "/" + name
    guard mkdir(path, 0o700) == 0 else { throw AuxFreshHomeError.io(errno) }
    return path
}

let firstParent = try parent("first")
var first: AuxFreshNativeHome? = try .create(inCanonicalPrivateParent: firstParent)
let home = first!.canonicalHome
check(home.hasPrefix(firstParent + "/aux-home-"))
check(first!.scope == SHA256.hash(data: Data(home.utf8)).map { String(format: "%02x", $0) }.joined())
check(UUID(uuidString: first!.transactionId) != nil)
try first!.validateRetainedIdentity()
try first!.requireEmptyBeforeAuthorityGeneration()
checks += 2
let descriptor = try first!.duplicateDirectoryForNativeBootstrap()
var held = stat()
check(fstat(descriptor, &held) == 0 && held.st_mode & 0o777 == 0o700)
let child = openat(descriptor, "synthetic-journal", O_CREAT | O_EXCL | O_WRONLY, 0o600)
check(child >= 0)
close(child)
close(descriptor)
refuses { try first!.requireEmptyBeforeAuthorityGeneration() }
refuses { _ = try AuxFreshNativeHome.create(inCanonicalPrivateParent: firstParent) }
first = nil
check(FileManager.default.fileExists(atPath: home))
check(FileManager.default.fileExists(atPath: firstParent + "/" + AuxFreshNativeHome.reservationName))
refuses { _ = try AuxFreshNativeHome.create(inCanonicalPrivateParent: firstParent) }

let modeParent = try parent("mode")
check(chmod(modeParent, 0o755) == 0)
refuses { _ = try AuxFreshNativeHome.create(inCanonicalPrivateParent: modeParent) }
check(!FileManager.default.fileExists(atPath: modeParent + "/" + AuxFreshNativeHome.reservationName))
let linkParent = try parent("link-target")
let link = root + "/parent-link"
check(symlink(linkParent, link) == 0)
refuses { _ = try AuxFreshNativeHome.create(inCanonicalPrivateParent: link) }

let fifoParent = try parent("fifo")
let fifo = fifoParent + "/" + AuxFreshNativeHome.reservationName
check(mkfifo(fifo, 0o600) == 0)
refuses { _ = try AuxFreshNativeHome.create(inCanonicalPrivateParent: fifoParent) }
var fifoStat = stat()
check(lstat(fifo, &fifoStat) == 0 && fifoStat.st_mode & mode_t(S_IFMT) == mode_t(S_IFIFO))

let partialParent = try parent("partial")
let partial = partialParent + "/" + AuxFreshNativeHome.reservationName
let partialFD = open(partial, O_CREAT | O_EXCL | O_WRONLY, 0o600)
check(partialFD >= 0)
close(partialFD)
refuses { _ = try AuxFreshNativeHome.create(inCanonicalPrivateParent: partialParent) }
let partialBytes = try Data(contentsOf: URL(fileURLWithPath: partial))
check(partialBytes.isEmpty)

let changedParent = try parent("changed")
let changed = try AuxFreshNativeHome.create(inCanonicalPrivateParent: changedParent)
let oldHome = changed.canonicalHome + ".retained"
check(rename(changed.canonicalHome, oldHome) == 0)
check(mkdir(changed.canonicalHome, 0o700) == 0)
refuses { try changed.validateRetainedIdentity() }
check(FileManager.default.fileExists(atPath: oldHome))

let modifiedParent = try parent("modified")
let modified = try AuxFreshNativeHome.create(inCanonicalPrivateParent: modifiedParent)
let reservation = modifiedParent + "/" + AuxFreshNativeHome.reservationName
let modifiedFD = open(reservation, O_WRONLY | O_APPEND | O_NOFOLLOW)
check(modifiedFD >= 0)
check(write(modifiedFD, "x", 1) == 1)
close(modifiedFD)
refuses { try modified.validateRetainedIdentity() }

let racedParent = try parent("race")
let results = NSLock()
var owners: [AuxFreshNativeHome] = []
var failures = 0
DispatchQueue.concurrentPerform(iterations: 2) { _ in
    do {
        let owner = try AuxFreshNativeHome.create(inCanonicalPrivateParent: racedParent)
        results.lock()
        owners.append(owner)
        results.unlock()
    } catch {
        results.lock()
        failures += 1
        results.unlock()
    }
}
check(owners.count == 1 && failures == 1)
try owners[0].validateRetainedIdentity()
checks += 1
print("PASS:\(checks) real disposable filesystem checks; no Security, authority generation or launch")
