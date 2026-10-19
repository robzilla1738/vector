import AppKit
import AuthenticationServices
import Foundation

final class ImportApplicationDelegate: NSObject, NSApplicationDelegate {
    func application(_ application: NSApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([NSUserActivityRestoring]) -> Void) -> Bool {
        guard #available(macOS 26.0, *), userActivity.activityType == ASCredentialExchangeActivity,
              let token = userActivity.userInfo?[ASCredentialImportToken] as? UUID else { return false }
        let accepted = credentialExchange.receive(token)
        if !accepted {
            let alert = NSAlert()
            alert.messageText = "Choose an Aux import destination first"
            alert.informativeText = "Open Aux Vault and start a native import before selecting Aux as the receiving app."
            alert.addButton(withTitle: "OK")
            alert.runModal()
        }
        return accepted
    }
}
let application = NSApplication.shared
let applicationDelegate = ImportApplicationDelegate()
application.delegate = applicationDelegate
application.setActivationPolicy(.accessory)
if ProcessInfo.processInfo.environment["AUX_HELPER_AUTH_TOKEN"]?.isEmpty == false {
    DispatchQueue.global(qos: .userInitiated).async {
        HelperProtocol().run()
        DispatchQueue.main.async { NSApplication.shared.terminate(nil) }
    }
} else {
    // An OS-launched unarmed instance must not consume credentials for an unknown destination.
    DispatchQueue.main.asyncAfter(deadline: .now() + 30) { application.terminate(nil) }
}
application.run()
