// PID-scoped native input and kernel physical-footprint measurements. The
// original process generation is retained for this helper's complete lifetime.
import AppKit
import ApplicationServices
import CoreGraphics
import Foundation
import Darwin

if CommandLine.arguments == [CommandLine.arguments[0], "--help"] {
  print("native-perf <original-browser-pid> <app-bundle> — JSON stdin commands: identity, windows, activate, address-ready, key, text, memory. No input is sent by --help.")
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
var retainedWindows: [(id: Int, element: AXUIElement)] = []
var nextWindowID = 0
func windows() throws -> (ids: [Int], focused: Int?) {
  try current()
  guard AXIsProcessTrusted(), NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else {
    throw NSError(domain: "Original browser window permission/focus unavailable", code: 1)
  }
  let application = AXUIElementCreateApplication(pid)
  var value: CFTypeRef?
  guard AXUIElementCopyAttributeValue(application, kAXWindowsAttribute as CFString, &value) == .success,
        let elements = value as? [AXUIElement] else {
    throw NSError(domain: "Original browser windows unavailable", code: 1)
  }
  retainedWindows.removeAll { saved in !elements.contains { CFEqual(saved.element, $0) } }
  let ids = elements.map { element in
    if let saved = retainedWindows.first(where: { CFEqual($0.element, element) }) { return saved.id }
    nextWindowID += 1
    retainedWindows.append((id: nextWindowID, element: element))
    return nextWindowID
  }
  var focused: CFTypeRef?
  let status = AXUIElementCopyAttributeValue(application, kAXFocusedWindowAttribute as CFString, &focused)
  let focusedID = status == .success && focused != nil
    ? retainedWindows.first(where: { CFEqual($0.element, focused!) })?.id : nil
  try current()
  return (ids, focusedID)
}
func requireWindow(_ id: Int) throws {
  let snapshot = try windows()
  guard snapshot.focused == id, snapshot.ids.contains(id) else {
    throw NSError(domain: "Original benchmark window lost focus or retired", code: 1)
  }
}
func key(_ code: CGKeyCode, flags: CGEventFlags = [], text: String? = nil, windowID: Int? = nil) throws {
  try current()
  if let windowID { try requireWindow(windowID) }
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
    case "windows":
      let snapshot = try windows()
      result = ["windowIds": snapshot.ids, "focusedWindowId": snapshot.focused as Any? ?? NSNull()]
    case "activate":
      guard AXIsProcessTrusted(), app.activate(options: [.activateAllWindows]) else {
        throw NSError(domain: "Browser activation unavailable", code: 1)
      }
      let application = AXUIElementCreateApplication(pid)
      // Chromium initializes non-VoiceOver accessibility when assistive
      // technology reads its application role. Focus alone does not do so.
      var role: CFTypeRef?
      guard AXUIElementCopyAttributeValue(application, kAXRoleAttribute as CFString, &role) == .success,
            role as? String == kAXApplicationRole else {
        throw NSError(domain: "Original browser accessibility role unavailable", code: 1)
      }
      try current()
      AXUIElementSetAttributeValue(application, kAXFrontmostAttribute as CFString, kCFBooleanTrue)
      result = ["requested": true, "accessibilityRoleRequested": true]
    case "address-ready":
      if let windowID = request["windowId"] as? Int { try requireWindow(windowID) }
      guard AXIsProcessTrusted(), NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else {
        throw NSError(domain: "Original browser input permission/focus unavailable", code: 1)
      }
      let application = AXUIElementCreateApplication(pid)
      func value(_ element: AXUIElement, _ name: String) -> CFTypeRef? {
        var result: CFTypeRef?
        return AXUIElementCopyAttributeValue(element, name as CFString, &result) == .success ? result : nil
      }
      func element(_ item: CFTypeRef?) -> AXUIElement? {
        guard let item, CFGetTypeID(item) == AXUIElementGetTypeID() else { return nil }
        return (item as! AXUIElement)
      }
      func text(_ element: AXUIElement, _ name: String) -> String {
        value(element, name) as? String ?? ""
      }
      func matchesAddress(_ candidate: AXUIElement) -> Bool {
        let role = text(candidate, kAXRoleAttribute)
        let label = [kAXTitleAttribute, kAXDescriptionAttribute, kAXHelpAttribute]
          .map { text(candidate, $0) }.joined(separator: " ").lowercased()
        guard [kAXTextFieldRole, kAXComboBoxRole].contains(role),
              label.contains("address") || label.contains("search") else { return false }
        if let expected = request["expectedLabel"] as? String {
          return label.contains(expected.lowercased())
        }
        return true
      }
      let focused = element(value(application, kAXFocusedUIElementAttribute))
      var ready = focused.map(matchesAddress) ?? false
      var focusKind = ready ? "direct" : "unavailable"
      var focusProbe: [[String: Any]] = []
      // Chromium reports a combobox's active descendant as AX focus. Its
      // aria-controls list is exposed through AXLinkedUIElements. Accept only
      // the exact expanded address owner linked to the selected focused row,
      // in the same original focused window; never accept an arbitrary row.
      if !ready, let focused,
         let focusedWindow = element(value(application, kAXFocusedWindowAttribute)) {
        var ancestor: AXUIElement? = focused
        var descendants: [AXUIElement] = []
        for _ in 0..<12 {
          guard let node = ancestor else { break }
          descendants.append(node)
          let selected = value(node, kAXSelectedChildrenAttribute) as? [AXUIElement] ?? []
          let selectedFocus = selected.contains { row in descendants.contains { CFEqual(row, $0) } }
          focusProbe.append(["ancestorRole": text(node, kAXRoleAttribute), "selectedCount": selected.count, "selectedFocus": selectedFocus])
          if text(node, kAXRoleAttribute) == kAXListRole,
             selectedFocus,
             let parent = element(value(node, kAXParentAttribute)) {
            var container: AXUIElement? = parent
            var inspected: [AXUIElement] = []
            for _ in 0..<6 {
              guard let scope = container, !ready, inspected.count < 96 else { break }
              focusProbe.append(["scopeRole": text(scope, kAXRoleAttribute)])
              var pending = [(scope, 0)]
              while !pending.isEmpty && inspected.count < 96 {
                let (candidate, depth) = pending.removeLast()
                if CFEqual(candidate, node) || inspected.contains(where: { CFEqual($0, candidate) }) { continue }
                inspected.append(candidate)
                var candidatePID: pid_t = 0
                let links = value(candidate, kAXLinkedUIElementsAttribute) as? [AXUIElement] ?? []
                if matchesAddress(candidate) {
                  let candidateWindow = element(value(candidate, kAXWindowAttribute))
                  focusProbe.append(["addressCandidate": true, "expanded": (value(candidate, kAXExpandedAttribute) as? Bool) ?? false, "linkedCount": links.count, "linkedList": links.contains { CFEqual($0, node) }, "sameWindow": candidateWindow.map { CFEqual($0, focusedWindow) } ?? false])
                }
                if matchesAddress(candidate),
                   AXUIElementGetPid(candidate, &candidatePID) == .success, candidatePID == pid,
                   (value(candidate, kAXExpandedAttribute) as? Bool) == true,
                   let window = element(value(candidate, kAXWindowAttribute)), CFEqual(window, focusedWindow),
                   links.contains(where: { CFEqual($0, node) }) {
                  ready = true
                  focusKind = "active-descendant"
                  break
                }
                if depth < 3 {
                  let children = value(candidate, kAXChildrenAttribute) as? [AXUIElement] ?? []
                  pending.append(contentsOf: children.prefix(32).map { ($0, depth + 1) })
                }
              }
              container = element(value(scope, kAXParentAttribute))
            }
            break
          }
          ancestor = element(value(node, kAXParentAttribute))
        }
      }
      try current()
      result = ["ready": ready, "focusKind": focusKind,
                "focusedRole": focused.map { text($0, kAXRoleAttribute) } ?? "",
                "focusProbe": ready ? [] : focusProbe]
    case "key":
      guard let chord = request["chord"] as? String else { throw NSError(domain: "Missing chord", code: 1) }
      let windowID = request["windowId"] as? Int
      switch chord {
      case "address": try key(37, flags: .maskCommand, windowID: windowID)
      case "new-tab": try key(17, flags: .maskCommand)
      case "new-window":
        guard let windowID else { throw NSError(domain: "Missing original window", code: 1) }
        try key(45, flags: .maskCommand, windowID: windowID)
      case "close-window":
        guard let windowID else { throw NSError(domain: "Missing original window", code: 1) }
        try key(13, flags: [.maskCommand, .maskShift], windowID: windowID)
      case "next-tab": try key(48, flags: .maskControl)
      case "escape": try key(53, windowID: windowID)
      case "return": try key(36, windowID: windowID)
      case "select-all": try key(0, flags: .maskCommand)
      default: throw NSError(domain: "Unsupported benchmark chord", code: 1)
      }
      result = ["posted": true]
    case "text":
      guard let text = request["text"] as? String, !text.isEmpty, text.utf16.count <= 8192,
            text.utf16.allSatisfy({ $0 >= 32 && $0 <= 126 }) else {
        throw NSError(domain: "Invalid benchmark text", code: 1)
      }
      for character in text { try key(0, text: String(character), windowID: request["windowId"] as? Int) }
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
