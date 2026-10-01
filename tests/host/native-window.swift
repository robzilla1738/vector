// Native-window input and lookup for a disposable Aux.app journey.
// The caller passes the PID it launched; no other application is targeted.
import AppKit
import ApplicationServices
import CoreGraphics
import Foundation
import Darwin

func trustedState() -> [String: Bool] {
  return ["accessibility": AXIsProcessTrusted(), "screenRecording": CGPreflightScreenCaptureAccess(),
          "reduceMotion": NSWorkspace.shared.accessibilityDisplayShouldReduceMotion,
          "reduceTransparency": NSWorkspace.shared.accessibilityDisplayShouldReduceTransparency]
}

func fail(_ message: String) -> Never {
  fputs("native-window: \(message)\n", stderr)
  exit(1)
}

if CommandLine.arguments.count == 2 && CommandLine.arguments[1] == "trusted" {
  let result = trustedState()
  let data = try! JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
  print(String(data: data, encoding: .utf8)!)
  exit(0)
}

guard CommandLine.arguments.count >= 3,
  let pid = Int32(CommandLine.arguments[2]), pid > 0 else {
  fail("Use window|activate|has-button|focused|toggle-sidebar|next-tab|focus-address|escape|type-text|move PID [args].")
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

func shellUrl() -> String? {
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) -> String? {
    visited += 1
    if depth > 28 || visited > 4000 { return nil }
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    if (role as? String) == "AXWebArea" {
      for key in [kAXURLAttribute, "AXDocument", kAXDescriptionAttribute, kAXValueAttribute] {
        var value: CFTypeRef?
        if AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success {
          let text = (value as? URL)?.absoluteString ?? (value as? NSURL)?.absoluteString ?? value as? String
          if let text, let range = text.range(of: "chrome://aux/") {
            return String(text[range.lowerBound...].split(separator: " ").first ?? "")
          }
        }
      }
    }
    var children: CFTypeRef?
    if AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
      let children = children as? [AXUIElement] {
      for child in children { if let url = visit(child, depth: depth + 1) { return url } }
    }
    return nil
  }
  return visit(AXUIElementCreateApplication(pid), depth: 0)
}

func hasButton(_ label: String) -> Bool {
  let application = AXUIElementCreateApplication(pid)
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) -> Bool {
    visited += 1
    if depth > 28 || visited > 4000 { return false }
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
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int, shellOnly: Bool) {
    visited += 1
    if depth > 24 || visited > 4000 { return }
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    let roleName = role as? String ?? ""
    if roleName == (kAXMenuBarRole as String) { return }
    // aria-haspopup="menu" is a popup button, so the space control is not an AXButton.
    if roleName == (kAXButtonRole as String) || roleName == (kAXPopUpButtonRole as String) || roleName == "AXMenuItem" {
      var title: CFTypeRef?
      var description: CFTypeRef?
      AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &title)
      AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &description)
      for candidate in [title as? String, description as? String] {
        guard let label = candidate?.trimmingCharacters(in: .whitespacesAndNewlines),
          !label.isEmpty, !labels.contains(label) else { continue }
        labels.append(label)
      }
    }
    if shellOnly && isGuestWebArea(element, role: roleName) { return }
    var children: CFTypeRef?
    if AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString,
                                   &children) == .success,
      let children = children as? [AXUIElement] {
      for child in children { visit(child, depth: depth + 1, visited: &visited, shellOnly: shellOnly) }
    }
  }
  let root = AXUIElementCreateApplication(pid)
  var shellVisits = 0
  visit(root, depth: 0, visited: &shellVisits, shellOnly: true)
  var pageVisits = 0
  visit(root, depth: 0, visited: &pageVisits, shellOnly: false)
  return labels
}

func hasName(_ needle: String, exact: Bool = false) -> Bool {
  func matches(_ element: AXUIElement) -> Bool {
    for key in [kAXTitleAttribute, kAXDescriptionAttribute, kAXValueAttribute] {
      var value: CFTypeRef?
      if AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success,
        let value = value as? String,
        exact ? value == needle : value.contains(needle) { return true }
    }
    return false
  }
  func roleOf(_ element: AXUIElement) -> String {
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    return role as? String ?? ""
  }
  func webAreaURL(_ element: AXUIElement) -> String {
    for key in [kAXURLAttribute, "AXDocument", kAXDescriptionAttribute, kAXValueAttribute] {
      var value: CFTypeRef?
      if AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success {
        let text = (value as? URL)?.absoluteString ?? (value as? NSURL)?.absoluteString ?? value as? String
        if let text { return text }
      }
    }
    return ""
  }
  // A guest page with thousands of fields can exhaust the walk before the shell.
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int, shellOnly: Bool) -> Bool {
    visited += 1
    if depth > 24 || visited > 4000 { return false }
    let role = roleOf(element)
    if role == (kAXMenuBarRole as String) { return false }
    if matches(element) { return true }
    if shellOnly && role == "AXWebArea" && !webAreaURL(element).contains("chrome://aux/") { return false }
    var children: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString,
                                       &children) == .success,
      let children = children as? [AXUIElement] else { return false }
    return children.contains { visit($0, depth: depth + 1, visited: &visited, shellOnly: shellOnly) }
  }
  let root = AXUIElementCreateApplication(pid)
  var shellVisits = 0
  if visit(root, depth: 0, visited: &shellVisits, shellOnly: true) { return true }
  var pageVisits = 0
  return visit(root, depth: 0, visited: &pageVisits, shellOnly: false)
}

func controlValue(_ label: String) -> String? {
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) -> String? {
    visited += 1
    if depth > 24 || visited > 4000 { return nil }
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    if (role as? String) == (kAXMenuBarRole as String) { return nil }
    for key in [kAXTitleAttribute, kAXDescriptionAttribute] {
      var name: CFTypeRef?
      if AXUIElementCopyAttributeValue(element, key as CFString, &name) == .success,
        (name as? String) == label {
        var value: CFTypeRef?
        if AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString, &value) == .success {
          if let string = value as? String { return string }
          if let number = value as? NSNumber { return number.stringValue }
        }
      }
    }
    var children: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString,
                                     &children) == .success,
      let children = children as? [AXUIElement] else { return nil }
    for child in children { if let found = visit(child, depth: depth + 1) { return found } }
    return nil
  }
  return visit(AXUIElementCreateApplication(pid), depth: 0)
}

func namedElements() -> [String] {
  var names: [String] = []
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) {
    visited += 1
    if depth > 28 || visited > 4000 || names.count >= 80 { return }
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    if (role as? String) == (kAXMenuBarRole as String) { return }
    for key in [kAXTitleAttribute, kAXDescriptionAttribute, kAXValueAttribute] {
      var value: CFTypeRef?
      if AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success,
        let value = value as? String {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty && trimmed.count <= 200 && !names.contains(trimmed) { names.append(trimmed) }
      }
    }
    var children: CFTypeRef?
    if AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
      let children = children as? [AXUIElement] {
      for child in children { visit(child, depth: depth + 1) }
    }
  }
  visit(AXUIElementCreateApplication(pid), depth: 0)
  return names
}

func hasStaticText(_ needle: String) -> Bool {
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) -> Bool {
    visited += 1
    if depth > 28 || visited > 4000 { return false }
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

func axPoint(_ element: AXUIElement, _ attribute: String) -> CGPoint? {
  var raw: CFTypeRef?
  guard AXUIElementCopyAttributeValue(element, attribute as CFString, &raw) == .success,
    let raw, CFGetTypeID(raw) == AXValueGetTypeID() else { return nil }
  let value = unsafeBitCast(raw, to: AXValue.self)
  var point = CGPoint.zero
  guard AXValueGetType(value) == .cgPoint, AXValueGetValue(value, .cgPoint, &point) else { return nil }
  return point
}

func axSize(_ element: AXUIElement) -> CGSize? {
  var raw: CFTypeRef?
  guard AXUIElementCopyAttributeValue(element, kAXSizeAttribute as CFString, &raw) == .success,
    let raw, CFGetTypeID(raw) == AXValueGetTypeID() else { return nil }
  let value = unsafeBitCast(raw, to: AXValue.self)
  var size = CGSize.zero
  guard AXValueGetType(value) == .cgSize, AXValueGetValue(value, .cgSize, &size) else { return nil }
  return size
}

// button-enabled returns the first match. A later disabled control needs its own walk.
func hasDisabledButton(_ label: String) -> Bool {
  func visit(_ element: AXUIElement, depth: Int) -> Bool {
    if depth > 28 { return false }
    var roleValue: CFTypeRef?
    var titleValue: CFTypeRef?
    var descriptionValue: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
    AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &titleValue)
    AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &descriptionValue)
    let title = titleValue as? String ?? ""
    let description = descriptionValue as? String ?? ""
    if (roleValue as? String) == (kAXButtonRole as String) &&
        (title == label || description == label) {
      var enabled: CFTypeRef?
      let readable = AXUIElementCopyAttributeValue(element, kAXEnabledAttribute as CFString, &enabled) == .success
      if !readable || (enabled as? Bool) != true { return true }
    }
    var childrenValue: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &childrenValue) == .success,
      let children = childrenValue as? [AXUIElement] else { return false }
    return children.contains { visit($0, depth: depth + 1) }
  }
  return visit(AXUIElementCreateApplication(pid), depth: 0)
}

