import AppKit
import ApplicationServices
import CoreGraphics

/// Context Awareness observer (spec 6). Accessibility observation only: it follows the frontmost app,
/// its focused window and focused element, reads the window's AX outline, and OCRs windows that have
/// no AX text. It reads no keyboard or pointer input: no event tap, no key contents, no keystroke
/// timing, so it never emits `keyboard.*`, `mouse.*` or `browser-signal` lines.
///
/// It records nothing until the daemon has sent a policy and resumed it (spec G7). Main thread only.
final class Observer {
    struct App: Equatable {
        let pid: pid_t
        let bundleId: String
        let name: String

        init?(_ app: NSRunningApplication?) {
            guard let app, let bundleId = app.bundleIdentifier else { return nil }
            pid = app.processIdentifier
            self.bundleId = bundleId
            name = app.localizedName ?? bundleId
        }
    }

    /// The window last captured, kept so selections can be attributed and filtered the same way.
    private struct Window {
        let title: String
        let url: String?
        let domain: String?
    }

    static let idleAfter: TimeInterval = 300
    static let maxSelection = 2000
    static let maxTrees = 32

    private(set) var policy = CapturePolicy()
    private(set) var policyReceived = false
    private(set) var paused = true
    private(set) var everResumed = false
    private(set) var idle = false
    private(set) var systemSessionActive = true
    private(set) var observerRegistrationFailures = 0
    private(set) var captureDiagnostics: JSON?
    /// For "Clear Last App Session"; kept after the session ends.
    private(set) var lastSessionBundleId: String?
    var active: Bool { policyReceived && !paused }

    /// Called when a field reported in `health` changes.
    var onChange: (() -> Void)?

    private var asleep = false
    private var observed: App?
    private var axObserver: AXObserver?
    private var session: App?
    private var window: Window?
    private var lastSelection: String?
    private var noWindowReported = false
    private var trees: [String: String] = [:]
    private var captureWork: DispatchWorkItem?
    private var selectionWork: DispatchWorkItem?
    private let suppression = SuppressionCounter()
    private let screenText = ScreenTextRecorder()
    private var counters = (captures: 0, emptyCaptures: 0, maxTreeBytes: 0)

