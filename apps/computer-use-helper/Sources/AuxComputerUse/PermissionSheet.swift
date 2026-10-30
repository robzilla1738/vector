import AppKit

/// "Enable Context Awareness" (spec 8.3): one row per permission with an Allow button. Polls once a
/// second; health reports `permissionSheetVisible`. Only Accessibility and Screen Recording are listed.
final class PermissionSheet: NSObject, NSWindowDelegate {
    var onVisibilityChange: (() -> Void)?
    private var window: NSWindow?
    private var rows: [Permission: PermissionRow] = [:]
    private var poll: Timer?
    private let guide = SettingsGuide()

    var isVisible: Bool { window?.isVisible ?? false }

    /// Shows the sheet unless every permission the policy needs is already granted.
    func show(screenTextWanted: Bool) {
        let needed: [Permission] = screenTextWanted ? [.accessibility, .screenRecording] : [.accessibility]
        guard needed.contains(where: { !$0.granted }) || isVisible else { return }
        let window = self.window ?? build()
        refresh()
        NSApp.activate()
        window.center()
        window.makeKeyAndOrderFront(nil)
        poll?.invalidate()
        poll = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in self?.refresh() }
        onVisibilityChange?()
    }

    private func build() -> NSWindow {
        let window = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 460, height: 260),
                             styleMask: [.titled, .closable, .fullSizeContentView], backing: .buffered, defer: false)
        window.title = "Enable Context Awareness"
        window.titlebarAppearsTransparent = true
        window.isReleasedWhenClosed = false
        window.delegate = self

        let icon = NSImageView(image: NSApp.applicationIconImage)
        icon.translatesAutoresizingMaskIntoConstraints = false
        icon.widthAnchor.constraint(equalToConstant: 56).isActive = true
        icon.heightAnchor.constraint(equalToConstant: 56).isActive = true
        let heading = NSTextField(labelWithString: "Enable Context Awareness")
        heading.font = .systemFont(ofSize: 17, weight: .semibold)
        let detail = NSTextField(wrappingLabelWithString:
            "Aux needs macOS permissions to read on-screen app content. It never records your keystrokes.")
        detail.textColor = .secondaryLabelColor

        let stack = NSStackView(views: [icon, heading, detail])
        stack.orientation = .vertical
        stack.alignment = .centerX
        stack.spacing = 8
        for permission in Permission.allCases {
            let row = PermissionRow(permission) { [weak self] in self?.allow(permission) }
            rows[permission] = row
            stack.addArrangedSubview(row)
            row.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
        }
        let done = NSButton(title: "Done", target: self, action: #selector(close))
        done.keyEquivalent = "\u{1b}"
        stack.addArrangedSubview(done)
        stack.setCustomSpacing(16, after: detail)
        stack.setCustomSpacing(16, after: rows[.screenRecording]!)
        stack.edgeInsets = NSEdgeInsets(top: 28, left: 24, bottom: 20, right: 24)
        stack.translatesAutoresizingMaskIntoConstraints = false
        window.contentView = stack
        detail.preferredMaxLayoutWidth = 412
        self.window = window
        return window
    }

    private func allow(_ permission: Permission) {
        permission.request()
        NSWorkspace.shared.open(permission.settingsURL)
        guide.show(for: permission)
    }

    private func refresh() {
        for (permission, row) in rows { row.granted = permission.granted }
        if let shown = guide.permission, shown.granted { guide.close() }
    }

    @objc private func close() { window?.close() }

    func windowWillClose(_ notification: Notification) {
        poll?.invalidate()
        poll = nil
        guide.close()
        DispatchQueue.main.async { self.onVisibilityChange?() }
    }
}

/// Icon, title, detail and an Allow button that turns into "Allowed".
private final class PermissionRow: NSStackView {
    private let button: NSButton
    private let action: () -> Void

    var granted = false {
        didSet {
            button.title = granted ? "Allowed" : "Allow"
            button.isEnabled = !granted
            button.image = granted ? NSImage(systemSymbolName: "checkmark.circle.fill", accessibilityDescription: "Allowed") : nil
        }
    }