func findButton(_ label: String) -> AXUIElement? {
  let application = AXUIElementCreateApplication(pid)
  func visit(_ element: AXUIElement, depth: Int) -> AXUIElement? {
    if depth > 28 { return nil }
    var roleValue: CFTypeRef?
    var titleValue: CFTypeRef?
    var descriptionValue: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
    AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &titleValue)
    AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &descriptionValue)
    let title = titleValue as? String ?? ""
    let description = descriptionValue as? String ?? ""
    if (roleValue as? String) == (kAXButtonRole as String) &&
        (title == label || description == label) { return element }
    var childrenValue: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &childrenValue) == .success,
      let children = childrenValue as? [AXUIElement] else { return nil }
    for child in children {
      if let found = visit(child, depth: depth + 1) { return found }
    }
    return nil
  }
  return visit(application, depth: 0)
}

struct ClickRecord: Encodable {
  let ok: Bool
  let x: Double
  let y: Double
  let width: Double
  let height: Double
  let rawX: Double
  let rawY: Double
  let flippedX: Double
  let flippedY: Double
  let windowX: Double
  let windowY: Double
  let windowW: Double
  let windowH: Double
}

func postClick(_ point: CGPoint) {
  let move = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: point, mouseButton: .left)
  let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: point, mouseButton: .left)
  let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: point, mouseButton: .left)
  move?.post(tap: .cghidEventTap)
  usleep(40_000)
  down?.post(tap: .cghidEventTap)
  usleep(40_000)
  up?.post(tap: .cghidEventTap)
}

func screenWindow() -> CGRect? {
  let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
  let frames = windows.compactMap { window -> CGRect? in
    guard (window[kCGWindowOwnerPID as String] as? Int32) == pid,
      (window[kCGWindowLayer as String] as? Int) == 0,
      let bounds = window[kCGWindowBounds as String] as? [String: Any],
      let width = bounds["Width"] as? Double, width >= 600,
      let height = bounds["Height"] as? Double, height >= 400 else { return nil }
    return CGRect(x: bounds["X"] as? Double ?? 0, y: bounds["Y"] as? Double ?? 0, width: width, height: height)
  }
  return frames.max(by: { $0.width * $0.height < $1.width * $1.height })
}

func clickableElement(_ label: String) -> AXUIElement? {
  let application = AXUIElementCreateApplication(pid)
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int, shellOnly: Bool) -> AXUIElement? {
    visited += 1
    if depth > 24 || visited > 4000 { return nil }
    var roleValue: CFTypeRef?
    var titleValue: CFTypeRef?
    var descriptionValue: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
    let role = roleValue as? String ?? ""
    if role == (kAXMenuBarRole as String) { return nil }
    AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &titleValue)
    AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &descriptionValue)
    let title = titleValue as? String ?? ""
    let description = descriptionValue as? String ?? ""
    let pressable = role == (kAXButtonRole as String) || role == (kAXPopUpButtonRole as String) || role == "AXMenuItem" || role == "AXDisclosureTriangle" || role == "AXRadioButton" || role == "AXTab"
    if pressable && (title == label || description == label) { return element }
    if shellOnly && isGuestWebArea(element, role: role) { return nil }
    var childrenValue: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &childrenValue) == .success,
      let children = childrenValue as? [AXUIElement] else { return nil }
    for child in children {
      if let found = visit(child, depth: depth + 1, visited: &visited, shellOnly: shellOnly) { return found }
    }
    return nil
  }
  var shellVisits = 0
  if let found = visit(application, depth: 0, visited: &shellVisits, shellOnly: true) { return found }
  var pageVisits = 0
  return visit(application, depth: 0, visited: &pageVisits, shellOnly: false)
}

func controlClickRecord(_ label: String) -> ClickRecord? {
  guard let element = clickableElement(label) ?? findButton(label),
    let origin = axPoint(element, kAXPositionAttribute),
    let size = axSize(element), size.width > 1, size.height > 1 else { return nil }
  let screenHeight = NSScreen.screens.map(\.frame.maxY).max() ?? 0
  let raw = CGPoint(x: origin.x + size.width / 2, y: origin.y + size.height / 2)
  let flipped = CGPoint(x: raw.x, y: screenHeight - raw.y)
  let window = screenWindow() ?? .zero
  let rawInside = window.contains(raw)
  let flippedInside = window.contains(flipped)
  let point = rawInside && !flippedInside ? raw : flippedInside ? flipped : raw
  return ClickRecord(ok: true, x: point.x, y: point.y, width: size.width, height: size.height,
                     rawX: raw.x, rawY: raw.y, flippedX: flipped.x, flippedY: flipped.y,
                     windowX: window.origin.x, windowY: window.origin.y, windowW: window.width, windowH: window.height)
}

func clickButton(_ label: String) -> ClickRecord? {
  guard let record = controlClickRecord(label) else { return nil }
  _ = app.activate(options: [])
  postClick(CGPoint(x: record.x, y: record.y))
  return record
}

func frameByName(_ needle: String) -> ClickRecord? {
  let application = AXUIElementCreateApplication(pid)
  let window = screenWindow() ?? .zero
  let windowArea = max(window.width * window.height, 1)
  struct Choice { var element: AXUIElement; var area: CGFloat; var exact: Bool; var pressable: Bool }
  var best: Choice?
  func roleOf(_ element: AXUIElement) -> String {
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    return role as? String ?? ""
  }
  func texts(_ element: AXUIElement) -> [String] {
    var found: [String] = []
    for key in [kAXTitleAttribute, kAXDescriptionAttribute, kAXValueAttribute] {
      var value: CFTypeRef?
      if AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success,
        let text = value as? String, !text.isEmpty { found.append(text) }
    }
    return found
  }
  func pressable(_ role: String) -> Bool {
    role == (kAXButtonRole as String) || role == (kAXPopUpButtonRole as String) || role == "AXMenuItem" ||
      role == "AXRadioButton" || role == "AXTab" || role == "AXTextField" || role == "AXComboBox"
  }
  func consider(_ element: AXUIElement) {
    let names = texts(element)
    let exact = names.contains(needle)
    guard exact || names.contains(where: { $0.contains(needle) }) else { return }
    var target = element
    var size = axSize(target)
    if size == nil || size!.width <= 1 || size!.height <= 1 {
      var current = target
      for _ in 0..<6 {
        var parent: CFTypeRef?
        if AXUIElementCopyAttributeValue(current, kAXParentAttribute as CFString, &parent) != .success { break }
        guard let parent, CFGetTypeID(parent) == AXUIElementGetTypeID() else { break }
        current = unsafeBitCast(parent, to: AXUIElement.self)
        if let parentSize = axSize(current), parentSize.width > 1, parentSize.height > 1 {
          target = current
          size = parentSize
          break
        }
      }
    }
    guard let size, size.width > 1, size.height > 1 else { return }
    let area = size.width * size.height
    if area > windowArea * 0.45 { return }
    let choice = Choice(element: target, area: area, exact: exact, pressable: pressable(roleOf(target)))
    guard let current = best else { best = choice; return }
    if exact != current.exact { if exact { best = choice }; return }
    if choice.pressable != current.pressable { if choice.pressable { best = choice }; return }
    if area < current.area { best = choice }
  }
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int, shellOnly: Bool) {
    visited += 1
    if depth > 28 || visited > 4000 { return }
    let role = roleOf(element)
    if role == (kAXMenuBarRole as String) { return }
    consider(element)
    if shellOnly && isGuestWebArea(element, role: role) { return }
    var children: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
      let children = children as? [AXUIElement] else { return }
    for child in children { visit(child, depth: depth + 1, visited: &visited, shellOnly: shellOnly) }
  }
  var shellVisits = 0
  visit(application, depth: 0, visited: &shellVisits, shellOnly: true)
  if best == nil {
    var pageVisits = 0
    visit(application, depth: 0, visited: &pageVisits, shellOnly: false)
  }
  guard let best, let size = axSize(best.element), size.width > 1, size.height > 1,
    let origin = axPoint(best.element, kAXPositionAttribute) else { return nil }
  // Shell accessibility positions use CGEvent's top-left space. A tall window
  // also contains the mirrored point, and posting that mirror hits the page.
  let screenHeight = NSScreen.screens.map(\.frame.maxY).max() ?? 0
  let raw = CGPoint(x: origin.x + size.width / 2, y: origin.y + size.height / 2)
  let flipped = CGPoint(x: raw.x, y: screenHeight - raw.y)
  let rawInside = window.contains(raw)
  let flippedInside = window.contains(flipped)
  let point = rawInside && flippedInside ? raw : flippedInside ? flipped : raw
  return ClickRecord(ok: true, x: point.x, y: point.y, width: size.width, height: size.height,
                     rawX: raw.x, rawY: raw.y, flippedX: flipped.x, flippedY: flipped.y,
                     windowX: window.origin.x, windowY: window.origin.y, windowW: window.width, windowH: window.height)
}

func clickByName(_ needle: String) -> ClickRecord? {
  guard let record = frameByName(needle) else { return nil }
  _ = app.activate(options: [])
  postClick(CGPoint(x: record.x, y: record.y))
  return record
}

struct ChildFrame: Encodable {
  let role: String
  let title: String
  let description: String
  let value: String
  let x: Double
  let y: Double
  let width: Double
  let height: Double
}

func axString(_ element: AXUIElement, _ key: String) -> String {
  var value: CFTypeRef?
  guard AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success else { return "" }
  return value as? String ?? ""
}

func eventCenter(_ element: AXUIElement) -> (CGPoint, CGSize)? {
  guard let size = axSize(element), size.width > 1, size.height > 1,
    let origin = axPoint(element, kAXPositionAttribute) else { return nil }
  let screenHeight = NSScreen.screens.map(\.frame.maxY).max() ?? 0
  let raw = CGPoint(x: origin.x + size.width / 2, y: origin.y + size.height / 2)
  let flipped = CGPoint(x: raw.x, y: screenHeight - raw.y)
  let window = screenWindow() ?? .zero
  let rawInside = window.contains(raw)
  let flippedInside = window.contains(flipped)
  let point = rawInside && flippedInside ? raw : flippedInside ? flipped : raw
  return (point, size)
}

