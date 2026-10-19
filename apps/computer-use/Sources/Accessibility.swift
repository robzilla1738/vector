import Foundation
import AppKit
import ApplicationServices

private func attribute(_ element: AXUIElement, _ name: String) -> CFTypeRef? {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success else { return nil }
    return value
}
func frontmostApplication() throws -> [String: Any] {
    guard let app = NSWorkspace.shared.frontmostApplication else { throw HelperError("NOT_FOUND", "No foreground application is available") }
    return ["pid": app.processIdentifier, "bundleId": app.bundleIdentifier ?? "", "name": app.localizedName ?? ""]
}
func accessibilitySnapshot(_ params: [String: Any]) throws -> [String: Any] {
    try requireAccessibility()
    let rawPid = try requiredNumber(params, "pid", range: 1...Double(Int32.max))
    guard rawPid.rounded() == rawPid else { throw HelperError("BAD_REQUEST", "Application PID must be an integer") }
    let pid = pid_t(rawPid)
    guard let app = NSWorkspace.shared.frontmostApplication, app.processIdentifier == pid else { throw HelperError("CONFLICT", "Foreground application changed; recheck exclusions and target identity") }
    let application = AXUIElementCreateApplication(pid)
    AXUIElementSetMessagingTimeout(application, 0.2)
    guard let value = attribute(application, kAXFocusedWindowAttribute), CFGetTypeID(value) == AXUIElementGetTypeID() else { throw HelperError("NOT_FOUND", "The foreground app exposes no focused accessible window") }
    let window = unsafeBitCast(value, to: AXUIElement.self)
    let title = attribute(window, kAXTitleAttribute) as? String ?? ""
    var nodes: [[String: Any]] = [], text: [String] = [], visited: [AXUIElement] = [], truncated = false
    let startedAt = Date(), snapshotId = UUID().uuidString
    func walk(_ element: AXUIElement, _ depth: Int) {
        guard nodes.count < 1000, depth < 20, Date().timeIntervalSince(startedAt) < 3 else { truncated = true; return }
        if visited.contains(where: { CFEqual($0, element) }) { return }
        visited.append(element)
        AXUIElementSetMessagingTimeout(element, 0.2)
        let role = attribute(element, kAXRoleAttribute) as? String ?? "", subrole = attribute(element, kAXSubroleAttribute) as? String ?? ""
        let secure = subrole == "AXSecureTextField" || role == "AXTextField" || role == "AXTextArea"
        let name = secure ? "[editable field omitted]" : (attribute(element, kAXTitleAttribute) as? String ?? "")
        let content = !secure && ["AXStaticText", "AXHeading", "AXCell"].contains(role) ? (attribute(element, kAXValueAttribute) as? String ?? "") : ""
        if !name.isEmpty || !content.isEmpty { nodes.append(["id": "ax\(nodes.count + 1)", "role": role, "name": String(name.prefix(2000)), "text": String(content.prefix(10000))]); if !content.isEmpty { text.append(content) } else if !name.isEmpty { text.append(name) } }
        if let children = attribute(element, kAXChildrenAttribute) as? [AXUIElement] { for child in children { walk(child, depth + 1); if truncated { break } } }
    }
    walk(window, 0)
    guard NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else { throw HelperError("CONFLICT", "Foreground application changed during capture; snapshot was discarded") }
    return ["snapshotId": snapshotId, "pid": pid, "bundleId": app.bundleIdentifier ?? "", "appName": app.localizedName ?? "", "windowTitle": title, "text": String(text.joined(separator: "\n").prefix(100000)), "nodes": nodes, "truncated": truncated, "editableValuesOmitted": true]
}
