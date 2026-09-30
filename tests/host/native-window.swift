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

func pressButton(_ label: String) -> Bool {
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
      AXUIElementSetAttributeValue(element, kAXFocusedAttribute as CFString, kCFBooleanTrue)
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

if action == "press-button" {
  guard CommandLine.arguments.count == 4 else { fail("Use press-button PID label.") }
  print(pressButton(CommandLine.arguments[3]) ? "true" : "false")
} else if action == "press-label" {
  guard CommandLine.arguments.count == 4 else { fail("Use press-label PID label.") }
  print(pressLabel(CommandLine.arguments[3]) ? "true" : "false")
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
} else if action == "child-frames" {
  guard CommandLine.arguments.count == 4 else { fail("Use child-frames PID phrase.") }
  guard let frames = childFrames(CommandLine.arguments[3]),
    let data = try? JSONEncoder().encode(frames),
    let text = String(data: data, encoding: .utf8) else { fail("Cannot list that control.") }
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
} else if action == "press-button" || action == "press-label" || action == "click-button" || action == "click-name" || action == "frame-name" || action == "frame" || action == "click-at" || action == "child-frames" || action == "has-button" || action == "button-enabled" || action == "has-disabled-button" || action == "buttons" ||
  action == "has-text" || action == "has-name" || action == "control-value" || action == "names" || action == "focused" || action == "shell-url" || action == "window" {
} else if action == "activate" || action == "toggle-sidebar" ||
  action == "next-tab" || action == "focus-address" || action == "open-settings" || action == "open-palette" || action == "escape" ||
  action == "type-return" || action == "type-text" || action == "select-all" || action == "arrow-right" || action == "space" || action == "move" {
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
  if action == "type-text" {
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
    let key: CGKeyCode = action == "next-tab" ? 48 : action == "focus-address" ? 37 : action == "open-settings" ? 43 : action == "open-palette" ? 40 : action == "select-all" ? 0 : action == "arrow-right" ? 124 : action == "space" ? 49 : action == "escape" || action == "type-return" ? (action == "type-return" ? 36 : 53) : 1
    let flags: CGEventFlags = action == "next-tab" ? .maskControl : action == "escape" || action == "type-return" || action == "arrow-right" || action == "space" ? [] : .maskCommand
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