func childFrames(_ needle: String) -> [ChildFrame]? {
  let application = AXUIElementCreateApplication(pid)
  var best: AXUIElement?
  var bestArea = CGFloat.greatestFiniteMagnitude
  func consider(_ element: AXUIElement) {
    let names = [axString(element, kAXTitleAttribute), axString(element, kAXDescriptionAttribute), axString(element, kAXValueAttribute)]
    guard names.contains(needle), let size = axSize(element), size.width > 1, size.height > 1 else { return }
    let area = size.width * size.height
    let window = screenWindow() ?? .zero
    if area > max(window.width * window.height, 1) * 0.45 { return }
    if area < bestArea { best = element; bestArea = area }
  }
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int, shellOnly: Bool) {
    visited += 1
    if depth > 28 || visited > 4000 { return }
    var roleValue: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
    let role = roleValue as? String ?? ""
    if role == (kAXMenuBarRole as String) { return }
    consider(element)
    if shellOnly && isGuestWebArea(element, role: role) { return }
    var children: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
      let children = children as? [AXUIElement] else { return }
    for child in children { visit(child, depth: depth + 1, visited: &visited, shellOnly: shellOnly) }
  }
  var shellVisits = 0
  visit(application, depth: 0, visited: &shellVisits, shellOnly: true)
  if best == nil {
    var pageVisits = 0
    visit(application, depth: 0, visited: &pageVisits, shellOnly: false)
  }
  guard let best else { return nil }
  func sizedChildren(_ element: AXUIElement) -> [(AXUIElement, CGPoint, CGSize)] {
    var children: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
      let children = children as? [AXUIElement] else { return [] }
    return children.compactMap { child in
      guard let placed = eventCenter(child) else { return nil }
      return (child, placed.0, placed.1)
    }
  }
  var items = sizedChildren(best)
  if items.count == 1 {
    let nested = sizedChildren(items[0].0)
    if nested.count >= 2 { items = nested }
  }
  return items.map { child, point, size in
    var roleValue: CFTypeRef?
    AXUIElementCopyAttributeValue(child, kAXRoleAttribute as CFString, &roleValue)
    return ChildFrame(role: roleValue as? String ?? "", title: axString(child, kAXTitleAttribute),
      description: axString(child, kAXDescriptionAttribute), value: axString(child, kAXValueAttribute),
      x: point.x, y: point.y, width: size.width, height: size.height)
  }
}

func isGuestWebArea(_ element: AXUIElement, role: String) -> Bool {
  guard role == "AXWebArea" else { return false }
  for key in [kAXURLAttribute, "AXDocument", kAXDescriptionAttribute, kAXValueAttribute] {
    var value: CFTypeRef?
    if AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success {
      let text = (value as? URL)?.absoluteString ?? (value as? NSURL)?.absoluteString ?? (value as? String) ?? ""
      if text.contains("chrome://aux/") { return false }
      if !text.isEmpty { return true }
    }
  }
  return false
}

func pressCheckbox(_ label: String) -> Bool {
  let application = AXUIElementCreateApplication(pid)
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int) -> Bool {
    visited += 1
    if depth > 28 || visited > 4000 { return false }
    var roleValue: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
    let role = roleValue as? String ?? ""
    if role == (kAXMenuBarRole as String) { return false }
    if role == (kAXCheckBoxRole as String) {
      var title: CFTypeRef?
      var description: CFTypeRef?
      AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &title)
      AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &description)
      if (title as? String) == label || (description as? String) == label {
        AXUIElementSetAttributeValue(element, kAXFocusedAttribute as CFString, kCFBooleanTrue)
        return AXUIElementPerformAction(element, kAXPressAction as CFString) == .success
      }
    }
    var children: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
      let children = children as? [AXUIElement] else { return false }
    return children.contains { visit($0, depth: depth + 1, visited: &visited) }
  }
  var visits = 0
  return visit(application, depth: 0, visited: &visits)
}

func pressButton(_ label: String, press: Bool = true) -> Bool {
  let application = AXUIElementCreateApplication(pid)
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int, shellOnly: Bool) -> Bool {
    visited += 1
    if depth > 24 || visited > 4000 { return false }
    var roleValue: CFTypeRef?
    var titleValue: CFTypeRef?
    var descriptionValue: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
    let role = roleValue as? String ?? ""
    if role == (kAXMenuBarRole as String) { return false }
    AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &titleValue)
    AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &descriptionValue)
    let title = titleValue as? String ?? ""
    let description = descriptionValue as? String ?? ""
    if (role == (kAXButtonRole as String) || role == (kAXPopUpButtonRole as String)) && (title == label || description == label) {
      let focused = AXUIElementSetAttributeValue(element, kAXFocusedAttribute as CFString, kCFBooleanTrue) == .success
      if !press { return focused }
      return AXUIElementPerformAction(element, kAXPressAction as CFString) == .success
    }
    if shellOnly && isGuestWebArea(element, role: role) { return false }
    var childrenValue: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &childrenValue) == .success,
      let children = childrenValue as? [AXUIElement] else { return false }
    return children.contains { visit($0, depth: depth + 1, visited: &visited, shellOnly: shellOnly) }
  }
  var shellVisits = 0
  if visit(application, depth: 0, visited: &shellVisits, shellOnly: true) { return true }
  var pageVisits = 0
  return visit(application, depth: 0, visited: &pageVisits, shellOnly: false)
}

struct HitRecord: Encodable {
  let ok: Bool
  let x: Double
  let y: Double
  let role: String
  let samples: String
}

func axNames(_ element: AXUIElement) -> [String] {
  [kAXTitleAttribute, kAXDescriptionAttribute, kAXValueAttribute].compactMap { key in
    let text = axString(element, key as String)
    return text.isEmpty ? nil : text
  }
}

// A settings control can report the whole content pane as its frame. Hit-testing
// still returns the control under the pointer, so scan that pane for an exact name.
func hitName(_ needle: String, wholeWindow: Bool = false) -> HitRecord {
  let window = screenWindow() ?? .zero
  let frame = wholeWindow ? nil : frameByName(needle)
  var rects: [CGRect] = []
  if let frame {
    let raw = CGRect(x: frame.rawX - frame.width / 2, y: frame.rawY - frame.height / 2, width: frame.width, height: frame.height)
    let flipped = CGRect(x: frame.flippedX - frame.width / 2, y: frame.flippedY - frame.height / 2, width: frame.width, height: frame.height)
    // Shell frames are already in CGEvent space. The mirrored rect is the page.
    let ordered = window.intersects(raw) ? [raw, flipped] : [flipped, raw]
    for rect in ordered where rect.width > 8 && rect.height > 8 && window.intersects(rect) {
      if !rects.contains(where: { abs($0.minY - rect.minY) < 8 && abs($0.minX - rect.minX) < 8 }) { rects.append(rect) }
      if rects.count == 1 && window.contains(CGPoint(x: rect.midX, y: rect.midY)) { break }
    }
  }
  if rects.isEmpty { rects.append(window.insetBy(dx: 48, dy: 80)) }
  let controls: Set<String> = [kAXCheckBoxRole as String, kAXButtonRole as String, "AXRadioButton", "AXTextField", "AXTextArea", kAXPopUpButtonRole as String, "AXStaticText"]
  var samples: [String] = []
  let application = AXUIElementCreateApplication(pid)
  for rect in rects {
    if samples.count < 8 { samples.append("scan \(Int(rect.minX)),\(Int(rect.minY)) \(Int(rect.width))x\(Int(rect.height))") }
    let yStep: CGFloat = rect.height > 140 ? 12 : 8
    let xStep: CGFloat = rect.height > 140 ? 24 : 8
    var y = rect.minY + 4
    while y < rect.maxY - 4 {
      var x = rect.minX + 4
      while x < rect.maxX - 4 {
        var element: AXUIElement?
        if AXUIElementCopyElementAtPosition(application, Float(x), Float(y), &element) == .success, let element {
          let role = axString(element, kAXRoleAttribute as String)
          let names = axNames(element)
          let named = names.contains { $0.contains(needle) }
          if samples.count < 8 && (named || names.contains { $0.localizedCaseInsensitiveContains("memory") || $0.contains("Enable") || $0.contains("Import") }) {
            let size = axSize(element) ?? .zero
            let stamp = "\(role) \(names.first.map { String($0.prefix(42)) } ?? "") \(Int(size.width))x\(Int(size.height))@\(Int(x)),\(Int(y))"
            if !samples.contains(stamp) { samples.append(stamp) }
          }
          if named && controls.contains(role) {
            return HitRecord(ok: true, x: x, y: y, role: role, samples: samples.joined(separator: " | "))
          }
        }
        x += xStep
      }
      y += yStep
    }
  }
  return HitRecord(ok: false, x: 0, y: 0, role: "", samples: samples.joined(separator: " | "))
}