    init() {
        AXUIElementSetMessagingTimeout(AXUIElementCreateSystemWide(), 0.25)
        let center = NSWorkspace.shared.notificationCenter
        let handlers: [(Notification.Name, (Observer) -> Void)] = [
            (NSWorkspace.didActivateApplicationNotification, { $0.refresh("applicationActivated") }),
            (NSWorkspace.willSleepNotification, { $0.setAsleep(true, reason: "sleep") }),
            (NSWorkspace.didWakeNotification, { $0.setAsleep(false, reason: "wake") }),
            (NSWorkspace.screensDidSleepNotification, { $0.setAsleep(true, reason: "screensSleep") }),
            (NSWorkspace.screensDidWakeNotification, { $0.setAsleep(false, reason: "screensWake") }),
            (NSWorkspace.sessionDidResignActiveNotification, { $0.setSessionActive(false) }),
            (NSWorkspace.sessionDidBecomeActiveNotification, { $0.setSessionActive(true) }),
        ]
        for (name, handler) in handlers {
            center.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in self.map(handler) }
        }
    }

    // MARK: Control

    func update(policy: CapturePolicy) {
        self.policy = policy
        policyReceived = true
        trees.removeAll()
        refresh("policyChanged")
    }

    func pause() {
        paused = true
        endSession("paused")
        stopObserving()
        trees.removeAll()
        onChange?()
    }

    func resume() {
        paused = false
        everResumed = true
        refresh("resumed")
        onChange?()
    }

    /// `discard-context-awareness-buffer`: forget the outlines that diffs are based on and any pending capture.
    func discardBuffer() {
        trees.removeAll()
        lastSelection = nil
        captureWork?.cancel()
        selectionWork?.cancel()
    }

    func stop(_ reason: String) {
        endSession(reason)
        stopObserving()
        flushSuppression()
    }

    /// Periodic: idle state and the `attention` line. The idle age is the session's time since any
    /// input of any kind, from the system; no individual key or pointer event is read.
    func tick() {
        let age = CGEventSource.secondsSinceLastEventType(.combinedSessionState, eventType: Self.anyInputEvent)
        let nowIdle = age >= Self.idleAfter
        if nowIdle != idle {
            idle = nowIdle
            if idle { endSession("idle") } else { refresh("userActive") }
            onChange?()
        }
        guard active, !idle, !asleep, systemSessionActive,
              let bundleId = NSWorkspace.shared.frontmostApplication?.bundleIdentifier else { return }
        Output.send("attention", ["occurredAt": nowMs(), "frontmostBundleId": bundleId, "inputAgeSeconds": max(0, age.rounded())])
    }

    func flushSuppression() { suppression.flush() }

    /// `kCGAnyInputEventType` (~0), which Swift's CGEventType enum cannot spell.
    private static let anyInputEvent = unsafeBitCast(UInt32.max, to: CGEventType.self)

    // MARK: Following the frontmost app

    private func setAsleep(_ value: Bool, reason: String) {
        asleep = value
        if value { endSession(reason) } else { refresh(reason) }
    }

    private func setSessionActive(_ value: Bool) {
        systemSessionActive = value
        if value { refresh("sessionActive") } else { endSession("sessionInactive") }
        onChange?()
    }

    /// Re-reads the frontmost app and decides whether to observe it.
    func refresh(_ reason: String) {
        guard active, !asleep, !idle, systemSessionActive, AXIsProcessTrusted() else {
            endSession(paused ? "paused" : "unavailable")
            stopObserving()
            return
        }
        guard let app = App(NSWorkspace.shared.frontmostApplication), app.pid != getpid() else { return }
        // Transient system surfaces (Spotlight, Dock, sheets) are never observed and do not end a session.
        if CapturePolicy.systemSurfaces.contains(app.bundleId) { return }
        // Aux records its own pages; without input signals there is nothing to send for it.
        if CapturePolicy.browserSignalBundleIds.contains(app.bundleId) {
            endSession("applicationChanged")
            stopObserving()
            return
        }
        if policy.excludedBundleIds.contains(app.bundleId) {
            suppression.count("excluded-application")
            endSession("applicationChanged")
            stopObserving()
            return
        }
        if observed != app { observe(app) }
        if session != app {
            endSession("applicationChanged")
            session = app
            lastSessionBundleId = app.bundleId
            window = nil
            noWindowReported = false
            send(app, kind: "session.started", payload: ["reason": "applicationChanged"], title: "")
        }
        scheduleCapture(reason == "applicationActivated" ? "applicationActivated" : reason)
    }

    private func observe(_ app: App) {
        stopObserving()
        observed = app
        var created: AXObserver?
        let callback: AXObserverCallback = { _, _, notification, refcon in
            guard let refcon else { return }
            Unmanaged<Observer>.fromOpaque(refcon).takeUnretainedValue().handle(notification as String)
        }
        guard AXObserverCreate(app.pid, callback, &created) == .success, let created else {
            observerRegistrationFailures += 1
            onChange?()
            return
        }
        let element = AXUIElementCreateApplication(app.pid)
        let refcon = Unmanaged.passUnretained(self).toOpaque()
        let names = [kAXFocusedWindowChangedNotification, kAXMainWindowChangedNotification, kAXWindowCreatedNotification,
                     kAXTitleChangedNotification, kAXFocusedUIElementChangedNotification, kAXSelectedTextChangedNotification]
        let results = names.map { AXObserverAddNotification(created, element, $0 as CFString, refcon) }
        if !results.contains(.success) {
            observerRegistrationFailures += 1
            onChange?()
            return
        }
        CFRunLoopAddSource(CFRunLoopGetMain(), AXObserverGetRunLoopSource(created), .defaultMode)
        axObserver = created
    }

    private func stopObserving() {
        if let axObserver {
            CFRunLoopRemoveSource(CFRunLoopGetMain(), AXObserverGetRunLoopSource(axObserver), .defaultMode)
        }
        axObserver = nil
        observed = nil
        captureWork?.cancel()
        selectionWork?.cancel()
    }

    private func handle(_ notification: String) {
        switch notification {
        case kAXSelectedTextChangedNotification: scheduleSelection()
        case kAXTitleChangedNotification: scheduleCapture("titleChanged")
        case kAXFocusedUIElementChangedNotification: scheduleCapture("focusChanged", after: 1)
        default: scheduleCapture("focusedWindowChanged")
        }
    }

    // MARK: Sessions

    private func endSession(_ reason: String) {
        guard let app = session else { return }
        send(app, kind: "session.ended", payload: ["reason": reason], title: window?.title ?? "")
        session = nil
        window = nil
        lastSelection = nil
    }

    // MARK: Captures

    private func scheduleCapture(_ reason: String, after delay: TimeInterval = 0.4) {
        captureWork?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.capture(reason) }
        captureWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: work)
    }

    private func capture(_ reason: String) {
        guard active, let app = observed, app == session else { return }
        if Permissions.secureInput { suppression.count("secure-input"); return }
        let element = AXUIElementCreateApplication(app.pid)
        guard let focusedWindow: AXUIElement = AX.attribute(element, kAXFocusedWindowAttribute) else {
            window = nil
            if !noWindowReported {
                noWindowReported = true
                send(app, kind: "window.changed", payload: ["reason": "no-focused-window"], title: "")
            }
            return
        }
        noWindowReported = false
        let title = AX.string(focusedWindow, kAXTitleAttribute) ?? ""
        let tree = AX.tree(of: focusedWindow)
        let url = tree.url
        let domain = url.flatMap { URL(string: $0)?.host?.lowercased() }
        if CapturePolicy.isPrivate(title: title, url: url) { window = nil; suppression.count("private-window"); return }
        if policy.excludes(domain: domain) { window = nil; suppression.count("excluded-domain"); return }
        window = Window(title: title, url: url, domain: domain)

        let focused = AX.focusedElement().flatMap { AX.pid($0) == app.pid ? $0 : nil }
        if let focused, AX.isSensitive(focused) { suppression.count("secure-target") }

        let key = "\(app.pid):\(CFHash(focusedWindow))"
        let previous = trees[key]
        if previous == tree.text, reason != "applicationActivated" { return }
        if trees.count >= Self.maxTrees, previous == nil { trees.removeAll() }
        trees[key] = tree.text

        counters.captures += 1
        if tree.text.isEmpty { counters.emptyCaptures += 1 }
        counters.maxTreeBytes = max(counters.maxTreeBytes, tree.bytes)
        captureDiagnostics = ["bundleId": app.bundleId, "captures": counters.captures, "emptyCaptures": counters.emptyCaptures,
                              "lastTreeBytes": tree.bytes, "maxTreeBytes": counters.maxTreeBytes,
                              "lastWalk": ["nodes": tree.nodes, "truncated": tree.truncated ?? "none", "reason": reason]]

        var extra: JSON = [:]
        if let focused { extra["target"] = AX.target(focused) }
        if let previous {
            let diff = AX.diff(from: previous, to: tree.text)
            if !diff.isEmpty { extra["ax"] = ["mode": "diffFromPrevious", "text": diff] }
        } else if !tree.text.isEmpty {
            extra["ax"] = ["mode": "fullTree", "text": tree.text]
        }
        send(app, kind: "window.changed", payload: ["reason": reason], title: title, extra: extra)

        if !tree.hasText, policy.screenText {
            screenText.captureIfBlind(pid: app.pid, bundleId: app.bundleId, title: title) { [weak self] text, ms in
                guard let self, self.active, self.session == app, self.window?.title == title else { return }
                self.send(app, kind: "screen.ocr", payload: ["text": text, "captureMs": ms], title: title)
            }
        }
    }

    private func scheduleSelection() {
        selectionWork?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.captureSelection() }
        selectionWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.75, execute: work)
    }

    /// Non-empty selections only, so caret moves while typing never produce a line.
    private func captureSelection() {
        guard active, let app = observed, app == session, let window, !Permissions.secureInput,
              let focused = AX.focusedElement(), AX.pid(focused) == app.pid else { return }
        if AX.isSensitive(focused) { suppression.count("secure-target"); return }
        guard let text = AX.string(focused, kAXSelectedTextAttribute),
              !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, text != lastSelection else { return }
        lastSelection = text
        var payload: JSON = ["selectedText": String(text.prefix(Self.maxSelection))]
        if let value: AXValue = AX.attribute(focused, kAXSelectedTextRangeAttribute) {
            var range = CFRange()
            if AXValueGetValue(value, .cfRange, &range) { payload["selectedRange"] = ["location": range.location, "length": range.length] }
        }
        var target = AX.target(focused)
        target["value"] = nil
        send(app, kind: "selection.changed", payload: payload, title: window.title, extra: ["target": target])
    }

    /// One `event` line with the common fields of spec 6.4.
    private func send(_ app: App, kind: String, payload: JSON, title: String, extra: JSON = [:]) {
        var event: JSON = ["occurredAt": nowMs(), "source": "mac_ax", "appName": app.name, "bundleId": app.bundleId,
                           "windowTitle": title, "kind": kind, "payload": payload]
        if let window, window.title == title {
            event["url"] = window.url
            event["domain"] = window.domain
        }
        event.merge(extra) { _, new in new }
        Output.send("event", ["event": event])
    }
}
