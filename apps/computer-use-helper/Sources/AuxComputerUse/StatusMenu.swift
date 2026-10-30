import AppKit

/// The menu-bar item "Aux Context Awareness" (spec 8.3). Every item reports a `menu-action`; the daemon
/// owns the state and answers with `pause`, `resume`, `policy` and `menu`. The item appears the first
/// time the daemon resumes the observer, so a helper kept alive only for `invoke` shows nothing.
final class StatusMenu: NSObject, NSMenuDelegate {
    private let observer: Observer
    private let sheet: PermissionSheet
    private var item: NSStatusItem?
    var recentApplications: [JSON] = []

    init(observer: Observer, sheet: PermissionSheet) {
        self.observer = observer
        self.sheet = sheet
    }

    func update() {
        guard observer.everResumed else { return }
        if item == nil {
            let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
            let image = Bundle.main.image(forResource: "MenuBarIcon") ?? NSImage(systemSymbolName: "eye", accessibilityDescription: nil)
            image?.isTemplate = true
            item.button?.image = image
            item.button?.toolTip = "Aux Context Awareness"
            item.button?.setAccessibilityLabel("Aux Context Awareness")
            let menu = NSMenu(title: "Aux Context Awareness")
            menu.delegate = self
            item.menu = menu
            self.item = item
        }
        item?.button?.appearsDisabled = !observer.active
    }

    func menuNeedsUpdate(_ menu: NSMenu) {
        menu.removeAllItems()
        let title = NSMenuItem(title: observer.active ? "Context Awareness is on" : "Context Awareness is paused", action: nil, keyEquivalent: "")
        title.isEnabled = false
        menu.addItem(title)
        menu.addItem(.separator())
        if observer.active {
            menu.addItem(submenu("Pause Context Awareness", [
                entry("For 30 Minutes", ["action": "pause", "duration": "thirty_minutes"]),
                entry("For 1 Hour", ["action": "pause", "duration": "one_hour"]),
                entry("Until Tomorrow", ["action": "pause", "duration": "until_tomorrow"]),
            ]))
        } else {
            menu.addItem(entry("Resume Context Awareness", ["action": "resume"]))
        }
        menu.addItem(submenu("Clear History", [
            entry("Last 10 Minutes", ["action": "clear", "scope": "last_ten_minutes"], confirm: "the last 10 minutes"),
            entry("Last Hour", ["action": "clear", "scope": "last_hour"], confirm: "the last hour"),
            entry("Last Day", ["action": "clear", "scope": "last_day"], confirm: "the last day"),
            entry("All History", ["action": "clear", "scope": "all"], confirm: "all history"),
        ]))
        let last = entry("Clear Last App Session", observer.lastSessionBundleId.map { ["action": "clear-app-session", "bundleId": $0] })
        menu.addItem(last)
        menu.addItem(submenu("Recent Applications", recentItems()))
        menu.addItem(.separator())
        menu.addItem(entry("Settings…", ["action": "show-settings"]))
        let allow = NSMenuItem(title: "Allow Permissions…", action: #selector(showPermissions), keyEquivalent: "")
        allow.target = self
        menu.addItem(allow)
        menu.addItem(.separator())
        menu.addItem(entry("Quit Aux Computer Use", ["action": "shutdown"]))
    }

    private func recentItems() -> [NSMenuItem] {
        let apps = recentApplications.compactMap { app -> NSMenuItem? in
            guard let name = app["name"] as? String, let bundleId = app["bundleId"] as? String else { return nil }
            let excluded = app["isExcluded"] as? Bool ?? false
            var items = [entry(excluded ? "Include \(name)" : "Exclude \(name)",
                               ["action": excluded ? "include-application" : "exclude-application", "bundleId": bundleId])]
            let domains = (app["domains"] as? [JSON] ?? []).compactMap { domain -> NSMenuItem? in
                guard let host = domain["domain"] as? String else { return nil }
                let off = domain["isExcluded"] as? Bool ?? false
                return entry(off ? "Include \(host)" : "Exclude \(host)",
                             ["action": off ? "include-domain" : "exclude-domain", "domain": host])
            }
            if !domains.isEmpty { items += [.separator()] + domains }
            let item = submenu(name, items)
            item.state = excluded ? .off : .on
            return item
        }
        if !apps.isEmpty { return apps }
        let none = NSMenuItem(title: "No Recent Applications", action: nil, keyEquivalent: "")
        none.isEnabled = false
        return [none]
    }

    private func submenu(_ title: String, _ items: [NSMenuItem]) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: nil, keyEquivalent: "")
        let menu = NSMenu(title: title)
        items.forEach(menu.addItem)
        item.submenu = menu
        return item
    }

    /// A menu item that sends `action`, after a confirmation alert when `confirm` names what is cleared.
    private func entry(_ title: String, _ action: JSON?, confirm: String? = nil) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: action == nil ? nil : #selector(send(_:)), keyEquivalent: "")
        item.target = self
        item.representedObject = action.map { [$0, confirm as Any] as [Any] }
        item.isEnabled = action != nil
        return item
    }

    @objc private func send(_ sender: NSMenuItem) {
        guard let parts = sender.representedObject as? [Any], let action = parts.first as? JSON else { return }
        if let scope = parts.last as? String {
            NSApp.activate()
            let alert = NSAlert()
            alert.messageText = "Clear \(scope)?"
            alert.informativeText = "Aux deletes the Context Awareness history it recorded for that time. This can't be undone."
            alert.addButton(withTitle: "Clear")
            alert.addButton(withTitle: "Cancel")
            guard alert.runModal() == .alertFirstButtonReturn else { return }
        }
        Output.send("menu-action", action)
    }

    @objc private func showPermissions() {
        sheet.show(screenTextWanted: observer.policy.screenText)
    }
}
