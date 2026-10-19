import Foundation

@main struct SemanticPolicyFixture {
    static func main() {
        precondition(!semanticApplicationAllowed([["CFBundleURLSchemes": ["HTTPS"]]], bundleId: "test.disposable-browser"))
        precondition(!semanticApplicationAllowed([], bundleId: "com.apple.Safari"))
        precondition(semanticApplicationAllowed([["CFBundleURLSchemes": ["fixture"]]], bundleId: "test.disposable-native"))
        precondition(!semanticRoleAllowed("AXWebArea", subrole: ""))
        precondition(!semanticRoleAllowed("AXTextField", subrole: ""))
        precondition(!semanticRoleAllowed("AXGroup", subrole: "AXSecureTextField"))
        precondition(semanticRoleAllowed("AXStaticText", subrole: ""))
        print("Aux semantic capture policy fixtures passed; no OS content accessed")
    }
}
