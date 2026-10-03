// Internal fixed startup helper producer. Original held candidate and kernel
// process receipts are required; a disposable profile is never a cold proof.
import Darwin
import Foundation
import CryptoKit
import MachO

enum StartupColdAuditError: Error { case incompleteInventory, candidateChanged, existingCandidate, invalidChild }
struct StartupKernelGeneration: Equatable {
  let pid: pid_t
  let imageUuid: String
  let startMachTicks: UInt64
}
struct StartupColdProcessReceipt {
  let inventoryStartedMachTicks: UInt64
  let inventoryFinishedMachTicks: UInt64
  let launchMachTicks: UInt64
  let spawnReturnedMachTicks: UInt64
  let childObservedMachTicks: UInt64
  let child: StartupKernelGeneration
  let candidateDevice: String
  let candidateInode: String
}
final class StartupColdProcessAudit {
  private let path: String
  private let fd: Int32
  private let initial: stat
  private let expectedSha256: String
  private let expectedUuid: String
  private var inventory: (UInt64, UInt64)?
  private var attempted = false
  private var consumed = false
  private static func same(_ a: stat, _ b: stat) -> Bool {
    a.st_dev == b.st_dev && a.st_ino == b.st_ino && a.st_mode == b.st_mode &&
      a.st_uid == b.st_uid && a.st_size == b.st_size &&
      a.st_mtimespec.tv_sec == b.st_mtimespec.tv_sec && a.st_mtimespec.tv_nsec == b.st_mtimespec.tv_nsec &&
      a.st_ctimespec.tv_sec == b.st_ctimespec.tv_sec && a.st_ctimespec.tv_nsec == b.st_ctimespec.tv_nsec
  }
  private static func digest(_ fd: Int32, _ size: Int) throws -> String {
    var hash = SHA256(), offset = 0, bytes = [UInt8](repeating: 0, count: 65536)
    while offset < size {
      let count = pread(fd, &bytes, min(bytes.count, size - offset), off_t(offset))
      if count < 0 && errno == EINTR { continue }
      guard count > 0 else { throw StartupColdAuditError.candidateChanged }
      hash.update(data: Data(bytes.prefix(count))); offset += count
    }
    return hash.finalize().map { String(format: "%02x", $0) }.joined()
  }
  // The UUID is derived from the held ORIGINAL candidate bytes, not a process
  // name or the executable currently found at some later process path.
  private static func imageUuid(_ fd: Int32, _ size: Int) throws -> String {
    var header = mach_header_64()
    guard pread(fd, &header, MemoryLayout.size(ofValue: header), 0) == MemoryLayout.size(ofValue: header),
      header.magic == MH_MAGIC_64, header.cputype == CPU_TYPE_ARM64,
      header.filetype == MH_EXECUTE, header.ncmds > 0, header.ncmds <= 4096,
      header.sizeofcmds <= 1024 * 1024,
      Int(header.sizeofcmds) <= size - MemoryLayout.size(ofValue: header) else {
      throw StartupColdAuditError.candidateChanged
    }
    var commands = [UInt8](repeating: 0, count: Int(header.sizeofcmds))
    guard pread(fd, &commands, commands.count, off_t(MemoryLayout.size(ofValue: header))) == commands.count else {
      throw StartupColdAuditError.candidateChanged
    }
    return try commands.withUnsafeBytes { bytes in
      var offset = 0, uuid: String?
      for _ in 0..<header.ncmds {
        guard offset <= bytes.count - MemoryLayout<load_command>.size else { throw StartupColdAuditError.candidateChanged }
        let command = bytes.loadUnaligned(fromByteOffset: offset, as: load_command.self)
        guard command.cmdsize >= MemoryLayout<load_command>.size,
          Int(command.cmdsize) <= bytes.count - offset, command.cmdsize % 4 == 0 else {
          throw StartupColdAuditError.candidateChanged
        }
        if command.cmd == LC_UUID {
          guard uuid == nil, command.cmdsize == MemoryLayout<uuid_command>.size else { throw StartupColdAuditError.candidateChanged }
          uuid = bytes[(offset + 8)..<(offset + 24)].map { String(format: "%02x", $0) }.joined()
        }
        offset += Int(command.cmdsize)
      }
      guard offset == bytes.count, let result = uuid, result != String(repeating: "0", count: 32) else {
        throw StartupColdAuditError.candidateChanged
      }
      return result
    }
  }
  init(fixedExecutable: String, manifestSha256: String, manifestImageUuid: String) throws {
    guard manifestSha256.range(of: "^[a-f0-9]{64}$", options: .regularExpression) != nil,
      manifestImageUuid.range(of: "^[a-f0-9]{32}$", options: .regularExpression) != nil else {
      throw StartupColdAuditError.candidateChanged
    }
    let opened = open(fixedExecutable, O_RDONLY | O_NOFOLLOW | O_CLOEXEC)
    guard opened >= 0 else { throw StartupColdAuditError.candidateChanged }
    var before = stat(), after = stat(), atPath = stat()
    do {
      guard fstat(opened, &before) == 0, before.st_size > 0, before.st_size <= 512 * 1024 * 1024,
        (before.st_mode & S_IFMT) == S_IFREG, before.st_uid == geteuid(),
        before.st_mode & 0o022 == 0, before.st_mode & (S_ISUID | S_ISGID) == 0,
        before.st_mode & 0o100 != 0,
        try Self.digest(opened, Int(before.st_size)) == manifestSha256,
        try Self.imageUuid(opened, Int(before.st_size)) == manifestImageUuid,
        fstat(opened, &after) == 0, lstat(fixedExecutable, &atPath) == 0,
        Self.same(before, after), Self.same(before, atPath) else {
        throw StartupColdAuditError.candidateChanged
      }
      fd = opened; path = fixedExecutable; initial = before
      expectedSha256 = manifestSha256; expectedUuid = manifestImageUuid
    } catch { close(opened); throw error }
  }
  deinit { close(fd) }
  private func validateExecutable() throws {
    var current = stat(), atPath = stat()
    guard fstat(fd, &current) == 0, lstat(path, &atPath) == 0,
      Self.same(initial, current), Self.same(initial, atPath),
      try Self.digest(fd, Int(initial.st_size)) == expectedSha256,
      try Self.imageUuid(fd, Int(initial.st_size)) == expectedUuid else { throw StartupColdAuditError.candidateChanged }
  }
  private static func processPath(_ pid: pid_t) throws -> String {
    var buffer = [CChar](repeating: 0, count: 4 * Int(PATH_MAX))
    guard proc_pidpath(pid, &buffer, UInt32(buffer.count)) > 0 else { throw StartupColdAuditError.incompleteInventory }
    return String(cString: buffer)
  }
  private static func generation(_ pid: pid_t) throws -> StartupKernelGeneration {
    var usage = rusage_info_v0()
    let result = withUnsafeMutablePointer(to: &usage) { pointer in
      pointer.withMemoryRebound(to: rusage_info_t?.self, capacity: 1) {
        proc_pid_rusage(pid, RUSAGE_INFO_V0, $0)
      }
    }
    let uuid = withUnsafeBytes(of: usage.ri_uuid) { bytes in bytes.map { String(format: "%02x", $0) }.joined() }
    guard result == 0, usage.ri_proc_start_abstime > 0, usage.ri_proc_exit_abstime == 0,
      uuid != String(repeating: "0", count: 32) else { throw StartupColdAuditError.incompleteInventory }
    return StartupKernelGeneration(pid: pid, imageUuid: uuid, startMachTicks: usage.ri_proc_start_abstime)
  }
  private static func processIds() throws -> Set<pid_t> {
    // Capacity headroom and exact return bounds prevent a truncated snapshot
    // from being accepted as proof of candidate absence.
    let count = proc_listallpids(nil, 0)
    guard count > 0, count < 100000 else { throw StartupColdAuditError.incompleteInventory }
    var ids = [pid_t](repeating: 0, count: Int(count) + 1024)
    let actual = proc_listallpids(&ids, Int32(ids.count * MemoryLayout<pid_t>.size))
    guard actual > 0, actual < ids.count else { throw StartupColdAuditError.incompleteInventory }
    let live = ids.prefix(Int(actual)).filter { $0 > 0 }
    guard Set(live).count == live.count else { throw StartupColdAuditError.incompleteInventory }
    return Set(live)
  }
  // Also compare kernel generations: a numerically identical PID set can hide
  // an exit/reuse or exec while later processes are being inspected.
  static func validateInventoryGenerations(_ original: [pid_t: StartupKernelGeneration],
                                          _ current: [pid_t: StartupKernelGeneration]) throws {
    guard !original.isEmpty, original.count < 100000, original == current,
      original.allSatisfy({ $0.key > 0 && $0.key == $0.value.pid }) else {
      throw StartupColdAuditError.incompleteInventory
    }
  }
  func provePrelaunchAbsence() throws {
    guard !attempted, !consumed else { throw StartupColdAuditError.incompleteInventory }
    attempted = true // incomplete inventory cannot later be retried as this trial
    let before = mach_absolute_time()
    try validateExecutable()
    let ids = try Self.processIds()
    var originals: [pid_t: StartupKernelGeneration] = [:]
    for pid in ids {
      let first = try Self.generation(pid)
      let processPath = try Self.processPath(pid)
      var atPath = stat()
      guard lstat(processPath, &atPath) == 0 else { throw StartupColdAuditError.incompleteInventory }
      guard first.imageUuid != expectedUuid,
        !(atPath.st_dev == initial.st_dev && atPath.st_ino == initial.st_ino) else {
        throw StartupColdAuditError.existingCandidate
      }
      guard try Self.generation(pid) == first else { throw StartupColdAuditError.incompleteInventory }
      originals[pid] = first
    }
    guard try Self.processIds() == ids else { throw StartupColdAuditError.incompleteInventory }
    var finalGenerations: [pid_t: StartupKernelGeneration] = [:]
    for pid in ids { finalGenerations[pid] = try Self.generation(pid) }
    try Self.validateInventoryGenerations(originals, finalGenerations)
    guard try Self.processIds() == ids else { throw StartupColdAuditError.incompleteInventory }
    try validateExecutable()
    inventory = (before, mach_absolute_time())
  }
  func consumeOriginalChild(_ original: pid_t, launch: UInt64, spawnReturned: UInt64) throws -> StartupColdProcessReceipt {
    guard !consumed, let (inventoryStart, inventoryEnd) = inventory else { throw StartupColdAuditError.invalidChild }
    consumed = true // a failed child audit cannot later become a cold trial
    guard original > 0, inventoryStart <= inventoryEnd, inventoryEnd <= launch,
      launch <= spawnReturned else { throw StartupColdAuditError.invalidChild }
    try validateExecutable()
    let child = try Self.generation(original)
    var bsd = proc_bsdinfo(), atPath = stat()
    guard proc_pidinfo(original, PROC_PIDTBSDINFO, 0, &bsd, Int32(MemoryLayout.size(ofValue: bsd))) == MemoryLayout.size(ofValue: bsd),
      bsd.pbi_ppid == UInt32(getpid()), child.imageUuid == expectedUuid,
      child.startMachTicks >= launch, child.startMachTicks <= spawnReturned,
      try Self.processPath(original) == path, lstat(path, &atPath) == 0,
      Self.same(atPath, initial), try Self.generation(original) == child else {
      throw StartupColdAuditError.invalidChild
    }
    try validateExecutable()
    guard try Self.generation(original) == child else { throw StartupColdAuditError.invalidChild }
    let observed = mach_absolute_time()
    guard spawnReturned <= observed else { throw StartupColdAuditError.invalidChild }
    return StartupColdProcessReceipt(inventoryStartedMachTicks: inventoryStart, inventoryFinishedMachTicks: inventoryEnd,
      launchMachTicks: launch, spawnReturnedMachTicks: spawnReturned, childObservedMachTicks: observed, child: child,
      candidateDevice: String(initial.st_dev), candidateInode: String(initial.st_ino))
  }
}
