import Foundation

// OS APIs cannot prove which browser Profile or mode owns an accessibility tree.
func semanticApplicationAllowed(_ urlTypes: [[String: Any]], bundleId: String) -> Bool {
    let schemes = urlTypes.flatMap { $0["CFBundleURLSchemes"] as? [String] ?? [] }.map { $0.lowercased() }
    let browsers = ["com.apple.Safari", "com.google.Chrome", "org.chromium.Chromium", "org.mozilla.firefox", "com.microsoft.edgemac", "com.brave.Browser", "dev.aux.browser"]
    return !schemes.contains("http") && !schemes.contains("https") && !browsers.contains(bundleId)
}
func semanticRoleAllowed(_ role: String, subrole: String) -> Bool {
    return role != "AXWebArea" && role != "AXTextField" && role != "AXTextArea" && role != "AXSecureTextField" && role != "AXComboBox" && role != "AXSearchField" && subrole != "AXSecureTextField"
}
