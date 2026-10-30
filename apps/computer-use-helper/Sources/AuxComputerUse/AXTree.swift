import ApplicationServices
import Foundation

/// Accessibility reads: element descriptors, the indented outline (`ax.text`) and its diff.
enum AX {
    static let skippedRoles: Set<String> = ["AXScrollBar", "AXSplitter", "AXGrowArea"]
    static let skippedSubroles: Set<String> = ["AXCloseButton", "AXMinimizeButton", "AXZoomButton", "AXFullScreenButton"]
    static let maxDepth = 48, maxNodes = 4000, maxBytes = 96 * 1024, maxValue = 2000
    /// The walk runs on the main thread; a slow or hung app ends it early.
    static let maxWalk: TimeInterval = 1.5

    static func attribute<T>(_ element: AXUIElement, _ name: String) -> T? {
        var value: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success else { return nil }
        return value as? T
    }

    static func string(_ element: AXUIElement, _ name: String) -> String? {
        guard let value: CFTypeRef = attribute(element, name) else { return nil }
        if let text = value as? String { return text.isEmpty ? nil : text }
        if let url = value as? URL { return url.absoluteString }
        if let number = value as? NSNumber { return number.stringValue }
        return nil
    }

    static func isSecure(_ element: AXUIElement) -> Bool {
        string(element, kAXSubroleAttribute) == "AXSecureTextField" || string(element, kAXRoleAttribute) == "AXSecureTextField"
    }

    /// `{targetId?, role?, subrole?, title?, description?, value?, placeholder?, identifier?}`; values of
    /// secure or sensitive fields are left out.
    static func target(_ element: AXUIElement) -> JSON {
        var target: JSON = [:]
        target["role"] = string(element, kAXRoleAttribute)
        target["subrole"] = string(element, kAXSubroleAttribute)
        target["title"] = string(element, kAXTitleAttribute)
        target["description"] = string(element, kAXDescriptionAttribute)
        target["placeholder"] = string(element, kAXPlaceholderValueAttribute)
        target["identifier"] = string(element, kAXIdentifierAttribute)
        if !isSensitive(element) { target["value"] = string(element, kAXValueAttribute).map { String($0.prefix(maxValue)) } }
        return target
    }

    static func isSensitive(_ element: AXUIElement) -> Bool {
        isSecure(element) || CapturePolicy.isSensitive([string(element, kAXTitleAttribute), string(element, kAXDescriptionAttribute),
                                                       string(element, kAXPlaceholderValueAttribute), string(element, kAXIdentifierAttribute)])
    }

    static func element(at point: CGPoint) -> AXUIElement? {
        var element: AXUIElement?
        let system = AXUIElementCreateSystemWide()
        AXUIElementSetMessagingTimeout(system, 0.25)
        return AXUIElementCopyElementAtPosition(system, Float(point.x), Float(point.y), &element) == .success ? element : nil
    }

    static func focusedElement() -> AXUIElement? {
        attribute(AXUIElementCreateSystemWide(), kAXFocusedUIElementAttribute)
    }

    static func pid(_ element: AXUIElement) -> pid_t {
        var pid: pid_t = 0
        AXUIElementGetPid(element, &pid)
        return pid
    }

    struct Tree {
        var text = ""
        var bytes = 0
        var nodes = 0
        var url: String?
        var hasText = false
        var truncated: String?
    }

    /// Depth-first outline of a window: `AXRole subrole="…" title="…" …`, static text as bare lines.
    static func tree(of window: AXUIElement) -> Tree {
        var tree = Tree()
        var lines: [String] = []
        let deadline = Date().addingTimeInterval(maxWalk)
        func visit(_ element: AXUIElement, _ depth: Int) {
            guard tree.truncated == nil else { return }
            if Date() > deadline { tree.truncated = "time"; return }
            if depth > maxDepth { tree.truncated = "depth"; return }
            if tree.nodes >= maxNodes { tree.truncated = "nodes"; return }
            if tree.bytes >= maxBytes { tree.truncated = "bytes"; return }
            tree.nodes += 1
            let role = string(element, kAXRoleAttribute) ?? "AXUnknown"
            let subrole = string(element, kAXSubroleAttribute)
            if skippedRoles.contains(role) || subrole.map(skippedSubroles.contains) == true { return }
            if role == "AXWebArea", tree.url == nil { tree.url = string(element, kAXURLAttribute) }
            let line = describe(element, role: role, subrole: subrole)
            if let line {
                if role == "AXStaticText" || line.contains(" value=\"") { tree.hasText = true }
                let indented = String(repeating: "  ", count: depth) + line
                lines.append(indented)
                tree.bytes += indented.utf8.count + 1
            }
            let children: [AXUIElement] = attribute(element, kAXChildrenAttribute) ?? []
            for child in children { visit(child, line == nil ? depth : depth + 1) }
        }
        visit(window, 0)
        if let reason = tree.truncated { lines.append("… AX tree truncated (\(reason))") }
        tree.text = lines.joined(separator: "\n")
        return tree
    }

    private static func describe(_ element: AXUIElement, role: String, subrole: String?) -> String? {
        let sensitive = isSensitive(element)
        let value = sensitive ? nil : string(element, kAXValueAttribute).map { String($0.prefix(maxValue)) }
        if role == "AXStaticText" { return value.map(oneLine) }
        let fields: [(String, String?)] = [
            ("subrole", subrole), ("title", string(element, kAXTitleAttribute)),
            ("description", string(element, kAXDescriptionAttribute)), ("value", value),
            ("placeholder", string(element, kAXPlaceholderValueAttribute)), ("identifier", string(element, kAXIdentifierAttribute)),
        ]
        let parts = fields.compactMap { key, text in text.map { "\(key)=\"\(escape($0))\"" } }
        // Bare structural groups add only noise.
        if parts.isEmpty, ["AXGroup", "AXUnknown", "AXLayoutArea", "AXLayoutItem"].contains(role) { return nil }
        return ([role] + parts).joined(separator: " ")
    }

    private static func oneLine(_ text: String) -> String { text.replacingOccurrences(of: "\n", with: " ") }
    private static func escape(_ text: String) -> String {
        oneLine(text).replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"")
    }

    /// Line diff against the previous outline: removed lines as `- …`, added lines as `+ …`, in order.
    static func diff(from previous: String, to current: String) -> String {
        var old: [Substring: Int] = [:]
        previous.split(separator: "\n").forEach { old[$0, default: 0] += 1 }
        var added: [String] = []
        for line in current.split(separator: "\n") {
            if let count = old[line], count > 0 { old[line] = count - 1 } else { added.append("+ " + line) }
        }
        let removed = previous.split(separator: "\n").filter { line in
            guard let count = old[line], count > 0 else { return false }
            old[line] = count - 1
            return true
        }.map { "- " + $0 }
        return (removed + added).joined(separator: "\n")
    }
}
