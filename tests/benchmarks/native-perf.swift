// PID-scoped native input and kernel physical-footprint measurements. The
// original process generation is retained for this helper's complete lifetime.
import AppKit
import ApplicationServices
import CoreGraphics
import Foundation
import Darwin

if CommandLine.arguments == [CommandLine.arguments[0], "--help"] {
  print("native-perf <original-browser-pid> — JSON stdin commands: identity, activate, key, text, memory. No input is sent by --help.")
  exit(0)
}

func fail(_ message: String) -> Never {
  fputs("native-perf: \(message)\n", stderr)
  exit(1)
}
func usage(_ pid: pid_t) throws -> rusage_info_v0 {
  var result = rusage_info_v0()
  let status = withUnsafeMutablePointer(to: &result) { pointer in
    pointer.withMemoryRebound(to: rusage_info_t?.self, capacity: 1) {
      proc_pid_rusage(pid, RUSAGE_INFO_V0, $0)
    }
  }
  guard status == 0, result.ri_proc_start_abstime > 0,
        result.ri_proc_exit_abstime == 0 else { throw NSError(domain: "Process exited", code: 1) }
  return result
}
func uuid(_ info: rusage_info_v0) -> String {
  withUnsafeBytes(of: info.ri_uuid) { bytes in bytes.map { String(format: "%02x", $0) }.joined() }
}
guard CommandLine.arguments.count == 2, let pid = Int32(CommandLine.arguments[1]), pid > 0,
      let app = NSRunningApplication(processIdentifier: pid), let original = try? usage(pid) else {
  fail("Pass the PID of the browser launched by this benchmark.")
}
let originalUUID = uuid(original)
func current() throws {
  let info = try usage(pid)
  guard !app.isTerminated, info.ri_proc_start_abstime == original.ri_proc_start_abstime,
        uuid(info) == originalUUID else { throw NSError(domain: "Original process retired", code: 1) }
}
func descendant(_ child: pid_t) throws -> Bool {
  var parent = child
  var visited = Set<pid_t>()
  while parent > 1, visited.insert(parent).inserted {
    if parent == pid { return true }
    var info = proc_bsdinfo()
    let size = MemoryLayout<proc_bsdinfo>.size
    guard Int(proc_pidinfo(parent, PROC_PIDTBSDINFO, 0, &info, Int32(size))) == size else { return false }
    parent = pid_t(info.pbi_ppid)
  }
  return false
}
func key(_ code: CGKeyCode, flags: CGEventFlags = [], text: String? = nil) throws {
  try current()
  guard AXIsProcessTrusted(), NSWorkspace.shared.frontmostApplication?.processIdentifier == pid,
        let down = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: true),
        let up = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: false) else {
    throw NSError(domain: "Original browser input permission/focus unavailable", code: 1)
  }
  down.flags = flags; up.flags = flags
  if let text {
    let units = Array(text.utf16)
    units.withUnsafeBufferPointer { buffer in
      down.keyboardSetUnicodeString(stringLength: buffer.count, unicodeString: buffer.baseAddress!)
      up.keyboardSetUnicodeString(stringLength: buffer.count, unicodeString: buffer.baseAddress!)
    }
  }
  down.postToPid(pid); up.postToPid(pid)
  try current()
}
while let line = readLine() {
  do {
    try current()
    guard let data = line.data(using: .utf8), data.count <= 16_384,
          let request = try JSONSerialization.jsonObject(with: data) as? [String: Any],
          let id = request["id"] as? Int, let command = request["command"] as? String else {
      throw NSError(domain: "Malformed benchmark request", code: 1)
    }
    var result: [String: Any] = [:]
    switch command {
    case "identity":
      result = ["pid": pid, "imageUUID": originalUUID, "startMachTicks": String(original.ri_proc_start_abstime),
                "accessibility": AXIsProcessTrusted(),
                "focused": NSWorkspace.shared.frontmostApplication?.processIdentifier == pid]
    case "activate":
      guard AXIsProcessTrusted(), app.activate(options: [.activateAllWindows]) else {
        throw NSError(domain: "Browser activation unavailable", code: 1)
      }
      AXUIElementSetAttributeValue(AXUIElementCreateApplication(pid), kAXFrontmostAttribute as CFString, kCFBooleanTrue)
      result = ["requested": true]
    case "key":
      guard let chord = request["chord"] as? String else { throw NSError(domain: "Missing chord", code: 1) }
      switch chord {
      case "address": try key(37, flags: .maskCommand)
      case "new-tab": try key(17, flags: .maskCommand)
      case "next-tab": try key(48, flags: .maskControl)
      case "escape": try key(53)
      case "return": try key(36)
      case "select-all": try key(0, flags: .maskCommand)
      default: throw NSError(domain: "Unsupported benchmark chord", code: 1)
      }
      result = ["posted": true]
    case "text":
      guard let text = request["text"] as? String, !text.isEmpty, text.utf16.count <= 8192,
            text.utf16.allSatisfy({ $0 >= 32 && $0 <= 126 }) else {
        throw NSError(domain: "Invalid benchmark text", code: 1)
      }
      for character in text { try key(0, text: String(character)) }
      result = ["posted": true]
    case "memory":
      guard let requested = request["pids"] as? [Int], requested.count <= 256 else {
        throw NSError(domain: "Invalid process list", code: 1)
      }
      var rows: [[String: Any]] = []
      for raw in Set(requested) {
        guard raw > 0, raw <= Int(Int32.max) else { throw NSError(domain: "Invalid PID", code: 1) }
        let child = pid_t(raw)
        guard try descendant(child) else { throw NSError(domain: "Process is outside original browser tree", code: 1) }
        let measured = try usage(child)
        guard measured.ri_proc_start_abstime >= original.ri_proc_start_abstime else {
          throw NSError(domain: "Process generation is outside browser lifetime", code: 1)
        }
        rows.append(["pid": child, "startMachTicks": String(measured.ri_proc_start_abstime),
                     "physicalFootprintBytes": measured.ri_phys_footprint])
      }
      try current()
      result = ["processes": rows]
    default: throw NSError(domain: "Unsupported benchmark request", code: 1)
    }
    let response = try JSONSerialization.data(withJSONObject: ["id": id, "result": result], options: [.sortedKeys])
    print(String(data: response, encoding: .utf8)!); fflush(stdout)
  } catch {
    // No synthetic memory/input acknowledgement after original process loss.
    fail(String(describing: error))
  }
}