func scrollNameIntoView(_ needle: String) -> Bool {
  let application = AXUIElementCreateApplication(pid)
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int) -> AXUIElement? {
    visited += 1
    if depth > 28 || visited > 5000 { return nil }
    if axNames(element).contains(where: { $0.contains(needle) }) { return element }
    var children: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
      let children = children as? [AXUIElement] else { return nil }
    for child in children {
      if let found = visit(child, depth: depth + 1, visited: &visited) { return found }
    }
    return nil
  }
  var visited = 0
  guard var current = visit(application, depth: 0, visited: &visited) else { return false }
  for _ in 0..<8 {
    if AXUIElementPerformAction(current, "AXScrollToVisible" as CFString) == .success { return true }
    var parent: CFTypeRef?
    if AXUIElementCopyAttributeValue(current, kAXParentAttribute as CFString, &parent) != .success { return false }
    guard let parent, CFGetTypeID(parent) == AXUIElementGetTypeID() else { return false }
    current = unsafeBitCast(parent, to: AXUIElement.self)
  }
  return false
}

// Persistent JSON-line protocol. Requests carry an optional id and a command.
// Replies always preserve id and contain either result or an explicit error.
struct ProtocolError: Error { let message: String }
func protocolError(_ message: String) -> ProtocolError { ProtocolError(message: message) }
func axAttribute(_ element: AXUIElement, _ key: String) -> CFTypeRef? {
  var value: CFTypeRef?
  guard AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success else { return nil }
  return value
}
// These roles are accessibility leaves. Chromium can invalidate their backing
// nodes during menu transitions; asking a stale ignored button for AXChildren
// invokes BrowserAccessibility::IsLeaf and trips its unignored-node DCHECK.
let axLeafRoles: Set<String> = ["AXButton", "AXCheckBox", "AXStaticText", "AXImage",
  "AXProgressIndicator", "AXSlider", "AXTextField", "AXTextArea"]
func axHidden(_ element: AXUIElement) -> Bool {
  axAttribute(element, "AXHidden") as? Bool == true
}
func axChildren(_ element: AXUIElement) -> [AXUIElement] {
  guard !axHidden(element), !axLeafRoles.contains(axString(element, kAXRoleAttribute)) else { return [] }
  return axAttribute(element, kAXChildrenAttribute) as? [AXUIElement] ?? []
}
func requireLiveTarget() throws {
  if app.isTerminated || NSRunningApplication(processIdentifier: pid) == nil ||
     (Darwin.kill(pid, 0) != 0 && errno == ESRCH) {
    throw protocolError("Target process exited (PID \(pid))")
  }
}
func frontmostGuard() throws {
  guard app.activate(options: [.activateAllWindows]) else { throw protocolError("Cannot activate target application") }
  AXUIElementSetAttributeValue(AXUIElementCreateApplication(pid), kAXFrontmostAttribute as CFString, kCFBooleanTrue)
  for _ in 0..<30 {
    if NSWorkspace.shared.frontmostApplication?.processIdentifier == pid { return }
    usleep(100_000)
  }
  throw protocolError("Target is not frontmost; input refused")
}
func windowInventory() -> [[String: Any]] {
  let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
  return windows.compactMap { window in
    guard (window[kCGWindowOwnerPID as String] as? Int32) == pid,
          let id = window[kCGWindowNumber as String] as? Int,
          let bounds = window[kCGWindowBounds as String] as? [String: Any] else { return nil }
    return ["id": id, "x": bounds["X"] ?? 0, "y": bounds["Y"] ?? 0,
            "width": bounds["Width"] ?? 0, "height": bounds["Height"] ?? 0,
            "layer": window[kCGWindowLayer as String] ?? 0]
  }
}
func protocolNames(_ element: AXUIElement) -> [String] {
  // Secure input values never enter evidence or matching output.
  if axString(element, kAXSubroleAttribute) == "AXSecureTextField" {
    return [kAXTitleAttribute, kAXDescriptionAttribute].map { axString(element, $0) }.filter { !$0.isEmpty }
  }
  return axNames(element)
}
func selectorMatches(_ element: AXUIElement, _ selector: [String: Any]) throws -> Bool {
  if let role = selector["role"] as? String, axString(element, kAXRoleAttribute) != role { return false }
  if let enabled = selector["enabled"] as? Bool,
     (axAttribute(element, kAXEnabledAttribute) as? Bool ?? false) != enabled { return false }
  if let name = selector["name"] as? String {
    let names = protocolNames(element)
    switch selector["match"] as? String ?? "exact" {
    case "exact": if !names.contains(name) { return false }
    case "contains": if !names.contains(where: { $0.contains(name) }) { return false }
    case "regex":
      let regex = try NSRegularExpression(pattern: name)
      if !names.contains(where: { regex.firstMatch(in: $0, range: NSRange($0.startIndex..., in: $0)) != nil }) { return false }
    default: throw protocolError("Unknown selector match")
    }
  }
  return true
}
func queryElements(_ selector: [String: Any]) throws -> [(AXUIElement, Int)] {
  try requireLiveTarget()
  let scope = selector["scope"] as? String ?? "any"
  guard ["shell", "page", "any", "window"].contains(scope) else { throw protocolError("Unknown selector scope") }
  var roots = [AXUIElementCreateApplication(pid)]
  if let within = selector["within"] as? [String: Any] { roots = try queryElements(within).map { $0.0 } }
  else if scope == "window" { roots = axAttribute(roots[0], kAXWindowsAttribute) as? [AXUIElement] ?? [] }
  var found: [(AXUIElement, Int)] = []
  var visits = 0
  func walk(_ element: AXUIElement, _ depth: Int, _ inPage: Bool) throws {
    visits += 1
    guard visits <= 12000, depth <= 40, !axHidden(element) else { return }
    let guest = inPage || isGuestWebArea(element, role: axString(element, kAXRoleAttribute))
    if scope == "shell" && guest { return }
    if scope != "page" || guest {
      if try selectorMatches(element, selector) { found.append((element, depth)) }
    }
    for child in axChildren(element) { try walk(child, depth + 1, guest) }
  }
  for root in roots {
    var parent = root
    var guest = false
    for _ in 0..<40 {
      if isGuestWebArea(parent, role: axString(parent, kAXRoleAttribute)) { guest = true; break }
      guard let value = axAttribute(parent, kAXParentAttribute), CFGetTypeID(value) == AXUIElementGetTypeID() else { break }
      parent = unsafeBitCast(value, to: AXUIElement.self)
    }
    try walk(root, 0, guest)
  }
  try requireLiveTarget()
  if let index = selector["index"] as? Int {
    guard index >= 0 else { throw protocolError("Selector index must be nonnegative") }
    return index < found.count ? [found[index]] : []
  }
  return found
}
func elementRecord(_ element: AXUIElement, depth: Int) -> [String: Any] {
  var result: [String: Any] = ["role": axString(element, kAXRoleAttribute),
    "name": protocolNames(element).first(where: { !$0.isEmpty }) ?? "", "names": protocolNames(element),
    "enabled": axAttribute(element, kAXEnabledAttribute) as? Bool ?? false,
    "focused": axAttribute(element, kAXFocusedAttribute) as? Bool ?? false, "depth": depth]
  if ["AXCheckBox", "AXRadioButton"].contains(axString(element, kAXRoleAttribute)),
     let value = axAttribute(element, kAXValueAttribute) as? NSNumber {
    result["checked"] = value.boolValue
  }
  if axString(element, kAXRoleAttribute) == "AXTextField",
     axString(element, kAXSubroleAttribute) != "AXSecureTextField" {
    let placeholder = axString(element, "AXPlaceholderValue")
    if !placeholder.isEmpty { result["placeholder"] = placeholder }
  }
  if let point = axPoint(element, kAXPositionAttribute), let size = axSize(element) {
    result["frame"] = ["x": point.x, "y": point.y, "width": size.width, "height": size.height]
  }
  return result
}
func selectedElement(_ request: [String: Any]) throws -> AXUIElement {
  guard let selector = request["selector"] as? [String: Any] else { throw protocolError("selector required") }
  let found = try queryElements(selector)
  guard found.count == 1 else { throw protocolError("Expected one element; found \(found.count)") }
  return found[0].0
}
func requestPoint(_ request: [String: Any]) throws -> CGPoint {
  if let x = request["x"] as? Double, let y = request["y"] as? Double, x.isFinite, y.isFinite { return CGPoint(x: x, y: y) }
  let element = try selectedElement(request)
  guard let point = axPoint(element, kAXPositionAttribute), let size = axSize(element) else { throw protocolError("Element has no frame") }
  return CGPoint(x: point.x + size.width / 2, y: point.y + size.height / 2)
}
let keyCodes: [String: CGKeyCode] = [
  "a":0,"s":1,"d":2,"f":3,"h":4,"g":5,"z":6,"x":7,"c":8,"v":9,"b":11,
  "q":12,"w":13,"e":14,"r":15,"y":16,"t":17,"1":18,"2":19,"3":20,"4":21,
  "6":22,"5":23,"=":24,"9":25,"7":26,"-":27,"8":28,"0":29,
  "]":30,"o":31,"u":32,"[":33,"i":34,"p":35,"enter":36,"return":36,
  "l":37,"j":38,"'":39,"k":40,";":41,"\\":42,",":43,"/":44,"n":45,"m":46,
  ".":47,"tab":48,"space":49,"`":50,"backspace":51,"escape":53,"esc":53,
  "iso":10,"rightcommand":54,"command":55,"shift":56,"capslock":57,"option":58,"control":59,"rightshift":60,
  "rightoption":61,"rightcontrol":62,"fn":63,"f17":64,"decimal":65,"multiply":67,
  "add":69,"clear":71,"volumeup":72,"volumedown":73,"mute":74,"divide":75,"numpadenter":76,"subtract":78,"f18":79,"f19":80,
  "numpadequals":81,"numpad0":82,"numpad1":83,"numpad2":84,"numpad3":85,
  "numpad4":86,"numpad5":87,"numpad6":88,"numpad7":89,"f20":90,"numpad8":91,
  "numpad9":92,"yen":93,"underscore":94,"numpadcomma":95,"eisu":102,"kana":104,"f5":96,"f6":97,"f7":98,"f3":99,"f8":100,"f9":101,
  "f11":103,"f13":105,"f16":106,"f14":107,"f10":109,"f12":111,"f15":113,
  "help":114,"home":115,"pageup":116,"delete":117,"forwarddelete":117,"f4":118,
  "end":119,"f2":120,"pagedown":121,"f1":122,"left":123,"right":124,"down":125,"up":126]
