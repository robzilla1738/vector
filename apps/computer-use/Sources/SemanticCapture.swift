import Foundation
import AppKit
import ApplicationServices

private struct SemanticWindow {
    let token: String
    let application: NSRunningApplication
    let window: AXUIElement
    let preparedAt: Date
}
private var semanticWindow: SemanticWindow?
private func semanticAttribute(_ element: AXUIElement, _ name: String) -> CFTypeRef? {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success else { return nil }
    return value
}
private func semanticFocusedWindow(_ app: NSRunningApplication) throws -> AXUIElement {
    let element = AXUIElementCreateApplication(app.processIdentifier)
    AXUIElementSetMessagingTimeout(element, 0.1)
    guard let value = semanticAttribute(element, kAXFocusedWindowAttribute), CFGetTypeID(value) == AXUIElementGetTypeID() else { throw HelperError("NOT_FOUND", "Foreground application has no accessible focused window") }
    return unsafeBitCast(value, to: AXUIElement.self)
}
private func semanticIdentityMatches(_ target: SemanticWindow) -> Bool {
    guard AXIsProcessTrusted(), !target.application.isTerminated,
          let current = NSWorkspace.shared.frontmostApplication,
          current.processIdentifier == target.application.processIdentifier,
          current.launchDate == target.application.launchDate,
          current.bundleIdentifier == target.application.bundleIdentifier,
          let window = try? semanticFocusedWindow(current) else { return false }
    return CFEqual(window, target.window)
}
func semanticPrepare() throws -> [String: Any] {
    semanticWindow = nil
    try requireAccessibility()
    guard let app = NSWorkspace.shared.frontmostApplication,
          let bundleId = app.bundleIdentifier, let bundleURL = app.bundleURL,
          let bundle = Bundle(url: bundleURL) else { return ["state": "skipped", "reason": "unidentified-application"] }
    let types = bundle.object(forInfoDictionaryKey: "CFBundleURLTypes") as? [[String: Any]] ?? []
    guard semanticApplicationAllowed(types, bundleId: bundleId) else { return ["state": "skipped", "reason": "browser-content-requires-native-profile-proof"] }
    let window = try semanticFocusedWindow(app)
    let target = SemanticWindow(token: UUID().uuidString, application: app, window: window, preparedAt: Date())
    guard semanticIdentityMatches(target) else { throw HelperError("CONFLICT", "Focused application changed before capture") }
    semanticWindow = target
    return ["state": "ready", "candidate": ["id": target.token, "pid": app.processIdentifier, "bundleId": bundleId, "appName": app.localizedName ?? ""]]
}
func semanticCapture(_ params: [String: Any]) throws -> [String: Any] {
    try requireAccessibility()
    let token = try requiredString(params, "id", limit: 128)
    guard let target = semanticWindow, target.token == token else { throw HelperError("CONFLICT", "Semantic capture token is stale") }
    semanticWindow = nil
    guard Date().timeIntervalSince(target.preparedAt) < 10, semanticIdentityMatches(target) else { throw HelperError("CONFLICT", "Focused application or window changed before capture") }
    let started = Date()
    var elements: [AXUIElement] = []
    var unsafeTree = false
    func inspect(_ element: AXUIElement, _ depth: Int) {
        guard !unsafeTree else { return }
        if elements.contains(where: { CFEqual($0, element) }) { return }
        guard elements.count < 1000, depth < 20, Date().timeIntervalSince(started) < 2 else { unsafeTree = true; return }
        AXUIElementSetMessagingTimeout(element, 0.1)
        let role = semanticAttribute(element, kAXRoleAttribute) as? String ?? ""
        // Inspect roles/children only until the complete window passes the web gate.
        if role == "AXWebArea" { unsafeTree = true; return }
        let subrole = semanticAttribute(element, kAXSubroleAttribute) as? String ?? ""
        guard !role.isEmpty else { unsafeTree = true; return }
        // Omit entire editable subtrees, including static-text descendants.
        guard semanticRoleAllowed(role, subrole: subrole) else { return }
        var editable = DarwinBoolean(false)
        if AXUIElementIsAttributeSettable(element, kAXValueAttribute as CFString, &editable) == .success && editable.boolValue { return }
        elements.append(element)
        if let children = semanticAttribute(element, kAXChildrenAttribute) as? [AXUIElement] { for child in children { inspect(child, depth + 1) } }
    }
    inspect(target.window, 0)
    guard !unsafeTree else { return ["state": "skipped", "reason": "web-or-unbounded-accessibility-tree"] }
    var text: [String] = []
    for element in elements {
        guard Date().timeIntervalSince(started) < 3 else { throw HelperError("TIMEOUT", "Semantic capture exceeded its bounded window") }
        let role = semanticAttribute(element, kAXRoleAttribute) as? String ?? ""
        let subrole = semanticAttribute(element, kAXSubroleAttribute) as? String ?? ""
        if role == "AXWebArea" { return ["state": "skipped", "reason": "accessibility-tree-became-web-content"] }
        guard semanticRoleAllowed(role, subrole: subrole) else { continue }
        var editable = DarwinBoolean(false)
        if AXUIElementIsAttributeSettable(element, kAXValueAttribute as CFString, &editable) == .success && editable.boolValue { continue }
        if ["AXStaticText", "AXHeading", "AXCell"].contains(role), let value = semanticAttribute(element, kAXValueAttribute) as? String { text.append(String(value.prefix(10000))) }
        if text.joined(separator: "\n").utf8.count >= 100000 { break }
    }
    guard semanticIdentityMatches(target) else { throw HelperError("CONFLICT", "Focused application or window changed during capture; content discarded") }
    let title = semanticAttribute(target.window, kAXTitleAttribute) as? String ?? ""
    guard semanticIdentityMatches(target) else { throw HelperError("CONFLICT", "Focused window changed during title read; content discarded") }
    return ["state": "captured", "candidateId": token, "pid": target.application.processIdentifier, "bundleId": target.application.bundleIdentifier ?? "", "appName": target.application.localizedName ?? "", "windowTitle": String(title.prefix(2000)), "content": String(text.joined(separator: "\n").prefix(100000)), "occurredAt": Date().timeIntervalSince1970 * 1000, "editableValuesOmitted": true, "browserContentOmitted": true]
}
