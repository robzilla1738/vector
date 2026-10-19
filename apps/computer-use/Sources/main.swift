import Foundation
import AppKit

final class AuxMenuDelegate: NSObject, NSApplicationDelegate {
    private var item: NSStatusItem?
    func applicationDidFinishLaunching(_ notification: Notification) {
        item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        item?.button?.title = "Aux"
        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "Aux local helper", action: nil, keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Privacy settings…", action: #selector(openSettings), keyEquivalent: ""))
        menu.addItem(.separator())
        menu.addItem(NSMenuItem(title: "Quit helper", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        for menuItem in menu.items where menuItem.action == #selector(openSettings) { menuItem.target = self }
        item?.menu = menu
    }
    @objc private func openSettings() { if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security") { NSWorkspace.shared.open(url) } }
}
let application = NSApplication.shared
application.setActivationPolicy(.accessory)
installNotificationDelegate()
let delegate = AuxMenuDelegate()
if CommandLine.arguments.contains("--menu-bar") {
    application.delegate = delegate
} else {
    DispatchQueue.global(qos: .userInitiated).async {
        HelperProtocol().run()
        DispatchQueue.main.async { NSApplication.shared.terminate(nil) }
    }
}
application.run()