func eventFlags(_ names: [String]) throws -> CGEventFlags {
  var flags: CGEventFlags = []
  for name in names {
    switch name.lowercased() {
    case "cmd", "command", "meta", "⌘": flags.insert(.maskCommand)
    case "ctrl", "control", "⌃": flags.insert(.maskControl)
    case "alt", "option", "⌥": flags.insert(.maskAlternate)
    case "shift", "⇧": flags.insert(.maskShift)
    default: throw protocolError("Unknown modifier: \(name)")
    }
  }
  return flags
}
func keyEvents(_ chord: String) throws -> (CGEvent, CGEvent) {
  let normalized = chord.lowercased().replacingOccurrences(of: "⌘", with: "command+")
    .replacingOccurrences(of: "⌃", with: "control+").replacingOccurrences(of: "⌥", with: "option+")
    .replacingOccurrences(of: "⇧", with: "shift+")
  let parts = normalized.split(separator: "+").map(String.init)
  guard let last = parts.last, let code = keyCodes[last] else { throw protocolError("Unknown key chord") }
  let flags = try eventFlags(Array(parts.dropLast()))
  guard let down = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: true),
        let up = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: false) else { throw protocolError("Cannot create key event") }
  down.flags = flags; up.flags = flags
  return (down, up)
}
// A phased HID probe owns at most one held key, with automatic physical
// release on protocol failure/EOF, target loss, or a 15-second test bound.
final class HeldKeySession: @unchecked Sendable {
  private struct Key {
    let code: Int64
    let flags: CGEventFlags
    let release: CGEvent
    let deadline: UInt64
  }
  private let owner: pid_t
  private let application: NSRunningApplication
  private let lock = NSLock()
  private var key: Key?
  private var timer: DispatchSourceTimer?
  init(owner: pid_t, application: NSRunningApplication) {
    self.owner = owner; self.application = application
  }
  func requireAvailable(code: Int64? = nil) throws {
    lock.lock(); defer { lock.unlock() }
    if let held = key, code == nil || code == held.code {
      throw protocolError("A conflicting physical key is already held")
    }
  }
  func post(_ down: CGEvent, release: CGEvent, phase: String) throws {
    lock.lock(); defer { lock.unlock() }
    let code = down.getIntegerValueField(.keyboardEventKeycode)
    if phase == "down" {
      guard key == nil else { throw protocolError("A physical key is already held") }
      let now = DispatchTime.now().uptimeNanoseconds
      key = Key(code: code, flags: down.flags, release: release, deadline: now + 15_000_000_000)
      let expiry = DispatchSource.makeTimerSource(queue: .global(qos: .userInteractive))
      expiry.schedule(deadline: .now() + .milliseconds(50), repeating: .milliseconds(50))
      expiry.setEventHandler { [weak self] in self?.checkLifetime() }
      timer = expiry
      down.timestamp = now
      down.post(tap: .cghidEventTap)
      expiry.resume()
      return
    }
    guard let held = key, held.code == code, held.flags == down.flags else {
      throw protocolError("No matching physical key/modifiers are held")
    }
    if phase == "repeat" {
      down.setIntegerValueField(.keyboardEventAutorepeat, value: 1)
      down.timestamp = DispatchTime.now().uptimeNanoseconds
      down.post(tap: .cghidEventTap)
      return
    }
    key = nil; timer?.cancel(); timer = nil
    release.timestamp = DispatchTime.now().uptimeNanoseconds
    release.post(tap: .cghidEventTap)
  }
  private func releaseLocked() {
    guard let held = key else { return }
    key = nil; timer?.cancel(); timer = nil
    held.release.timestamp = DispatchTime.now().uptimeNanoseconds
    held.release.post(tap: .cghidEventTap)
  }
  func release() {
    lock.lock(); defer { lock.unlock() }
    releaseLocked()
  }
  private func checkLifetime() {
    lock.lock(); defer { lock.unlock() }
    let expired = key.map { DispatchTime.now().uptimeNanoseconds >= $0.deadline } ?? false
    let exited = application.isTerminated || (Darwin.kill(owner, 0) != 0 && errno == ESRCH)
    if expired || exited { releaseLocked() }
  }
  deinit { release() }
}
let heldKeySession = HeldKeySession(owner: pid, application: app)
func postKey(_ chord: String, via: String = "pid", phase: String = "press") throws {
  guard ["pid", "hid"].contains(via) else { throw protocolError("via must be pid or hid") }
  guard ["press", "down", "up", "repeat"].contains(phase) else { throw protocolError("Unknown key phase") }
  let (down, up) = try keyEvents(chord)
  if phase != "press" {
    guard via == "hid" else { throw protocolError("Phased keys require physical HID posting") }
    try requireLiveTarget()
    try heldKeySession.post(down, release: up, phase: phase)
    return
  }
  try heldKeySession.requireAvailable(code: down.getIntegerValueField(.keyboardEventKeycode))
  for event in [down, up] { if via == "hid" { event.post(tap: .cghidEventTap) } else { event.postToPid(pid) }; usleep(20_000) }
}
// One helper clock measures physical posting through a confirmed AX notification.
// Observer setup and request/response transport are outside this interval.
final class ShortcutEffectObservation {
  let pid: pid_t
  let confirmEffect: () throws -> Bool
  let validateTarget: () throws -> Void
  var postedAt: UInt64?
  var observedAt: UInt64?
  var notification: String?
  init(pid: pid_t, confirmEffect: @escaping () throws -> Bool, validateTarget: @escaping () throws -> Void) {
    self.pid = pid; self.confirmEffect = confirmEffect; self.validateTarget = validateTarget
  }
  func observe(_ notification: CFString) {
    let receivedAt = DispatchTime.now().uptimeNanoseconds
    guard postedAt != nil, observedAt == nil,
          NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else { return }
    do {
      try validateTarget()
      guard try confirmEffect() else { return }
    } catch { return }
    observedAt = receivedAt
    self.notification = notification as String
  }
}
// Visibility trials require one owned window: disappearance must not be
// confused with selecting another window or the target process exiting.
func visibleShortcutElements(_ selector: [String: Any], window: AXUIElement) throws -> [(AXUIElement, Int)] {
  try queryElements(selector).filter { element, _ in
    guard let position = axPoint(element, kAXPositionAttribute), let size = axSize(element),
          let origin = axPoint(window, kAXPositionAttribute), let bounds = axSize(window) else { return false }
    return size.width > 0 && size.height > 0 &&
      CGRect(origin: position, size: size).intersects(CGRect(origin: origin, size: bounds))
  }
}
func measureKey(_ request: [String: Any]) throws -> [String: Any] {
  try heldKeySession.requireAvailable()
  guard let chord = request["chord"] as? String else { throw protocolError("chord required") }
  let expectedName = request["expectedName"] as? String
  let expectedVisible = request["expectedVisible"] as? Bool
  guard (expectedName != nil) != (expectedVisible != nil), expectedName != "" else {
    throw protocolError("Exactly one of expectedName or expectedVisible required")
  }
  let target = try selectedElement(request)
  let application = AXUIElementCreateApplication(pid)
  var owningWindow: AXUIElement?
  var selector: [String: Any] = [:]
  if let expectedVisible {
    guard !expectedVisible, let supplied = request["selector"] as? [String: Any],
          supplied["index"] == nil, supplied["scope"] as? String == "shell", supplied["within"] == nil,
          let windows = axAttribute(application, kAXWindowsAttribute) as? [AXUIElement], windows.count == 1 else {
      throw protocolError("Visibility timing requires one window, an unindexed shell selector and expectedVisible false")
    }
    selector = supplied; owningWindow = windows[0]
    guard try visibleShortcutElements(selector, window: windows[0]).count == 1 else {
      throw protocolError("Shortcut visibility target must initially be visible")
    }
  } else if let expectedName, protocolNames(target).contains(expectedName) {
    throw protocolError("Shortcut target already has the expected name")
  }
  let targetPid = pid
  let effect: () throws -> Bool = {
    if let owningWindow {
      guard let windows = axAttribute(application, kAXWindowsAttribute) as? [AXUIElement],
            windows.count == 1, CFEqual(windows[0], owningWindow) else {
        throw protocolError("Shortcut owning window changed")
      }
      return try visibleShortcutElements(selector, window: owningWindow).isEmpty
    }
    var owner: pid_t = 0
    return AXUIElementGetPid(target, &owner) == .success && owner == targetPid &&
      protocolNames(target).contains(expectedName!)
  }
  let (down, up) = try keyEvents(chord)
  let observation = ShortcutEffectObservation(pid: pid, confirmEffect: effect, validateTarget: requireLiveTarget)
  var observer: AXObserver?
  let status = AXObserverCreate(pid, { _, _, notification, context in
    guard let context else { return }
    Unmanaged<ShortcutEffectObservation>.fromOpaque(context).takeUnretainedValue().observe(notification)
  }, &observer)
  guard status == .success, let observer else { throw protocolError("Cannot create shortcut AX observer") }
  let context = Unmanaged.passUnretained(observation).toOpaque()
  var registrations: [(AXUIElement, CFString)] = []
  var notifications = [(target, kAXTitleChangedNotification),
                       (target, kAXValueChangedNotification),
                       (application, kAXLayoutChangedNotification)]
  if let owningWindow {
    notifications += [(target, kAXUIElementDestroyedNotification),
                      (owningWindow, kAXLayoutChangedNotification)]
  }
  for (element, notification) in notifications {
    let name = notification as CFString
    if AXObserverAddNotification(observer, element, name, context) == .success {
      registrations.append((element, name))
    }
  }
  guard registrations.contains(where: { CFEqual($0.0, target) }) &&
        (owningWindow == nil || registrations.contains(where: { CFEqual($0.0, application) || CFEqual($0.0, owningWindow!) })) else {
    for (element, name) in registrations { AXObserverRemoveNotification(observer, element, name) }
    throw protocolError("Shortcut target does not support AX change observation")
  }
  let source = AXObserverGetRunLoopSource(observer)
  let runLoop = CFRunLoopGetCurrent()
  CFRunLoopAddSource(runLoop, source, .defaultMode)
  defer {
    for (element, name) in registrations { AXObserverRemoveNotification(observer, element, name) }
    CFRunLoopRemoveSource(runLoop, source, .defaultMode)
  }
  // Discard queued notifications while the observation is deliberately unarmed.
  let drainDeadline = DispatchTime.now().uptimeNanoseconds + 1_000_000_000
  while CFRunLoopRunInMode(.defaultMode, 0.001, true) == .handledSource {
    guard DispatchTime.now().uptimeNanoseconds < drainDeadline else {
      throw protocolError("Cannot drain preexisting AX notifications")
    }
  }
  try requireLiveTarget()
  guard NSWorkspace.shared.frontmostApplication?.processIdentifier == pid,
        !(try effect()) else {
    throw protocolError("Shortcut target changed before physical posting")
  }
  let requestedTimeout = request["timeoutMs"] as? Double ?? 500
  guard requestedTimeout.isFinite else { throw protocolError("timeoutMs must be finite") }
  let timeoutMs = min(max(requestedTimeout, 20), 5000)
  var released = false
  let releaseTimer = CFRunLoopTimerCreateWithHandler(nil, CFAbsoluteTimeGetCurrent() + 0.02, 0, 0, 0) { _ in
    up.post(tap: .cghidEventTap); released = true
  }!
  CFRunLoopAddTimer(runLoop, releaseTimer, .defaultMode)
  defer {
    CFRunLoopTimerInvalidate(releaseTimer)
    if !released { up.post(tap: .cghidEventTap) }
  }
  let started = DispatchTime.now().uptimeNanoseconds
  observation.postedAt = started
  down.post(tap: .cghidEventTap)
  let deadline = started + UInt64(timeoutMs * 1_000_000)
  while DispatchTime.now().uptimeNanoseconds < deadline {
    try requireLiveTarget()
    if observation.observedAt != nil && released { break }
    CFRunLoopRunInMode(.defaultMode, 0.005, true)
  }
  guard let observedAt = observation.observedAt, let notification = observation.notification else {
    throw protocolError("Shortcut produced no confirmed AX notification within \(timeoutMs)ms")
  }
  var result: [String: Any] = ["elapsedMs": Double(observedAt - started) / 1_000_000,
          "postedAtNs": String(started), "observedAtNs": String(observedAt),
          "notification": notification, "via": "hid"]
  if let expectedVisible {
    result["expectedVisible"] = expectedVisible
    result["selector"] = selector
    result["visibleElements"] = try visibleShortcutElements(selector, window: owningWindow!).map { elementRecord($0.0, depth: $0.1) }
  } else {
    result["expectedName"] = expectedName!
    result["element"] = elementRecord(target, depth: 0)
  }
  return result
}
func postText(_ text: String) throws {
  // Send Unicode scalars together so surrogate pairs remain intact.
  for scalar in text.unicodeScalars {
    var units = Array(String(scalar).utf16)
    guard let down = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true),
          let up = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false) else { throw protocolError("Cannot create text event") }
    down.flags = []; up.flags = []
    units.withUnsafeMutableBufferPointer { buffer in
      down.keyboardSetUnicodeString(stringLength: buffer.count, unicodeString: buffer.baseAddress!)
      up.keyboardSetUnicodeString(stringLength: buffer.count, unicodeString: buffer.baseAddress!)
    }
    down.postToPid(pid); up.postToPid(pid); usleep(14_000)
  }
}
func mouseEvent(_ type: CGEventType, at point: CGPoint, button: CGMouseButton = .left,
                flags: CGEventFlags = [], count: Int = 1) throws {
  guard let event = CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: point, mouseButton: button) else { throw protocolError("Cannot create mouse event") }
  event.flags = flags; event.setIntegerValueField(.mouseEventClickState, value: Int64(count)); event.post(tap: .cghidEventTap)
}
func protocolCommand(_ request: [String: Any]) throws -> Any {
  guard let command = (request["command"] ?? request["cmd"]) as? String else { throw protocolError("command required") }
  switch command {
  case "trusted": return trustedState()
  case "windows": return windowInventory()
  case "query", "dump":
    let selector = request["selector"] as? [String: Any] ?? [:]
    return try queryElements(selector).map { elementRecord($0.0, depth: $0.1) }
  case "waitFor":
    guard let selector = request["selector"] as? [String: Any] else { throw protocolError("selector required") }
    let state = request["state"] as? String ?? "present"
    guard ["present", "absent", "visible", "hidden", "enabled", "disabled", "focused"].contains(state) else { throw protocolError("Unknown wait state") }
    let timeout = min(max(request["timeoutMs"] as? Double ?? 5000, 0), 60000)
    let deadline = Date().addingTimeInterval(timeout / 1000)
    repeat {
      try requireLiveTarget()
      let found = try queryElements(selector)
      let absent = state == "absent" || state == "hidden"
      let hidden = found.allSatisfy { (axSize($0.0)?.width ?? 0) <= 0 || (axSize($0.0)?.height ?? 0) <= 0 }
      let satisfied = absent ? (state == "hidden" ? hidden : found.isEmpty) : found.contains { item in
        switch state {
        case "enabled": return axAttribute(item.0, kAXEnabledAttribute) as? Bool == true
        case "disabled": return axAttribute(item.0, kAXEnabledAttribute) as? Bool == false
        case "focused": return axAttribute(item.0, kAXFocusedAttribute) as? Bool == true
        case "visible": return (axSize(item.0)?.width ?? 0) > 0 && (axSize(item.0)?.height ?? 0) > 0
        default: return true
        }
      }
      if satisfied { return ["matched": true, "elements": found.map { elementRecord($0.0, depth: $0.1) }] }
      usleep(50_000)
    } while Date() < deadline
    throw protocolError("waitFor timed out: \(selector)")
  case "press", "focus", "click", "hover", "key", "type", "drag", "scroll", "menu", "contextMenu", "savePanel", "openPanel", "measureKey": break
  default: throw protocolError("Unknown command: \(command)")
  }
  try frontmostGuard()
  switch command {
  case "press", "focus":
    let target = try selectedElement(request)
    let status = command == "press" ? AXUIElementPerformAction(target, kAXPressAction as CFString)
      : AXUIElementSetAttributeValue(target, kAXFocusedAttribute as CFString, kCFBooleanTrue)
    guard status == .success else { throw protocolError("AX action failed: \(status.rawValue)") }
  case "measureKey": return try measureKey(request)
  case "key":
    guard let chord = request["chord"] as? String else { throw protocolError("chord required") }
    try postKey(chord, via: request["via"] as? String ?? "pid", phase: request["phase"] as? String ?? "press")
  case "type":
    guard let text = request["text"] as? String else { throw protocolError("text required") }
    if request["selector"] != nil {
      guard AXUIElementSetAttributeValue(try selectedElement(request), kAXFocusedAttribute as CFString, kCFBooleanTrue) == .success else { throw protocolError("Cannot focus text target") }
    }
    try postText(text)
  case "click", "hover", "contextMenu":
    let point = try requestPoint(request)
    let buttonName = command == "contextMenu" ? "right" : request["button"] as? String ?? "left"
    guard ["left", "right", "middle"].contains(buttonName) else { throw protocolError("Unknown mouse button") }
    let button: CGMouseButton = buttonName == "right" ? .right : buttonName == "middle" ? .center : .left
    let flags = try eventFlags(request["modifiers"] as? [String] ?? [])
    try mouseEvent(.mouseMoved, at: point, flags: flags)
    if command != "hover" {
      let count = min(max(request["count"] as? Int ?? 1, 1), 3)
      for i in 1...count {
        try mouseEvent(button == .right ? .rightMouseDown : button == .center ? .otherMouseDown : .leftMouseDown, at: point, button: button, flags: flags, count: i)
        try mouseEvent(button == .right ? .rightMouseUp : button == .center ? .otherMouseUp : .leftMouseUp, at: point, button: button, flags: flags, count: i)
        usleep(30_000)
      }
    }
  case "drag":
    guard let from = request["from"] as? [String: Any], let to = request["to"] as? [String: Any] else { throw protocolError("from and to required") }
    let start = try requestPoint(from), end = try requestPoint(to)
    let steps = min(max(request["steps"] as? Int ?? 20, 1), 1000)
    var destinationHoldMs = 0.0
    if let value = request["destinationHoldMs"] {
      guard let duration = value as? Double, duration.isFinite, duration >= 0, duration <= 10000 else {
        throw protocolError("destinationHoldMs must be between 0 and 10000")
      }
      destinationHoldMs = duration
    }
    try mouseEvent(.leftMouseDown, at: start)
    defer { try? mouseEvent(.leftMouseUp, at: end) }
    usleep(useconds_t(min(max(request["holdMs"] as? Double ?? 100, 0), 10000) * 1000))
    for step in 1...steps {
      let fraction = Double(step) / Double(steps)
      try mouseEvent(.leftMouseDragged, at: CGPoint(x: start.x + (end.x-start.x)*fraction, y: start.y + (end.y-start.y)*fraction))
      usleep(16_000)
    }
    usleep(useconds_t(destinationHoldMs * 1000))
  case "scroll":
    let point = try requestPoint(request)
    guard let event = CGEvent(scrollWheelEvent2Source: nil, units: .pixel, wheelCount: 2,
      wheel1: Int32(clamping: request["dy"] as? Int ?? 0), wheel2: Int32(clamping: request["dx"] as? Int ?? 0), wheel3: 0) else { throw protocolError("Cannot create scroll event") }
    event.location = point; event.post(tap: .cghidEventTap)
  case "menu":
    guard let path = request["path"] as? [String], !path.isEmpty else { throw protocolError("menu path required") }
    let menuBar = axAttribute(AXUIElementCreateApplication(pid), kAXMenuBarAttribute)
    var root: AXUIElement? = menuBar.flatMap { CFGetTypeID($0) == AXUIElementGetTypeID() ? unsafeBitCast($0, to: AXUIElement.self) : nil }
    for name in path {
      guard let current = root else { throw protocolError("Menu unavailable") }
      var candidates: [AXUIElement] = []
      func find(_ node: AXUIElement, _ depth: Int) {
        guard depth < 4 else { return }
        if axNames(node).contains(name) { candidates.append(node); return }
        for child in axChildren(node) { find(child, depth + 1) }
      }
      find(current, 0)
      guard let item = candidates.first, AXUIElementPerformAction(item, kAXPressAction as CFString) == .success else { throw protocolError("Menu item unavailable: \(name)") }
      root = item; usleep(100_000)
    }
  case "savePanel", "openPanel":
    guard let path = request["path"] as? String, !path.isEmpty else { throw protocolError("panel path required") }
    let sheets = try queryElements(["role": "AXSheet", "scope": "window"])
    guard !sheets.isEmpty else { throw protocolError("No panel sheet is open") }
    try postKey("command+shift+g"); usleep(150_000); try postText(path); try postKey("enter"); usleep(200_000)
    let button = request["button"] as? String ?? (command == "savePanel" ? "Save" : "Open")
    let found = try queryElements(["role": "AXButton", "name": button, "scope": "window", "enabled": true])
    guard found.count == 1, AXUIElementPerformAction(found[0].0, kAXPressAction as CFString) == .success else { throw protocolError("Panel confirmation unavailable") }
  default: break
  }
  return true
}
func serveProtocol() {
  defer { heldKeySession.release() }
  while let line = readLine() {
    var response: [String: Any] = [:]
    do {
      guard let bytes = line.data(using: .utf8), let request = try JSONSerialization.jsonObject(with: bytes) as? [String: Any] else { throw protocolError("JSON object required") }
      response["id"] = request["id"] ?? NSNull()
      response["result"] = try protocolCommand(request); response["ok"] = true
    } catch {
      heldKeySession.release()
      response["id"] = response["id"] ?? NSNull(); response["ok"] = false
      response["error"] = (error as? ProtocolError)?.message ?? String(describing: error)
    }
    if let data = try? JSONSerialization.data(withJSONObject: response, options: [.sortedKeys]), let text = String(data: data, encoding: .utf8) { print(text); fflush(stdout) }
  }
}