    init(_ permission: Permission, action: @escaping () -> Void) {
        self.action = action
        button = NSButton(title: "Allow", target: nil, action: nil)
        super.init(frame: .zero)
        button.target = self
        button.action = #selector(pressed)
        button.imagePosition = .imageLeading
        let symbol = NSImageView(image: NSImage(systemSymbolName: permission.symbol, accessibilityDescription: nil) ?? NSImage())
        symbol.symbolConfiguration = .init(pointSize: 18, weight: .regular)
        symbol.contentTintColor = .controlAccentColor
        symbol.widthAnchor.constraint(equalToConstant: 28).isActive = true
        let title = NSTextField(labelWithString: permission.title)
        title.font = .systemFont(ofSize: 13, weight: .medium)
        let detail = NSTextField(labelWithString: permission.detail)
        detail.font = .systemFont(ofSize: 12)
        detail.textColor = .secondaryLabelColor
        let text = NSStackView(views: [title, detail])
        text.orientation = .vertical
        text.alignment = .leading
        text.spacing = 2
        let spacer = NSView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        setViews([symbol, text, spacer, button], in: .leading)
        orientation = .horizontal
        spacing = 10
        edgeInsets = NSEdgeInsets(top: 8, left: 12, bottom: 8, right: 12)
        wantsLayer = true
        layer?.cornerRadius = 8
        layer?.backgroundColor = NSColor.quaternaryLabelColor.withAlphaComponent(0.08).cgColor
    }

    required init?(coder: NSCoder) { nil }

    @objc private func pressed() { action() }
}

/// Floats a small panel beside System Settings showing the helper's icon, which the user drags into
/// the permission list and turns on (spec 8.3, settings guide dock).
final class SettingsGuide: NSObject {
    private(set) var permission: Permission?
    private var panel: NSPanel?
    private var label: NSTextField?

    func show(for permission: Permission) {
        self.permission = permission
        let panel = self.panel ?? build()
        label?.stringValue = "Open Privacy & Security, then add Aux Computer Use to the \(permission.title) list, then turn on Aux Computer Use."
        position(panel)
        panel.orderFrontRegardless()
        // System Settings takes a moment to open its window; place the panel beside it once it has.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
            guard let self, let panel = self.panel, panel.isVisible else { return }
            self.position(panel)
        }
    }

    func close() {
        panel?.orderOut(nil)
        permission = nil
    }

    private func build() -> NSPanel {
        let panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 300, height: 120),
                            styleMask: [.titled, .closable, .nonactivatingPanel, .utilityWindow, .hudWindow],
                            backing: .buffered, defer: false)
        panel.title = "Aux Computer Use"
        panel.level = .floating
        panel.isReleasedWhenClosed = false
        panel.hidesOnDeactivate = false
        let app = DraggableApplicationView()
        app.translatesAutoresizingMaskIntoConstraints = false
        app.widthAnchor.constraint(equalToConstant: 64).isActive = true
        app.heightAnchor.constraint(equalToConstant: 64).isActive = true
        let label = NSTextField(wrappingLabelWithString: "")
        label.preferredMaxLayoutWidth = 196
        label.font = .systemFont(ofSize: 12)
        let stack = NSStackView(views: [app, label])
        stack.spacing = 12
        stack.edgeInsets = NSEdgeInsets(top: 12, left: 12, bottom: 12, right: 12)
        panel.contentView = stack
        self.panel = panel
        self.label = label
        return panel
    }

    /// Beside the System Settings window when it can be found, otherwise near the top right.
    private func position(_ panel: NSPanel) {
        guard let screen = NSScreen.screens.first else { return }
        let size = panel.frame.size
        if let settings = settingsFrame() {
            // Window list bounds are top-left based on the primary screen; AppKit frames are bottom-left.
            let bottom = screen.frame.maxY - settings.maxY
            let left = settings.minX - size.width - 12
            let x = left >= screen.visibleFrame.minX ? left : settings.maxX + 12
            panel.setFrameOrigin(NSPoint(x: x, y: bottom))
        } else {
            let visible = screen.visibleFrame
            panel.setFrameOrigin(NSPoint(x: visible.maxX - size.width - 24, y: visible.maxY - size.height - 24))
        }
    }

    private func settingsFrame() -> CGRect? {
        guard let pid = NSRunningApplication.runningApplications(withBundleIdentifier: "com.apple.systempreferences").first?.processIdentifier,
              let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [JSON] else { return nil }
        for window in windows where (window[kCGWindowOwnerPID as String] as? Int32) == pid && (window[kCGWindowLayer as String] as? Int) == 0 {
            if let bounds = window[kCGWindowBounds as String] as? NSDictionary, let rect = CGRect(dictionaryRepresentation: bounds) { return rect }
        }
        return nil
    }
}

/// The helper's app icon as a drag source carrying the app bundle's file URL.
private final class DraggableApplicationView: NSView, NSDraggingSource {
    private let image = NSWorkspace.shared.icon(forFile: Bundle.main.bundlePath)

    override func draw(_ dirtyRect: NSRect) { image.draw(in: bounds) }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    override func mouseDown(with event: NSEvent) {
        let item = NSDraggingItem(pasteboardWriter: Bundle.main.bundleURL as NSURL)
        item.setDraggingFrame(bounds, contents: image)
        beginDraggingSession(with: [item], event: event, source: self)
    }

    func draggingSession(_ session: NSDraggingSession, sourceOperationMaskFor context: NSDraggingContext) -> NSDragOperation { .copy }
}
