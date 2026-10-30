import AppKit
import ApplicationServices
import Carbon
import Contacts
import CoreGraphics

/// The two permissions the observer uses (spec 8.2). Input Monitoring is deliberately absent:
/// the observer reads no keyboard or pointer input, so it never asks for it.
enum Permission: String, CaseIterable {
    case accessibility, screenRecording

    var title: String {
        switch self {
        case .accessibility: "Accessibility"
        case .screenRecording: "Screen Recording"
        }
    }

    var detail: String {
        switch self {
        case .accessibility: "Reads on-screen app content"
        case .screenRecording: "Reads text from image-only windows"
        }
    }

    var symbol: String {
        switch self {
        case .accessibility: "accessibility"
        case .screenRecording: "rectangle.dashed.badge.record"
        }
    }

    var settingsURL: URL {
        let anchor = switch self {
        case .accessibility: "Privacy_Accessibility"
        case .screenRecording: "Privacy_ScreenCapture"
        }
        return URL(string: "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?\(anchor)")!
    }

    /// Never prompts.
    var granted: Bool {
        switch self {
        case .accessibility: AXIsProcessTrusted()
        case .screenRecording: CGPreflightScreenCaptureAccess()
        }
    }

    /// Screen Recording registers the helper in its Settings list; Accessibility is added by the
    /// user through the guide (spec 8.2: "Sheet row → Settings + guide dock").
    func request() {
        if self == .screenRecording { _ = CGRequestScreenCaptureAccess() }
    }
}

enum Permissions {
    /// How the helper reports Input Monitoring wherever the protocol leaves room for it.
    static let inputMonitoring = "not-used"

    static var secureInput: Bool { IsSecureEventInputEnabled() }

    /// `permissions.check`: the spec's `{automation, contacts, fullDiskAccess, responsibleSelf}` plus the
    /// observer's own permissions. Nothing prompts.
    static func check() -> JSON {
        ["automation": automationAllowed(), "contacts": CNContactStore.authorizationStatus(for: .contacts) == .authorized,
         "fullDiskAccess": fullDiskAccess(), "responsibleSelf": Responsibility.isSelf,
         "accessibility": Permission.accessibility.granted, "screenRecording": Permission.screenRecording.granted,
         "inputMonitoring": inputMonitoring]
    }

    private static func automationAllowed() -> Bool {
        var target = AEAddressDesc()
        let bundleId = "com.apple.MobileSMS"
        guard bundleId.withCString({ AECreateDesc(typeApplicationBundleID, $0, bundleId.utf8.count, &target) }) == noErr else { return false }
        defer { AEDisposeDesc(&target) }
        return AEDeterminePermissionToAutomateTarget(&target, typeWildCard, typeWildCard, false) == noErr
    }

    /// Whether the Messages database can be opened. It is opened and closed, never read.
    private static func fullDiskAccess() -> Bool {
        guard let home = getpwuid(getuid())?.pointee.pw_dir else { return false }
        let fd = open(String(cString: home) + "/Library/Messages/chat.db", O_RDONLY | O_NOFOLLOW)
        if fd >= 0 { close(fd) }
        return fd >= 0
    }
}
