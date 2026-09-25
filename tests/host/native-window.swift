// Native-window input and lookup for a disposable Aux.app journey.
// The caller passes the PID it launched; no other application is targeted.
import AppKit
import ApplicationServices
import CoreGraphics
import Foundation

func fail(_ message: String) -> Never {
  fputs("native-window: \(message)\n", stderr)
  exit(1)
}

guard CommandLine.arguments.count >= 3,
  let pid = Int32(CommandLine.arguments[2]), pid > 0 else {
  fail("Use window|activate|has-button|focused|toggle-sidebar|next-tab|focus-address|escape|move PID [args].")
}

let action = CommandLine.arguments[1]
guard let app = NSRunningApplication(processIdentifier: pid) else {
  fail("The launched Aux process has exited.")
}

struct WindowRecord: Encodable {
  let id: Int
  let x: Double
  let y: Double
  let width: Double
  let height: Double
}

struct FocusRecord: Encodable {
  let role: String
  let title: String
  let description: String
}

func focusedElement() -> FocusRecord? {
  var focused: CFTypeRef?
  guard AXUIElementCopyAttributeValue(AXUIElementCreateApplication(pid),
                                     kAXFocusedUIElementAttribute as CFString,
                                     &focused) == .success,
    let element = focused, CFGetTypeID(element) == AXUIElementGetTypeID() else { return nil }
  let target = unsafeBitCast(element, to: AXUIElement.self)
  func attribute(_ key: String) -> String {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(target, key as CFString, &value) == .success else { return "" }
    return value as? String ?? ""
  }
  // Never return AXValue: an address or prompt may contain private text.
  return FocusRecord(role: attribute(kAXRoleAttribute), title: attribute(kAXTitleAttribute),
                     description: attribute(kAXDescriptionAttribute))
}

func hasButton(_ label: String) -> Bool {
  let application = AXUIElementCreateApplication(pid)
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) -> Bool {
    visited += 1
    if depth > 18 || visited > 4000 { return false }
    var roleValue: CFTypeRef?
    var titleValue: CFTypeRef?
    var descriptionValue: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
    AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &titleValue)
    AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &descriptionValue)
    if (roleValue as? String) == (kAXButtonRole as String) &&
      ((titleValue as? String) == label || (descriptionValue as? String) == label) {
      return true
    }
    var childrenValue: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString,
                                       &childrenValue) == .success,
      let children = childrenValue as? [AXUIElement] else { return false }
    return children.contains { visit($0, depth: depth + 1) }
  }
  return visit(application, depth: 0)
}

func buttonLabels() -> [String] {
  var labels: [String] = []
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) {
    visited += 1
    if depth > 18 || visited > 4000 { return }
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    if (role as? String) == (kAXButtonRole as String) {
      var title: CFTypeRef?
      var description: CFTypeRef?
      AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &title)
      AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &description)
      let label = (title as? String).flatMap { $0.isEmpty ? nil : $0 } ??
                  (description as? String).flatMap { $0.isEmpty ? nil : $0 }
      if let label { labels.append(label) }
    }
    var children: CFTypeRef?
    if AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString,
                                   &children) == .success,
      let children = children as? [AXUIElement] {
      for child in children { visit(child, depth: depth + 1) }
    }
  }
  visit(AXUIElementCreateApplication(pid), depth: 0)
  return labels
}

func hasStaticText(_ needle: String) -> Bool {
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) -> Bool {
    visited += 1
    if depth > 18 || visited > 4000 { return false }
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    if (role as? String) == (kAXStaticTextRole as String) {
      var value: CFTypeRef?
      if AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString,
                                     &value) == .success,
        let value = value as? String, value.contains(needle) { return true }
    }
    var children: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString,
                                       &children) == .success,
      let children = children as? [AXUIElement] else { return false }
    return children.contains { visit($0, depth: depth + 1) }
  }
  return visit(AXUIElementCreateApplication(pid), depth: 0)
}

if action == "has-button" {
  guard CommandLine.arguments.count == 4 else { fail("Use has-button PID label.") }
  print(hasButton(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "buttons" {
  let data = try! JSONEncoder().encode(buttonLabels())
  print(String(data: data, encoding: .utf8)!)
} else if action == "has-text" {
  guard CommandLine.arguments.count == 4 else { fail("Use has-text PID phrase.") }
  print(hasStaticText(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "focused" {
  guard let focus = focusedElement(), let data = try? JSONEncoder().encode(focus),
    let text = String(data: data, encoding: .utf8) else { fail("Cannot read focused Aux element.") }
  print(text)
} else if action == "window" {
  let windows = CGWindowListCopyWindowInfo(
    [.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
  let candidates = windows.compactMap { window -> WindowRecord? in
    guard (window[kCGWindowOwnerPID as String] as? Int32) == pid,
      (window[kCGWindowLayer as String] as? Int) == 0,
      let number = window[kCGWindowNumber as String] as? Int,
      let bounds = window[kCGWindowBounds as String] as? [String: Any],
      let width = bounds["Width"] as? Double, width >= 600,
      let height = bounds["Height"] as? Double, height >= 400 else { return nil }
    return WindowRecord(id: number, x: bounds["X"] as? Double ?? 0,
                        y: bounds["Y"] as? Double ?? 0, width: width, height: height)
  }
  guard let window = candidates.max(by: { $0.width * $0.height < $1.width * $1.height }) else {
    fail("No visible Aux browser window belongs to the launched process.")
  }
  guard let data = try? JSONEncoder().encode(window),
    let text = String(data: data, encoding: .utf8) else {
    fail("Cannot encode Aux window bounds.")
  }
  print(text)
} else if action == "activate" || action == "toggle-sidebar" ||
  action == "next-tab" || action == "focus-address" || action == "escape" || action == "move" {
  guard app.activate(options: []) else {
    fail("Cannot activate the launched Aux browser window.")
  }
  usleep(80_000)
  guard NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else {
    fail("Aux is not the frontmost app; refusing to send input elsewhere.")
  }
  if action != "move" && action != "activate" {
    // Aux declares Command-S for the sidebar, Command-L for the address,
    // and Control-Tab for next tab. Stock Chromium accepts the latter two.
    let key: CGKeyCode = action == "next-tab" ? 48 : action == "focus-address" ? 37 : action == "escape" ? 53 : 1
    let flags: CGEventFlags = action == "next-tab" ? .maskControl : action == "escape" ? [] : .maskCommand
    let down = CGEvent(keyboardEventSource: nil, virtualKey: key, keyDown: true)
    let up = CGEvent(keyboardEventSource: nil, virtualKey: key, keyDown: false)
    down?.flags = flags
    up?.flags = flags
    guard let down, let up else { fail("Cannot create the browser shortcut event.") }
    down.post(tap: .cghidEventTap)
    up.post(tap: .cghidEventTap)
  } else if action == "move" {
    guard CommandLine.arguments.count == 5,
      let x = Double(CommandLine.arguments[3]),
      let y = Double(CommandLine.arguments[4]),
      let event = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved,
                          mouseCursorPosition: CGPoint(x: x, y: y), mouseButton: .left) else {
      fail("Use move PID x y.")
    }
    event.post(tap: .cghidEventTap)
  }
} else {
  fail("Unknown action: \(action)")
}
