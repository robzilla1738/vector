// PID-scoped native input and kernel physical-footprint measurements. The
// original process generation is retained for this helper's complete lifetime.
import AppKit
import ApplicationServices
import CoreGraphics
import Foundation
import Darwin

if CommandLine.arguments == [CommandLine.arguments[0], "--help"] {
  print("native-perf <original-browser-pid> <app-bundle> — JSON stdin commands: identity, activate, address-ready, key, text, memory. No input is sent by --help.")
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
guard CommandLine.arguments.count == 3, let pid = Int32(CommandLine.arguments[1]), pid > 0,
      let app = NSRunningApplication(processIdentifier: pid), let original = try? usage(pid) else {
  fail("Pass the PID of the browser launched by this benchmark.")
}
let expectedApp = URL(fileURLWithPath: CommandLine.arguments[2]).resolvingSymlinksInPath()
guard app.bundleURL?.resolvingSymlinksInPath().path == expectedApp.path else {
  fail("Original browser does not belong to the supplied app bundle.")
}
let expectedRuntimePath = expectedApp.appendingPathComponent("Contents/Helpers/Aux Runtime")
  .resolvingSymlinksInPath().path
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
func executablePath(_ process: pid_t) throws -> String {
  // libproc defines PROC_PIDPATHINFO_MAXSIZE as 4 * MAXPATHLEN; Swift cannot import that macro.
  var path = [CChar](repeating: 0, count: 4 * Int(MAXPATHLEN))
  guard proc_pidpath(process, &path, UInt32(path.count)) > 0 else {
    throw NSError(domain: "Original process executable unavailable", code: 1)
  }
  return URL(fileURLWithPath: String(cString: path)).resolvingSymlinksInPath().path
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
    case "address-ready":
      guard AXIsProcessTrusted(), NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else {
        throw NSError(domain: "Original browser input permission/focus unavailable", code: 1)
      }
      var focused: CFTypeRef?
      let status = AXUIElementCopyAttributeValue(AXUIElementCreateApplication(pid), kAXFocusedUIElementAttribute as CFString, &focused)
      var ready = false
      if status == .success, let focused, CFGetTypeID(focused) == AXUIElementGetTypeID() {
        let element = focused as! AXUIElement
        func attribute(_ name: String) -> String {
          var value: CFTypeRef?
          guard AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success else { return "" }
          return value as? String ?? ""
        }
        let role = attribute(kAXRoleAttribute)
        let label = [kAXTitleAttribute, kAXDescriptionAttribute, kAXHelpAttribute]
          .map(attribute).joined(separator: " ").lowercased()
        ready = [kAXTextFieldRole, kAXComboBoxRole].contains(role)
          && (label.contains("address") || label.contains("search"))
        if let expectedLabel = request["expectedLabel"] as? String {
          ready = ready && label.contains(expectedLabel.lowercased())
        }
      }
      try current()
      result = ["ready": ready]
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
      let shell = request["shellWitness"] as? [String: Any]
      var shellPID: pid_t?
      var shellBirth: UInt64?
      if request["shellWitness"] != nil {
        guard let shell, shell.count == 4, shell["event"] as? String == "AUX_PERF_SHELL_ROLE",
              shell["browserPid"] as? Int32 == pid,
              let raw = shell["pid"] as? Int32, raw > 0, raw != pid,
              let ticks = shell["startMachTicks"] as? String, let birth = UInt64(ticks), birth > 0 else {
          throw NSError(domain: "Invalid original shell process witness", code: 1)
        }
        shellPID = raw
        shellBirth = birth
      }
      var rows: [[String: Any]] = []
      var shellCount = 0
      var runtimeCount = 0
      for raw in Set(requested) {
        guard raw > 0, raw <= Int(Int32.max) else { throw NSError(domain: "Invalid PID", code: 1) }
        let child = pid_t(raw)
        guard try descendant(child) else { throw NSError(domain: "Process is outside original browser tree", code: 1) }
        let before = try usage(child)
        let path = try executablePath(child)
        let measured = try usage(child)
        guard measured.ri_proc_start_abstime >= original.ri_proc_start_abstime,
              measured.ri_proc_start_abstime == before.ri_proc_start_abstime,
              uuid(measured) == uuid(before), try descendant(child),
              try executablePath(child) == path else {
          throw NSError(domain: "Process generation changed during footprint observation", code: 1)
        }
        var row: [String: Any] = ["pid": child,
          "startMachTicks": String(measured.ri_proc_start_abstime),
          "physicalFootprintBytes": measured.ri_phys_footprint]
        if child == shellPID {
          guard measured.ri_proc_start_abstime == shellBirth else {
            throw NSError(domain: "Original shell renderer process was replaced", code: 1)
          }
          row["role"] = "shell"
          shellCount += 1
        }
        if shell != nil && child != pid && path == expectedRuntimePath {
          guard child != shellPID else { throw NSError(domain: "Process roles overlap", code: 1) }
          row["role"] = "runtime"
          row["executablePath"] = path
          runtimeCount += 1
        }
        let after = try usage(child)
        guard measured.ri_proc_start_abstime == after.ri_proc_start_abstime,
              uuid(measured) == uuid(after) else {
          throw NSError(domain: "Original process retired during footprint observation", code: 1)
        }
        rows.append(row)
      }
      if shell != nil && (shellCount != 1 || runtimeCount != 1) {
        throw NSError(domain: "Exactly one witnessed shell and bundled runtime are required", code: 1)
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
