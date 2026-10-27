// Minimal UI driver for local Aux acceptance runs: window capture, AX tree,
// AX press, keyboard and mouse input. Targets one pid at a time.
import AppKit
import ApplicationServices
import CoreGraphics

func fail(_ m: String) -> Never { FileHandle.standardError.write((m + "\n").data(using: .utf8)!); exit(1) }

let args = Array(CommandLine.arguments.dropFirst())
guard let cmd = args.first else {
  fail("usage: aux-ui windows PID | capture PID OUT.png [index] | tree PID [depth] | press PID PATH | activate PID | key CHORD... | type TEXT | click X Y [count] | rclick X Y | move X Y | scroll DY [X Y] | drag X1 Y1 X2 Y2 | setvalue PID PATH TEXT")
}

func windows(_ pid: pid_t) -> [[String: Any]] {
  let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
  return list.filter { ($0[kCGWindowOwnerPID as String] as? pid_t) == pid && ($0[kCGWindowLayer as String] as? Int) == 0 }
}

func axChildren(_ e: AXUIElement) -> [AXUIElement] {
  var v: CFTypeRef?
  guard AXUIElementCopyAttributeValue(e, kAXChildrenAttribute as CFString, &v) == .success, let a = v as? [AXUIElement] else { return [] }
  return a
}
func attr(_ e: AXUIElement, _ name: String) -> String? {
  var v: CFTypeRef?
  guard AXUIElementCopyAttributeValue(e, name as CFString, &v) == .success, let x = v else { return nil }
  if let s = x as? String { return s.isEmpty ? nil : s }
  if let n = x as? NSNumber { return n.stringValue }
  if CFGetTypeID(x) == AXValueGetTypeID() {
    let av = x as! AXValue
    var p = CGPoint.zero, s = CGSize.zero
    if AXValueGetValue(av, .cgPoint, &p) { return "\(Int(p.x)),\(Int(p.y))" }
    if AXValueGetValue(av, .cgSize, &s) { return "\(Int(s.width))x\(Int(s.height))" }
  }
  return nil
}
func describe(_ e: AXUIElement) -> String {
  var parts: [String] = [attr(e, kAXRoleAttribute) ?? "?"]
  for (k, label) in [(kAXTitleAttribute, "title"), (kAXDescriptionAttribute, "desc"), (kAXValueAttribute, "value"), (kAXIdentifierAttribute, "id"), (kAXPositionAttribute, "pos"), (kAXSizeAttribute, "size")] {
    if var s = attr(e, k) { if s.count > 80 { s = String(s.prefix(80)) + "…" }; parts.append("\(label)=\(s.debugDescription)") }
  }
  return parts.joined(separator: " ")
}
func dump(_ e: AXUIElement, _ path: String, _ depth: Int, _ max: Int) {
  print(String(repeating: "  ", count: depth) + "[\(path)] " + describe(e))
  if depth >= max { return }
  for (i, c) in axChildren(e).enumerated() { dump(c, path.isEmpty ? "\(i)" : "\(path).\(i)", depth + 1, max) }
}
func resolve(_ pid: pid_t, _ path: String) -> AXUIElement {
  var e = AXUIElementCreateApplication(pid)
  for p in path.split(separator: ".") where !p.isEmpty {
    let kids = axChildren(e)
    guard let i = Int(p), i < kids.count else { fail("bad path \(path)") }
    e = kids[i]
  }
  return e
}

let keyCodes: [String: CGKeyCode] = [
  "a":0,"s":1,"d":2,"f":3,"h":4,"g":5,"z":6,"x":7,"c":8,"v":9,"b":11,"q":12,"w":13,"e":14,"r":15,"y":16,"t":17,
  "1":18,"2":19,"3":20,"4":21,"6":22,"5":23,"=":24,"9":25,"7":26,"-":27,"8":28,"0":29,"]":30,"o":31,"u":32,"[":33,
  "i":34,"p":35,"return":36,"enter":36,"l":37,"j":38,"'":39,"k":40,";":41,"\\":42,",":43,"/":44,"n":45,"m":46,".":47,
  "tab":48,"space":49,"`":50,"delete":51,"backspace":51,"escape":53,"esc":53,"left":123,"right":124,"down":125,"up":126,
  "f1":122,"f2":120,"home":115,"end":119,"pageup":116,"pagedown":121,"forwarddelete":117]
