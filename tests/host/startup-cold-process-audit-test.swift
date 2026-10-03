// Compile together with startup-cold-process-audit.swift as main.swift.
// Synthetic owned Mach-O fixtures only; no browser launch or process inventory.
import Darwin
import Foundation
import CryptoKit
import MachO
let directory = FileManager.default.temporaryDirectory.appendingPathComponent("aux-cold-audit-" + UUID().uuidString)
try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: false,
  attributes: [.posixPermissions: 0o700])
defer { try? FileManager.default.removeItem(at: directory) }
let executable = directory.appendingPathComponent("candidate")
let uuidBytes = (1...16).map { UInt8($0) }
let uuid = uuidBytes.map { String(format: "%02x", $0) }.joined()
func bytes(duplicate: Bool = false) -> Data {
  var header = mach_header_64()
  header.magic = MH_MAGIC_64; header.cputype = CPU_TYPE_ARM64; header.filetype = UInt32(MH_EXECUTE)
  header.ncmds = duplicate ? 2 : 1; header.sizeofcmds = header.ncmds * 24
  var data = withUnsafeBytes(of: &header) { Data($0) }
  var command = load_command(cmd: UInt32(LC_UUID), cmdsize: 24)
  let one = withUnsafeBytes(of: &command) { Data($0) } + Data(uuidBytes)
  data.append(one); if duplicate { data.append(one) }
  return data
}
func digest(_ data: Data) -> String { SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined() }
func install(_ data: Data) throws {
  try data.write(to: executable)
  guard chmod(executable.path, 0o700) == 0 else { fatalError("fixture chmod") }
}
func audit(_ data: Data, image: String = uuid) throws -> StartupColdProcessAudit {
  try StartupColdProcessAudit(fixedExecutable: executable.path, manifestSha256: digest(data), manifestImageUuid: image)
}
func refuses(_ body: () throws -> Void) {
  do { try body(); fatalError("Expected original candidate refusal") } catch {}
}
let original = bytes(); try install(original)
let held = try audit(original)
// A source/file identity can pass independently without granting any cold trial.
refuses { _ = try held.consumeOriginalChild(getpid(), launch: 1, spawnReturned: 2) }
refuses { _ = try audit(original, image: String(repeating: "f", count: 32)) }
let duplicate = bytes(duplicate: true); try install(duplicate)
refuses { _ = try audit(duplicate) }
let truncated = original.dropLast(); try install(Data(truncated))
refuses { _ = try audit(Data(truncated)) }
try install(original)
let beforeReplacement = try audit(original)
try FileManager.default.removeItem(at: executable)
try install(original)
// Byte-identical replacement must refuse on ORIGINAL inode before inventory.
refuses { try beforeReplacement.provePrelaunchAbsence() }
try FileManager.default.removeItem(at: executable)
let target = directory.appendingPathComponent("target")
try original.write(to: target); guard chmod(target.path, 0o700) == 0 else { fatalError("fixture chmod") }
try FileManager.default.createSymbolicLink(atPath: executable.path, withDestinationPath: target.path)
refuses { _ = try audit(original) }
// Exercise the production generation-map validator with synthetic receipts;
// these controls do not run a kernel inventory or qualify cold startup.
let generation = StartupKernelGeneration(pid: 41, imageUuid: uuid, startMachTicks: 100)
let originalInventory: [pid_t: StartupKernelGeneration] = [41: generation]
try StartupColdProcessAudit.validateInventoryGenerations(originalInventory, originalInventory)
for replacement in [
  StartupKernelGeneration(pid: 41, imageUuid: uuid, startMachTicks: 101),
  StartupKernelGeneration(pid: 41, imageUuid: String(repeating: "f", count: 32), startMachTicks: 100),
  StartupKernelGeneration(pid: 42, imageUuid: uuid, startMachTicks: 100),
] {
  refuses { try StartupColdProcessAudit.validateInventoryGenerations(originalInventory, [41: replacement]) }
}
refuses { try StartupColdProcessAudit.validateInventoryGenerations(originalInventory, [:]) }
refuses { try StartupColdProcessAudit.validateInventoryGenerations([:], [:]) }
print("PASS cold candidate and generation-map controls; no process inventory or timing qualification")