if action == "serve" { serveProtocol(); exit(0) }
if action == "windows" {
  let data = try! JSONSerialization.data(withJSONObject: windowInventory(), options: [.sortedKeys])
  print(String(data: data, encoding: .utf8)!); exit(0)
}
// Apply the same target guard to legacy mouse and AX input actions.
if ["press-button", "focus-name", "press-label", "press-checkbox", "click-button", "click-name", "click-at", "scroll-at", "scroll-name"].contains(action) {
  do { try frontmostGuard() } catch { fail(String(describing: error)) }
}

if action == "press-button" {
  guard CommandLine.arguments.count == 4 else { fail("Use press-button PID label.") }
  print(pressButton(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "focus-name" {
  guard CommandLine.arguments.count == 4 else { fail("Use focus-name PID label.") }
  print(pressButton(CommandLine.arguments[3], press: false) ? "true" : "false")
} else if action == "press-label" {
  guard CommandLine.arguments.count == 4 else { fail("Use press-label PID label.") }
  print(pressLabel(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "press-checkbox" {
  guard CommandLine.arguments.count == 4 else { fail("Use press-checkbox PID label.") }
  print(pressCheckbox(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "click-button" || action == "frame" {
  guard CommandLine.arguments.count == 4 else { fail("Use \(action) PID label.") }
  let click = action == "frame" ? controlClickRecord(CommandLine.arguments[3]) : clickButton(CommandLine.arguments[3])
  guard let click,
    let data = try? JSONEncoder().encode(click),
    let text = String(data: data, encoding: .utf8) else { fail("Cannot \(action) that control.") }
  print(text)
} else if action == "click-name" || action == "frame-name" {
  guard CommandLine.arguments.count == 4 else { fail("Use \(action) PID phrase.") }
  let click = action == "frame-name" ? frameByName(CommandLine.arguments[3]) : clickByName(CommandLine.arguments[3])
  guard let click,
    let data = try? JSONEncoder().encode(click),
    let text = String(data: data, encoding: .utf8) else { fail("Cannot \(action) that control.") }
  print(text)
} else if action == "click-at" {
  guard CommandLine.arguments.count == 5,
    let x = Double(CommandLine.arguments[3]),
    let y = Double(CommandLine.arguments[4]) else { fail("Use click-at PID x y.") }
  _ = app.activate(options: [])
  postClick(CGPoint(x: x, y: y))
  print("true")
} else if action == "scroll-at" {
  guard CommandLine.arguments.count == 6,
    let x = Double(CommandLine.arguments[3]),
    let y = Double(CommandLine.arguments[4]),
    let dy = Int32(CommandLine.arguments[5]),
    let event = CGEvent(scrollWheelEvent2Source: nil, units: .pixel, wheelCount: 1, wheel1: dy, wheel2: 0, wheel3: 0) else {
    fail("Use scroll-at PID x y dy.")
  }
  _ = app.activate(options: [.activateAllWindows])
  let point = CGPoint(x: x, y: y)
  CGWarpMouseCursorPosition(point)
  event.location = point
  event.post(tap: .cghidEventTap)
  print("true")
} else if action == "scroll-name" {
  guard CommandLine.arguments.count == 4 else { fail("Use scroll-name PID phrase.") }
  print(scrollNameIntoView(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "child-frames" {
  guard CommandLine.arguments.count == 4 else { fail("Use child-frames PID phrase.") }
  guard let frames = childFrames(CommandLine.arguments[3]),
    let data = try? JSONEncoder().encode(frames),
    let text = String(data: data, encoding: .utf8) else { fail("Cannot list that control.") }
  print(text)
} else if action == "hit-name" {
  guard CommandLine.arguments.count == 4 || (CommandLine.arguments.count == 5 && CommandLine.arguments[4] == "window") else {
    fail("Use hit-name PID phrase [window].")
  }
  let hit = hitName(CommandLine.arguments[3], wholeWindow: CommandLine.arguments.count == 5)
  guard let data = try? JSONEncoder().encode(hit),
    let text = String(data: data, encoding: .utf8) else { fail("Cannot encode hit-name.") }
  print(text)
} else if action == "has-button" {
  guard CommandLine.arguments.count == 4 else { fail("Use has-button PID label.") }
  print(hasButton(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "button-enabled" {
  guard CommandLine.arguments.count == 4 else { fail("Use button-enabled PID label.") }
  var enabled: CFTypeRef?
  let button = findButton(CommandLine.arguments[3])
  print(button != nil && AXUIElementCopyAttributeValue(button!, kAXEnabledAttribute as CFString, &enabled) == .success &&
    (enabled as? Bool) == true ? "true" : "false")
} else if action == "has-disabled-button" {
  guard CommandLine.arguments.count == 4 else { fail("Use has-disabled-button PID label.") }
  print(hasDisabledButton(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "buttons" {
  let data = try! JSONEncoder().encode(buttonLabels())
  print(String(data: data, encoding: .utf8)!)
} else if action == "has-text" {
  guard CommandLine.arguments.count == 4 else { fail("Use has-text PID phrase.") }
  print(hasStaticText(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "has-name" {
  guard CommandLine.arguments.count == 4 || (CommandLine.arguments.count == 5 && CommandLine.arguments[4] == "exact") else {
    fail("Use has-name PID phrase [exact].")
  }
  print(hasName(CommandLine.arguments[3], exact: CommandLine.arguments.count == 5) ? "true" : "false")
} else if action == "control-value" {
  guard CommandLine.arguments.count == 4 else { fail("Use control-value PID label.") }
  print(controlValue(CommandLine.arguments[3]) ?? "")
} else if action == "names" {
  let data = try! JSONEncoder().encode(namedElements())
  print(String(data: data, encoding: .utf8)!)
} else if action == "focused" {
  guard let focus = focusedElement(), let data = try? JSONEncoder().encode(focus),
    let text = String(data: data, encoding: .utf8) else { fail("Cannot read focused Aux element.") }
  print(text)
} else if action == "shell-url" {
  guard let url = shellUrl() else { fail("Cannot read top Aux shell URL.") }
  print(url)
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
} else if action == "screen-windows" {
  let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
  let rows = windows.compactMap { window -> String? in
    let owner = window[kCGWindowOwnerName as String] as? String ?? ""
    let name = window[kCGWindowName as String] as? String ?? ""
    let layer = window[kCGWindowLayer as String] as? Int ?? 0
    if owner.isEmpty && name.isEmpty { return nil }
    return "\(layer)\t\(owner)\t\(name)"
  }
  print(rows.joined(separator: "\n"))
}

func staticTexts() -> [String] {
  var texts: [String] = []
  var visited = 0
  func visit(_ element: AXUIElement, depth: Int) {
    visited += 1
    if depth > 18 || visited > 4000 || texts.count >= 40 { return }
    var role: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
    if (role as? String) == (kAXStaticTextRole as String) {
      var value: CFTypeRef?
      if AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString, &value) == .success,
        let value = value as? String {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty && trimmed.count <= 200 { texts.append(trimmed) }
      }
    }
    var children: CFTypeRef?
    if AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
      let children = children as? [AXUIElement] {
      for child in children { visit(child, depth: depth + 1) }
    }
  }
  visit(AXUIElementCreateApplication(pid), depth: 0)
  return texts
}

func pressLabel(_ label: String) -> Bool {
  let application = AXUIElementCreateApplication(pid)
  let button = kAXButtonRole as String
  let popup = kAXPopUpButtonRole as String
  let disclosure = "AXDisclosureTriangle"
  func roleOf(_ element: AXUIElement) -> String {
    var roleValue: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
    return roleValue as? String ?? ""
  }
  func named(_ element: AXUIElement) -> Bool {
    for key in [kAXTitleAttribute, kAXDescriptionAttribute, kAXValueAttribute] {
      var value: CFTypeRef?
      if AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success,
        (value as? String) == label { return true }
    }
    return false
  }
  func pressableAncestor(_ element: AXUIElement) -> AXUIElement? {
    let role = roleOf(element)
    if role == button || role == popup || role == disclosure || role == "AXMenuItem" || role == "AXRadioButton" || role == "AXTab" { return element }
    var current = element
    for _ in 0..<6 {
      var parent: CFTypeRef?
      if AXUIElementCopyAttributeValue(current, kAXParentAttribute as CFString, &parent) != .success { return nil }
      guard let parent, CFGetTypeID(parent) == AXUIElementGetTypeID() else { return nil }
      let parentElement = unsafeBitCast(parent, to: AXUIElement.self)
      let parentRole = roleOf(parentElement)
      if parentRole == (kAXMenuBarRole as String) { return nil }
      if parentRole == button || parentRole == popup || parentRole == disclosure || parentRole == "AXMenuItem" || parentRole == "AXRadioButton" || parentRole == "AXTab" { return parentElement }
      current = parentElement
    }
    return nil
  }
  func visit(_ element: AXUIElement, depth: Int, visited: inout Int, shellOnly: Bool) -> AXUIElement? {
    visited += 1
    if depth > 28 || visited > 4000 { return nil }
    let role = roleOf(element)
    if role == (kAXMenuBarRole as String) { return nil }
    if named(element), let target = pressableAncestor(element) { return target }
    if shellOnly && isGuestWebArea(element, role: role) { return nil }
    var childrenValue: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &childrenValue) == .success,
      let children = childrenValue as? [AXUIElement] else { return nil }
    for child in children {
      if let found = visit(child, depth: depth + 1, visited: &visited, shellOnly: shellOnly) { return found }
    }
    return nil
  }
  var shellVisits = 0
  var target = visit(application, depth: 0, visited: &shellVisits, shellOnly: true)
  if target == nil {
    var pageVisits = 0
    target = visit(application, depth: 0, visited: &pageVisits, shellOnly: false)
  }
  guard let target else { return false }
  AXUIElementSetAttributeValue(target, kAXFocusedAttribute as CFString, kCFBooleanTrue)
  return AXUIElementPerformAction(target, kAXPressAction as CFString) == .success
}

if action == "texts" {
  let data = try! JSONEncoder().encode(staticTexts())
  print(String(data: data, encoding: .utf8)!)
} else if action == "focused-value" {
  var focused: CFTypeRef?
  guard AXUIElementCopyAttributeValue(AXUIElementCreateApplication(pid), kAXFocusedUIElementAttribute as CFString, &focused) == .success,
    let element = focused, CFGetTypeID(element) == AXUIElementGetTypeID() else { print(""); exit(0) }
  let target = unsafeBitCast(element, to: AXUIElement.self)
  func attribute(_ key: String) -> String {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(target, key as CFString, &value) == .success else { return "" }
    return value as? String ?? ""
  }
  print([attribute(kAXRoleAttribute), attribute(kAXTitleAttribute), attribute(kAXDescriptionAttribute), attribute(kAXValueAttribute)].joined(separator: "\t"))
} else if action == "press-button" || action == "focus-name" || action == "press-label" || action == "press-checkbox" || action == "click-button" || action == "click-name" || action == "frame-name" || action == "frame" || action == "click-at" || action == "scroll-at" || action == "scroll-name" || action == "child-frames" || action == "hit-name" || action == "has-button" || action == "button-enabled" || action == "has-disabled-button" || action == "buttons" ||
  action == "has-text" || action == "has-name" || action == "control-value" || action == "names" || action == "focused" || action == "shell-url" || action == "window" || action == "screen-windows" {
} else if action == "activate" || action == "toggle-sidebar" ||
  action == "next-tab" || action == "focus-address" || action == "open-settings" || action == "open-palette" || action == "escape" ||
  action == "type-return" || action == "type-text" || action == "select-all" || action == "arrow-right" || action == "arrow-down" || action == "space" || action == "tab" || action == "hid-tab" || action == "hid-return" || action == "hid-down" || action == "move" {
  // AppKit activation no longer takes focus from another app. Accessibility has to
  // mark the launched Aux process frontmost before any key is posted.
  guard app.activate(options: [.activateAllWindows]) else {
    fail("Cannot activate the launched Aux browser window.")
  }
  let application = AXUIElementCreateApplication(pid)
  AXUIElementSetAttributeValue(application, kAXFrontmostAttribute as CFString, kCFBooleanTrue)
  for _ in 0..<30 {
    if NSWorkspace.shared.frontmostApplication?.processIdentifier == pid { break }
    usleep(100_000)
  }
  guard NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else {
    let blocker = NSWorkspace.shared.frontmostApplication?.localizedName ?? "another app"
    fail("Aux is not the frontmost app; refusing to send input elsewhere. \(blocker) stayed frontmost.")
  }
  if action == "hid-tab" || action == "hid-return" || action == "hid-down" {
    let key: CGKeyCode = action == "hid-tab" ? 48 : action == "hid-down" ? 125 : 36
    guard let down = CGEvent(keyboardEventSource: nil, virtualKey: key, keyDown: true),
      let up = CGEvent(keyboardEventSource: nil, virtualKey: key, keyDown: false) else {
      fail("Cannot create a hardware key event.")
    }
    down.post(tap: .cghidEventTap)
    usleep(30_000)
    up.post(tap: .cghidEventTap)
    print("true")
  } else if action == "type-text" {
    guard CommandLine.arguments.count == 4 else { fail("Use type-text PID text.") }
    let text = CommandLine.arguments[3]
    for unit in text.utf16 {
      var scalar = unit
      guard let down = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true),
        let up = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false) else {
        fail("Cannot create a text event.")
      }
      down.keyboardSetUnicodeString(stringLength: 1, unicodeString: &scalar)
      up.keyboardSetUnicodeString(stringLength: 1, unicodeString: &scalar)
      down.postToPid(pid)
      usleep(14_000)
      up.postToPid(pid)
      usleep(14_000)
    }
    print("typed")
  } else if action != "move" && action != "activate" {
    // Aux declares Command-S for the sidebar, Command-L for the address,
    // Command-K for the command palette, Command-A to select the field,
    // and Control-Tab for next tab. Stock Chromium accepts the latter two.
    let key: CGKeyCode = action == "next-tab" || action == "tab" ? 48 : action == "focus-address" ? 37 : action == "open-settings" ? 43 : action == "open-palette" ? 40 : action == "select-all" ? 0 : action == "arrow-right" ? 124 : action == "arrow-down" ? 125 : action == "space" ? 49 : action == "escape" || action == "type-return" ? (action == "type-return" ? 36 : 53) : 1
    let flags: CGEventFlags = action == "next-tab" ? .maskControl : action == "escape" || action == "type-return" || action == "arrow-right" || action == "arrow-down" || action == "space" || action == "tab" ? [] : .maskCommand
    let down = CGEvent(keyboardEventSource: nil, virtualKey: key, keyDown: true)
    let up = CGEvent(keyboardEventSource: nil, virtualKey: key, keyDown: false)
    down?.flags = flags
    up?.flags = flags
    guard let down, let up else { fail("Cannot create the browser shortcut event.") }
    down.postToPid(pid)
    up.postToPid(pid)
  } else if action == "move" {
    guard CommandLine.arguments.count == 5,
      let x = Double(CommandLine.arguments[3]),
      let y = Double(CommandLine.arguments[4]),
      let event = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved,
                          mouseCursorPosition: CGPoint(x: x, y: y), mouseButton: .left) else {
      fail("Use move PID x y.")
    }
    guard CGWarpMouseCursorPosition(CGPoint(x: x, y: y)) == .success else {
      fail("Cannot move the cursor to the requested point.")
    }
    event.post(tap: .cghidEventTap)
  }
} else {
  fail("Unknown action: \(action)")
}