func postKey(_ code: CGKeyCode, _ flags: CGEventFlags) {
  let src = CGEventSource(stateID: .hidSystemState)
  let d = CGEvent(keyboardEventSource: src, virtualKey: code, keyDown: true)!; d.flags = flags; d.post(tap: .cghidEventTap)
  usleep(15000)
  let u = CGEvent(keyboardEventSource: src, virtualKey: code, keyDown: false)!; u.flags = flags; u.post(tap: .cghidEventTap)
  usleep(25000)
}
func chord(_ s: String) {
  var flags = CGEventFlags()
  var key = ""
  for part in s.lowercased().split(separator: "+") {
    switch part {
    case "cmd", "command": flags.insert(.maskCommand)
    case "shift": flags.insert(.maskShift)
    case "opt", "option", "alt": flags.insert(.maskAlternate)
    case "ctrl", "control": flags.insert(.maskControl)
    default: key = String(part)
    }
  }
  guard let code = keyCodes[key] else { fail("unknown key \(key)") }
  postKey(code, flags)
}
func typeText(_ t: String) {
  let src = CGEventSource(stateID: .hidSystemState)
  for ch in t.utf16 {
    var c = ch
    let d = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: true)!
    d.keyboardSetUnicodeString(stringLength: 1, unicodeString: &c); d.post(tap: .cghidEventTap)
    let u = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: false)!
    u.keyboardSetUnicodeString(stringLength: 1, unicodeString: &c); u.post(tap: .cghidEventTap)
    usleep(20000)
  }
}
func mouse(_ type: CGEventType, _ p: CGPoint, _ button: CGMouseButton = .left, clicks: Int64 = 1) {
  let e = CGEvent(mouseEventSource: CGEventSource(stateID: .hidSystemState), mouseType: type, mouseCursorPosition: p, mouseButton: button)!
  e.setIntegerValueField(.mouseEventClickState, value: clicks)
  e.post(tap: .cghidEventTap)
}
func d(_ i: Int) -> Double { guard i < args.count, let v = Double(args[i]) else { fail("number expected at \(i)") }; return v }
func pid(_ i: Int = 1) -> pid_t { guard i < args.count, let v = Int32(args[i]) else { fail("pid expected") }; return v }

switch cmd {
case "windows":
  for (i, w) in windows(pid()).enumerated() {
    let b = w[kCGWindowBounds as String] as? [String: Any] ?? [:]
    print(i, w[kCGWindowNumber as String] ?? "", w[kCGWindowName as String] ?? "", b["X"] ?? "", b["Y"] ?? "", b["Width"] ?? "", b["Height"] ?? "")
  }
case "capture":
  let ws = windows(pid()); let idx = args.count > 3 ? Int(args[3]) ?? 0 : 0
  guard idx < ws.count, let n = ws[idx][kCGWindowNumber as String] as? Int else { fail("no window") }
  let p = Process(); p.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
  p.arguments = ["-x", "-o", "-l", String(n), args[2]]; try! p.run(); p.waitUntilExit()
  exit(p.terminationStatus)
case "tree":
  dump(AXUIElementCreateApplication(pid()), "", 0, args.count > 2 ? Int(args[2]) ?? 12 : 12)
case "press":
  let r = AXUIElementPerformAction(resolve(pid(), args[2]), kAXPressAction as CFString); print(r == .success ? "pressed" : "press failed \(r.rawValue)")
case "setvalue":
  let r = AXUIElementSetAttributeValue(resolve(pid(), args[2]), kAXValueAttribute as CFString, args[3] as CFString); print(r == .success ? "set" : "set failed \(r.rawValue)")
case "activate":
  NSRunningApplication(processIdentifier: pid())?.activate(); usleep(300000); print("activated")
case "key":
  for c in args.dropFirst() { chord(c) }
case "type":
  typeText(args.dropFirst().joined(separator: " "))
case "click", "rclick":
  let p = CGPoint(x: d(1), y: d(2)); let n = args.count > 3 ? Int64(args[3]) ?? 1 : 1
  mouse(.mouseMoved, p); usleep(80000)
  for k in 1...n {
    if cmd == "click" { mouse(.leftMouseDown, p, clicks: k); usleep(40000); mouse(.leftMouseUp, p, clicks: k) }
    else { mouse(.rightMouseDown, p, .right); usleep(40000); mouse(.rightMouseUp, p, .right) }
    usleep(60000)
  }
case "move":
  mouse(.mouseMoved, CGPoint(x: d(1), y: d(2)))
case "drag":
  let a = CGPoint(x: d(1), y: d(2)), b = CGPoint(x: d(3), y: d(4))
  mouse(.mouseMoved, a); usleep(80000); mouse(.leftMouseDown, a); usleep(150000)
  for s in 1...20 { let t = Double(s) / 20; mouse(.leftMouseDragged, CGPoint(x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t)); usleep(25000) }
  usleep(150000); mouse(.leftMouseUp, b)
case "scroll":
  if args.count > 3 { mouse(.mouseMoved, CGPoint(x: d(2), y: d(3))); usleep(50000) }
  let e = CGEvent(scrollWheelEvent2Source: nil, units: .pixel, wheelCount: 1, wheel1: Int32(d(1)), wheel2: 0, wheel3: 0)!; e.post(tap: .cghidEventTap)
default:
  fail("unknown command \(cmd)")
}
