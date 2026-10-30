import AppKit

/// Observer mode (spec 6): NDJSON commands on stdin, messages on stdout. Exits on stdin EOF,
/// `shutdown`, SIGTERM or SIGINT, after ending any open session and flushing stdout.
final class ObserverAppDelegate: NSObject, NSApplicationDelegate {
    static let protocolVersion = 1
    static let healthInterval: TimeInterval = 10

    private let observer = Observer()
    private lazy var menu = StatusMenu(observer: observer, sheet: sheet)
    private let sheet = PermissionSheet()
    private var timers: [Timer] = []
    private var signalSources: [DispatchSourceSignal] = []
    private var lastPermissions: [Bool] = []
    private var stopping = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        observer.onChange = { [weak self] in self?.sendHealth() }
        sheet.onVisibilityChange = { [weak self] in self?.sendHealth() }
        for signal in [SIGTERM, SIGINT] {
            Darwin.signal(signal, SIG_IGN)
            let source = DispatchSource.makeSignalSource(signal: signal, queue: .main)
            source.setEventHandler { [weak self] in self?.terminate("signal") }
            source.resume()
            signalSources.append(source)
        }
        repeating(Self.healthInterval) { $0.sendHealth() }
        repeating(2) { $0.pollPermissions() }
        repeating(5) { $0.observer.tick() }
        repeating(60) { $0.observer.flushSuppression() }
        lastPermissions = Permission.allCases.map(\.granted)
        sendHealth()
        readCommands()
    }

    private func repeating(_ interval: TimeInterval, _ body: @escaping (ObserverAppDelegate) -> Void) {
        timers.append(Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in self.map(body) })
    }

    /// Reads stdin on its own thread; every line is handled on the main thread.
    private func readCommands() {
        Thread.detachNewThread { [weak self] in
            while let line = readLine(strippingNewline: true) {
                DispatchQueue.main.async { self?.handle(line) }
            }
            DispatchQueue.main.async { self?.terminate("stdin-closed") }
        }
    }

    // MARK: Commands (spec 6.2)

    func handle(_ line: String) {
        let text = line.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        guard let command = try? JSONSerialization.jsonObject(with: Data(text.utf8)) as? JSON else {
            return protocolError("Invalid command: expected one JSON object per line")
        }
        guard let name = command["command"] as? String else { return protocolError("Missing command") }
        switch name {
        case "policy":
            guard let policy = CapturePolicy(command) else { return protocolError("Invalid policy") }
            observer.update(policy: policy)
            sendHealth()
        case "menu":
            menu.recentApplications = (command["recentApplications"] as? [JSON]) ?? []
        case "pause":
            observer.pause()
            menu.update()
        case "resume":
            observer.resume()
            menu.update()
        case "health":
            sendHealth()
        case "permissions":
            permissions(kind: command["kind"] as? String)
        case "invoke":
            invoke(command)
        case "shutdown":
            terminate("shutdown")
        default:
            protocolError("Unknown command: \(name)")
        }
    }

    private func permissions(kind: String?) {
        switch kind {
        case "observer":
            sheet.show(screenTextWanted: observer.policy.screenText)
            sendHealth()
        case "messages":
            // Messages, Contacts and KakaoTalk are not available to this helper (spec G2); answer at once
            // so the daemon does not wait out its 15-minute timeout.
            Output.send("menu-action", ["action": "messages-permissions", "completed": false])
        default:
            protocolError("permissions requires kind observer or messages")
        }
    }

    private func invoke(_ command: JSON) {
        guard let id = command["id"] as? String, let name = command["name"] as? String else {
            return protocolError("invoke requires id and name")
        }
        let payload = (command["payload"] as? JSON) ?? [:]
        if name == "discard-context-awareness-buffer" {
            observer.discardBuffer()
            return Output.send("result", ["id": id, "ok": true, "data": ["discarded": true]])
        }
        guard Commands.isKnown(name) else {
            return Output.send("result", ["id": id, "ok": false, "error": HelperError.usage("Unknown command: \(name)").json])
        }
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                Output.send("result", ["id": id, "ok": true, "data": try Commands.run(name, payload)])
            } catch let error as HelperError {
                Output.send("result", ["id": id, "ok": false, "error": error.json])
            } catch {
                Output.send("result", ["id": id, "ok": false, "error": HelperError.failed(error.localizedDescription).json])
            }
        }
    }

    private func protocolError(_ message: String) {
        Output.send("protocol-error", ["message": message])
    }

    // MARK: Health (spec 6.4)

    /// Accessibility or Screen Recording changed: tell the daemon (it restarts the helper when Screen
    /// Recording is granted) and start observing once Accessibility arrives.
    private func pollPermissions() {
        let current = Permission.allCases.map(\.granted)
        guard current != lastPermissions else { return }
        lastPermissions = current
        observer.refresh("permissionsChanged")
        sendHealth()
    }

    /// Input Monitoring is not used, so `inputMonitoringTrusted`, `eventTapHealthy` and `inputTapRunning`
    /// are never sent; `inputCaptureAvailable: false` and `inputMonitoring: "not-used"` say so.
    func health(state: String? = nil) -> JSON {
        let accessibility = Permission.accessibility.granted
        var health: JSON = [
            "state": state ?? (observer.active ? "running" : "paused"),
            "protocolVersion": Self.protocolVersion,
            "accessibilityTrusted": accessibility,
            "screenRecordingTrusted": Permission.screenRecording.granted,
            "inputCaptureAvailable": false,
            "inputMonitoring": Permissions.inputMonitoring,
            "observerRegistrationFailures": observer.observerRegistrationFailures,
            "secureInput": Permissions.secureInput,
            "permissionSheetVisible": sheet.isVisible,
            "systemSessionActive": observer.systemSessionActive,
            "idle": observer.idle,
            "pid": Int(getpid()),
            "observerPid": Int(getpid()),
            "responsibleSelf": Responsibility.isSelf,
        ]
        if !accessibility { health["message"] = "Accessibility permission is required for Context Awareness." }
        health["capture"] = observer.captureDiagnostics
        return health
    }

    private func sendHealth() {
        guard !stopping else { return }
        Output.send("health", health())
    }

    // MARK: Exit

    /// `reason` is for the log only; the daemon sees `session.ended {reason: "shutdown"}` and a stopped health.
    func terminate(_ reason: String) {
        guard !stopping else { return }
        stopping = true
        Output.log("exiting (\(reason))")
        observer.stop("shutdown")
        Output.send("health", health(state: "stopped"))
        Output.flush()
        exit(0)
    }
}
