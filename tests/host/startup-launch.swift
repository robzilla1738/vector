// Fixed disposable startup launcher. Source-only until the dedicated builder
// compiles and verifies the helper; never a public browser control interface.
import Darwin
import Foundation
import CryptoKit
import CoreFoundation
import MachO
struct Request: Decodable {
  let kind: String
  let bundle: String
  let fixtureRoot: String
  let trial: String
  let browserBinarySha256: String
  let browserImageUuid: String
}
var startupSpawnAttempted = false
var startupPrelaunchRefusal: [String: Any]?
func fail(_ message: String) -> Never {
  if !startupSpawnAttempted, let record = startupPrelaunchRefusal,
      let bytes = try? JSONSerialization.data(withJSONObject: record, options: [.sortedKeys]), bytes.count <= 2048 {
    FileHandle.standardOutput.write(Data("AUX_STARTUP_REFUSAL_V1 ".utf8))
    FileHandle.standardOutput.write(bytes); FileHandle.standardOutput.write(Data([10]))
  }
  FileHandle.standardError.write(Data((message + "\n").utf8)); exit(1)
}
// Never a caller-provided executable path. The live process supplies both
// loaded-image UUID and proc_pidpath; the opened original bytes supply SHA256.
final class StartupHelperIdentity {
  private let fd: Int32
  private let path: String
  private let initial: stat
  let sha256: String
  let imageUuid: String
  private static func valid(_ value: stat) -> Bool {
    (value.st_mode & S_IFMT) == S_IFREG && value.st_uid == geteuid() &&
      value.st_mode & 0o022 == 0 && value.st_mode & (S_ISUID | S_ISGID) == 0 &&
      value.st_mode & 0o100 != 0 && value.st_size > 0 && value.st_size <= 64 * 1024 * 1024
  }
  private static func same(_ a: stat, _ b: stat) -> Bool {
    valid(a) && valid(b) && a.st_dev == b.st_dev && a.st_ino == b.st_ino && a.st_size == b.st_size &&
      a.st_mtimespec.tv_sec == b.st_mtimespec.tv_sec && a.st_mtimespec.tv_nsec == b.st_mtimespec.tv_nsec &&
      a.st_ctimespec.tv_sec == b.st_ctimespec.tv_sec && a.st_ctimespec.tv_nsec == b.st_ctimespec.tv_nsec
  }
  private static func executablePath() throws -> String {
    var buffer = [CChar](repeating: 0, count: 4 * Int(PATH_MAX))
    guard proc_pidpath(getpid(), &buffer, UInt32(buffer.count)) > 0 else { throw StartupReceiptError.io }
    return String(cString: buffer)
  }
  private static func loadedUuid() throws -> String {
    guard let header = _dyld_get_image_header(0), header.pointee.magic == MH_MAGIC_64 else {
      throw StartupReceiptError.invalidReceipt
    }
    let raw = UnsafeRawPointer(header)
    let h = raw.load(as: mach_header_64.self)
    guard h.ncmds > 0, h.ncmds <= 4096, h.sizeofcmds <= 1024 * 1024 else {
      throw StartupReceiptError.invalidReceipt
    }
    let end = MemoryLayout<mach_header_64>.size + Int(h.sizeofcmds)
    var offset = MemoryLayout<mach_header_64>.size
    var uuid: String?
    for _ in 0..<h.ncmds {
      guard offset <= end - MemoryLayout<load_command>.size else { throw StartupReceiptError.invalidReceipt }
      let command = raw.advanced(by: offset).load(as: load_command.self)
      guard Int(command.cmdsize) >= MemoryLayout<load_command>.size,
            Int(command.cmdsize) <= end - offset, command.cmdsize % 4 == 0 else {
        throw StartupReceiptError.invalidReceipt
      }
      if command.cmd == LC_UUID {
        guard uuid == nil, Int(command.cmdsize) == MemoryLayout<uuid_command>.size else {
          throw StartupReceiptError.invalidReceipt
        }
        // uuid_command contains two uint32 fields followed by sixteen bytes.
        let value = UnsafeRawBufferPointer(start: raw.advanced(by: offset + 8), count: 16)
        uuid = value.map { String(format: "%02x", $0) }.joined()
      }
      offset += Int(command.cmdsize)
    }
    guard offset == end, let result = uuid, result != String(repeating: "0", count: 32) else {
      throw StartupReceiptError.invalidReceipt
    }
    return result
  }
  private static func digest(_ fd: Int32, _ size: Int) throws -> String {
    var hash = SHA256(), buffer = [UInt8](repeating: 0, count: 65536), offset = 0
    while offset < size {
      let wanted = min(buffer.count, size - offset)
      let count = pread(fd, &buffer, wanted, off_t(offset))
      if count < 0 && errno == EINTR { continue }
      guard count > 0 else { throw StartupReceiptError.io }
      hash.update(data: Data(buffer.prefix(count))); offset += count
    }
    return hash.finalize().map { String(format: "%02x", $0) }.joined()
  }
  init() throws {
    let actualPath = try Self.executablePath()
    let opened = open(actualPath, O_RDONLY | O_NOFOLLOW | O_CLOEXEC)
    guard opened >= 0 else { throw StartupReceiptError.invalidReceipt }
    var before = stat(), after = stat(), pathInfo = stat()
    do {
      guard fstat(opened, &before) == 0, Self.valid(before) else { throw StartupReceiptError.invalidReceipt }
      let hash = try Self.digest(opened, Int(before.st_size))
      let uuid = try Self.loadedUuid()
      guard fstat(opened, &after) == 0, lstat(actualPath, &pathInfo) == 0,
            Self.same(before, after), Self.same(before, pathInfo), try Self.executablePath() == actualPath else {
        throw StartupReceiptError.invalidReceipt
      }
      fd = opened; path = actualPath; initial = before; sha256 = hash; imageUuid = uuid
    } catch { close(opened); throw error }
  }
  deinit { close(fd) }
  func validate() throws {
    var current = stat(), pathInfo = stat()
    guard fstat(fd, &current) == 0, lstat(path, &pathInfo) == 0,
          Self.same(initial, current), Self.same(initial, pathInfo),
          try Self.executablePath() == path, try Self.loadedUuid() == imageUuid,
          try Self.digest(fd, Int(initial.st_size)) == sha256 else { throw StartupReceiptError.invalidReceipt }
  }
}
func canonical(_ record: [String: Any]) throws -> Data {
  let data = try JSONSerialization.data(withJSONObject: record, options: [.sortedKeys])
  guard data.count <= 2048 else { throw StartupReceiptError.invalidReceipt }
  return data
}
func emitBytes(_ bytes: Data) {
  FileHandle.standardOutput.write(Data("AUX_STARTUP_LAUNCH_V1 ".utf8))
  FileHandle.standardOutput.write(bytes); FileHandle.standardOutput.write(Data([10]))
}
let childLifetime = StartupChildLifetime()
let bytes = FileHandle.standardInput.readData(ofLength: 8193)
guard bytes.count <= 8192, let object = try? JSONSerialization.jsonObject(with: bytes) as? [String: Any],
      Set(object.keys) == Set(["kind", "bundle", "fixtureRoot", "trial", "browserBinarySha256", "browserImageUuid"]),
      let request = try? JSONDecoder().decode(Request.self, from: bytes),
      ["aux", "stock"].contains(request.kind),
      request.trial.range(of: "^[a-f0-9]{32}$", options: .regularExpression) != nil,
      request.browserBinarySha256.range(of: "^[a-f0-9]{64}$", options: .regularExpression) != nil,
      request.browserImageUuid.range(of: "^[a-f0-9]{32}$", options: .regularExpression) != nil else {
  fail("Invalid fixed startup request")
}
let root = URL(fileURLWithPath: request.fixtureRoot)
let name = root.lastPathComponent
let canonicalRoot = "/private/tmp/" + name
guard ["/tmp", "/private/tmp"].contains(root.deletingLastPathComponent().path),
      request.fixtureRoot == root.path, root.resolvingSymlinksInPath().path == canonicalRoot else {
  fail("Startup fixture root is not owned")
}
let writer: OwnedStartupReceiptDirectory
let build: OwnedStartupBuildIdentity
let helper: StartupHelperIdentity
do {
  writer = try OwnedStartupReceiptDirectory(rootName: name)
  build = try writer.openBuildIdentity()
  helper = try StartupHelperIdentity()
  guard let metadata = try JSONSerialization.jsonObject(with: build.bytes) as? [String: Any],
        Set(metadata.keys) == Set(["producer", "version", "kind", "trial", "helperBinarySha256", "helperSourceSha256", "helperImageUuid"]),
        try canonical(metadata) == build.bytes,
        metadata["producer"] as? String == "aux-native-startup-build",
        let version = metadata["version"] as? NSNumber,
        CFGetTypeID(version) != CFBooleanGetTypeID(), version.doubleValue == 1,
        metadata["kind"] as? String == request.kind, metadata["trial"] as? String == request.trial,
        metadata["helperBinarySha256"] as? String == helper.sha256,
        metadata["helperImageUuid"] as? String == helper.imageUuid,
        metadata["helperSourceSha256"] as? String == startupHelperSourceSha256 else {
    fail("Startup build identity is unpaired")
  }
  try build.validate(); try writer.validate()
} catch { fail("Startup helper identity or fixture admission failed") }
startupPrelaunchRefusal = ["producer": "aux-native-startup-prelaunch-refusal", "version": 1,
  "kind": request.kind, "trial": request.trial, "launcherPid": getpid(),
  "helperBinarySha256": helper.sha256, "helperSourceSha256": startupHelperSourceSha256,
  "browserSpawnAttempted": false]
