import Foundation

/// The capture policy the daemon sends (`policy`), plus the fixed privacy rules (spec 11).
struct CapturePolicy {
    var excludedBundleIds: Set<String> = []
    var excludedDomains: [String] = []
    var captureTypedText = false
    var screenText = false

    static let browserSignalBundleIds: Set<String> = ["dev.aux.browser", "dev.aux.browser.canary"]
    static let systemSurfaces: Set<String> = [
        "com.apple.SecurityAgent", "com.apple.loginwindow", "com.apple.controlcenter",
        "com.apple.dock", "com.apple.dock.extra", "com.apple.dock.helper",
        "com.apple.notificationcenterui", "com.apple.Spotlight", "com.apple.systemuiserver",
        "com.apple.appkit.xpc.openAndSavePanelService", "com.apple.settings.PrivacySecurity.extension",
        "com.apple.systempreferences", "dev.aux.browser.computer-use",
    ]
    static let sensitiveLabel = try! NSRegularExpression(
        pattern: #"\b(cvv|cvc|csc|otp|one[- ]?time|pin|passcode|password|passwd|ssn|social security|verification code|security code|2fa|card number|credit card|routing number|account number)\b"#,
        options: [.caseInsensitive])
    static let privateWindow = try! NSRegularExpression(
        pattern: #"private browsing|incognito|inprivate|private window"#, options: [.caseInsensitive])

    /// Parses a `policy` command; nil when a field has the wrong type.
    init?(_ command: JSON) {
        guard let bundles = (command["excludedBundleIds"] ?? []) as? [String],
              let domains = (command["excludedDomains"] ?? []) as? [String],
              let typed = Self.bool(command["captureTypedText"]), let screen = Self.bool(command["screenText"]) else { return nil }
        excludedBundleIds = Set(bundles)
        excludedDomains = domains.map { $0.lowercased() }
        captureTypedText = typed
        screenText = screen
    }

    init() {}

    /// A JSON boolean (not a number) or absent (false); nil for any other value.
    private static func bool(_ value: Any?) -> Bool? {
        guard let value else { return false }
        guard let number = value as? NSNumber, CFGetTypeID(number) == CFBooleanGetTypeID() else { return nil }
        return number.boolValue
    }

    func excludes(domain: String?) -> Bool {
        guard let domain = domain?.lowercased() else { return false }
        return excludedDomains.contains { domain == $0 || domain.hasSuffix("." + $0) }
    }

    static func isSensitive(_ texts: [String?]) -> Bool {
        texts.contains { text in
            guard let text, !text.isEmpty else { return false }
            return sensitiveLabel.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) != nil
        }
    }

    static func isPrivate(title: String?, url: String?) -> Bool {
        [title, url].contains { text in
            guard let text else { return false }
            return privateWindow.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) != nil
        }
    }
}

/// Counts suppressed captures per one-minute bucket and reports them as `suppression` lines.
final class SuppressionCounter {
    static let reasons: Set<String> = ["secure-input", "secure-target", "private-window", "typed-text-disabled",
                                       "excluded-application", "excluded-domain", "foreground-uncertain"]
    private var bucketStartedAt = nowMs()
    private var counts: [String: Int] = [:]

    func count(_ reason: String) {
        let key = Self.reasons.contains(reason) ? reason : "policy"
        counts[key, default: 0] += 1
    }

    func flush() {
        if !counts.isEmpty {
            Output.send("suppression", ["bucketStartedAt": bucketStartedAt, "counts": counts])
        }
        counts = [:]
        bucketStartedAt = nowMs()
    }
}