let profile = canonicalRoot + "/profile"
let bundle = URL(fileURLWithPath: request.bundle)
guard request.bundle == bundle.resolvingSymlinksInPath().path,
      bundle.pathExtension == "app", let info = NSDictionary(contentsOf: bundle.appendingPathComponent("Contents/Info.plist")),
      let identifier = info["CFBundleIdentifier"] as? String,
      let executable = info["CFBundleExecutable"] as? String,
      !executable.isEmpty, !executable.contains("/"), !executable.contains(".."),
      identifier == (request.kind == "aux" ? "dev.aux.browser" : "org.chromium.Chromium") else {
  fail("Startup app identity is invalid")
}
let binary = bundle.appendingPathComponent("Contents/MacOS/" + executable).path
var binaryInfo = stat()
guard lstat(binary, &binaryInfo) == 0, (binaryInfo.st_mode & S_IFMT) == S_IFREG,
      binaryInfo.st_uid == geteuid(), binaryInfo.st_mode & 0o022 == 0 else {
  fail("Startup executable is not the owned regular binary")
}
// Held executable pins come from the caller's independently admitted native pair.
// Complete kernel inventory must succeed before the original spawn can begin.
let cold: StartupColdProcessAudit
do {
  cold = try StartupColdProcessAudit(fixedExecutable: binary,
      manifestSha256: request.browserBinarySha256, manifestImageUuid: request.browserImageUuid)
  try cold.provePrelaunchAbsence()
} catch { fail("Startup cold executable or complete kernel inventory refused") }
// Child stdout/stdin cannot forge or consume the launcher's receipt channel.
// Stderr remains inherited for genuine bounded native producer records.
var actions: posix_spawn_file_actions_t? = nil
guard posix_spawn_file_actions_init(&actions) == 0,
      posix_spawn_file_actions_addopen(&actions, STDIN_FILENO, "/dev/null", O_RDONLY, 0) == 0,
      posix_spawn_file_actions_addopen(&actions, STDOUT_FILENO, "/dev/null", O_WRONLY, 0) == 0 else {
  fail("Startup child channels could not be isolated")
}
var arguments = [binary, "--user-data-dir=" + profile, "--no-first-run", "--no-default-browser-check",
  "--use-mock-keychain", "--password-store=basic"]
if request.kind == "aux" {
  arguments.append(contentsOf: ["--aux-native-performance-observer", "--aux-native-startup-observer"])
} else {
  arguments.append(contentsOf: ["--aux-native-stock-measurement-observer", "--aux-native-stock-startup-observer"])
}
let ownedArguments = arguments.map { strdup($0) }
var argv = ownedArguments + [nil]
var attributes: posix_spawnattr_t? = nil
var defaultSignals = sigset_t(), emptyMask = sigset_t()
sigemptyset(&defaultSignals); sigaddset(&defaultSignals, SIGTERM); sigaddset(&defaultSignals, SIGINT)
sigemptyset(&emptyMask)
guard posix_spawnattr_init(&attributes) == 0,
      posix_spawnattr_setsigdefault(&attributes, &defaultSignals) == 0,
      posix_spawnattr_setsigmask(&attributes, &emptyMask) == 0,
      posix_spawnattr_setflags(&attributes, Int16(POSIX_SPAWN_SETSIGDEF | POSIX_SPAWN_SETSIGMASK)) == 0 else {
  fail("Startup child cancellation dispositions could not be reset")
}
var pid: pid_t = 0
do { try helper.validate(); try build.validate(); try writer.validate() }
catch { posix_spawnattr_destroy(&attributes); posix_spawn_file_actions_destroy(&actions); ownedArguments.forEach { free($0) }; fail("Startup admission changed before spawn") }
// No estimated clock mapping: Chromium FromMachAbsoluteTime uses this clock.
guard childLifetime.beginSpawn() else { fail("Startup launch canceled before spawn") }
startupSpawnAttempted = true
let beforeLaunch = mach_absolute_time()
let result = posix_spawn(&pid, binary, &actions, &attributes, &argv, environ)
let afterLaunch = mach_absolute_time()
childLifetime.spawned(result == 0 && pid > 0 ? pid : nil)
posix_spawnattr_destroy(&attributes)
posix_spawn_file_actions_destroy(&actions)
ownedArguments.forEach { free($0) }
guard result == 0, pid > 0 else { fail("Native startup launch failed") }
do {
  guard !childLifetime.isCanceled() else { throw StartupReceiptError.io }
  try helper.validate(); try build.validate(); try writer.validate()
  let generation = try cold.consumeOriginalChild(pid, launch: beforeLaunch, spawnReturned: afterLaunch)
  let receipt = try canonical(["producer": "aux-native-startup-launch", "version": 1, "kind": request.kind,
    "trial": request.trial, "launcherPid": getpid(), "browserPid": pid,
    "launchMachTicks": String(beforeLaunch), "spawnReturnedMachTicks": String(afterLaunch),
    "helperBinarySha256": helper.sha256, "helperSourceSha256": startupHelperSourceSha256,
    "nonce": UUID().uuidString.lowercased(), "sequence": "1"])
  try writer.publish(receipt)
  try helper.validate(); try build.validate(); try writer.validate()
  guard !childLifetime.isCanceled() else { throw StartupReceiptError.io }
  emitBytes(receipt)
  let kernelReceipt = try canonical(["producer": "aux-native-startup-cold", "version": 1,
    "kind": request.kind, "trial": request.trial, "launcherPid": getpid(), "browserPid": pid,
    "browserBinarySha256": request.browserBinarySha256, "browserImageUuid": generation.child.imageUuid,
    "browserDevice": generation.candidateDevice, "browserInode": generation.candidateInode,
    "browserStartMachTicks": String(generation.child.startMachTicks),
    "inventoryStartedMachTicks": String(generation.inventoryStartedMachTicks),
    "inventoryFinishedMachTicks": String(generation.inventoryFinishedMachTicks),
    "launchMachTicks": String(generation.launchMachTicks),
    "spawnReturnedMachTicks": String(generation.spawnReturnedMachTicks),
    "childObservedMachTicks": String(generation.childObservedMachTicks)])
  guard !childLifetime.isCanceled() else { throw StartupReceiptError.io }
  FileHandle.standardOutput.write(Data("AUX_STARTUP_COLD_V1 ".utf8))
  FileHandle.standardOutput.write(kernelReceipt); FileHandle.standardOutput.write(Data([10]))
} catch {
  FileHandle.standardError.write(Data("Startup admission changed or fixed receipt publication failed\n".utf8))
  childLifetime.requestCancellation()
  do { _ = try childLifetime.waitForExit() }
  catch { dispatchMain() } // bounded cancellation hard deadline exits with failure
  fail("Startup admission changed or fixed receipt publication failed")
}
let status: Int32
do { status = try childLifetime.waitForExit() }
catch {
  FileHandle.standardError.write(Data("Startup child wait failed; bounded cleanup required\n".utf8))
  childLifetime.requestCancellation()
  dispatchMain() // no success receipt; TERM/KILL/reap deadline remains active
}
let exitReceipt = try canonical(["producer": "aux-native-startup-exit", "version": 1, "trial": request.trial,
      "launcherPid": getpid(), "browserPid": pid, "waitStatus": status,
      "cleanupRequested": childLifetime.isCanceled()])
emitBytes(exitReceipt)
