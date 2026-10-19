// daemon/agent.md tool inventory: permission-bound local notifications.
import Foundation
import UserNotifications
import CryptoKit

struct AuxNotificationInput {
    let operationId: String
    let title: String
    let body: String
    let activatesSession: Bool
    init(_ params: [String: Any]) throws {
        operationId = try requiredString(params, "operationId", limit: 68)
        guard operationId.range(of: "^aux-[a-f0-9]{64}$", options: .regularExpression) != nil else { throw HelperError("BAD_REQUEST", "Invalid notification operation identity") }
        title = try requiredString(params, "title", limit: 800)
        body = try requiredString(params, "body", limit: 16000)
        guard title.count <= 200, body.count <= 4000, let activation = params["activatesSession"] as? Bool else { throw HelperError("BAD_REQUEST", "Invalid notification content or activation flag") }
        activatesSession = activation
    }
    var fingerprint: String {
        SHA256.hash(data: Data("\(title)\0\(body)\0\(activatesSession)".utf8)).map { String(format: "%02x", $0) }.joined()
    }
}

// No payloads are retained: only fingerprints and issued opaque activation IDs.
final class AuxNotificationLedger {
    private let lock = NSLock()
    private var accepted: [String: (fingerprint: String, expires: Date, completed: Bool)] = [:]
    private var issued: Set<String> = []
    private var activations: [String] = []
    func claim(_ input: AuxNotificationInput, now: Date = Date()) throws -> Bool {
        lock.lock(); defer { lock.unlock() }
        accepted = accepted.filter { $0.value.expires > now }
        issued = issued.intersection(accepted.keys)
        if let existing = accepted[input.operationId] {
            guard existing.fingerprint == input.fingerprint else { throw HelperError("CONFLICT", "Notification operation content changed") }
            guard existing.completed else { throw HelperError("CONFLICT", "Notification enqueue outcome is unknown; do not retry automatically") }
            return false
        }
        guard accepted.count < 128 else { throw HelperError("RESOURCE_EXHAUSTED", "Too many pending notification operations") }
        accepted[input.operationId] = (input.fingerprint, now.addingTimeInterval(86400), false)
        if input.activatesSession { issued.insert(input.operationId) }
        return true
    }
    func complete(_ id: String) {
        lock.lock(); defer { lock.unlock() }
        if let entry = accepted[id] { accepted[id] = (entry.fingerprint, entry.expires, true) }
    }
    func reject(_ id: String) {
        lock.lock(); defer { lock.unlock() }
        accepted.removeValue(forKey: id); issued.remove(id)
    }
    func activate(_ id: String, now: Date = Date()) {
        lock.lock(); defer { lock.unlock() }
        guard let entry = accepted[id], entry.expires > now, issued.remove(id) != nil else { return }
        if activations.count < 128 { activations.append(id) }
    }
    func contains(_ id: String, now: Date = Date()) -> Bool {
        lock.lock(); defer { lock.unlock() }
        return (accepted[id]?.expires ?? .distantPast) > now
    }
    func drain() -> [String] {
        lock.lock(); defer { lock.unlock() }
        let result = Array(activations.prefix(32))
        activations.removeFirst(result.count)
        return result
    }
}
private let notificationLedger = AuxNotificationLedger()
private var notificationDelegate: AuxNotificationDelegate?
final class AuxNotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        defer { completionHandler() }
        guard response.actionIdentifier == UNNotificationDefaultActionIdentifier,
              response.notification.request.content.userInfo["auxOperationId"] as? String == response.notification.request.identifier else { return }
        notificationLedger.activate(response.notification.request.identifier)
    }
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler(notificationLedger.contains(notification.request.identifier) ? [.banner, .list] : [])
    }
}
func notificationRoleEligible() -> Bool {
    ProcessInfo.processInfo.environment["AUX_HELPER_ROLE"] == "notifications" &&
        Bundle.main.bundleIdentifier == "dev.aux.computer-use" && Bundle.main.bundleURL.pathExtension == "app"
}
func installNotificationDelegate() {
    guard notificationRoleEligible() else { return }
    let delegate = AuxNotificationDelegate()
    notificationDelegate = delegate // UNUserNotificationCenter.delegate is weak.
    UNUserNotificationCenter.current().delegate = delegate
}
func notificationStatus() throws -> [String: Any] {
    guard notificationRoleEligible(), notificationDelegate != nil else {
        return ["available": false, "authorization": "unavailable", "reason": "dedicated-notification-app-required"]
    }
    let semaphore = DispatchSemaphore(value: 0)
    var result: [String: Any] = [:]
    UNUserNotificationCenter.current().getNotificationSettings { settings in
        let authorization: String
        switch settings.authorizationStatus {
        case .authorized: authorization = "authorized"
        case .provisional: authorization = "provisional"
        case .denied: authorization = "denied"
        case .notDetermined: authorization = "not-determined"
        default: authorization = "unknown"
        }
        result = ["available": true, "authorization": authorization, "alertsEnabled": settings.alertSetting == .enabled, "deliveryConfirmed": false]
        semaphore.signal()
    }
    guard semaphore.wait(timeout: .now() + 3) == .success else { throw HelperError("TIMEOUT", "Notification permission status timed out") }
    return result
}
func requestNotificationPermission() throws -> [String: Any] {
    guard notificationRoleEligible(), notificationDelegate != nil else { throw HelperError("PRECONDITION_FAILED", "Dedicated notification app is unavailable") }
    let semaphore = DispatchSemaphore(value: 0)
    var granted = false, failed = false
    // Only reached by an explicit user permissions.request action. Never provisional.
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert]) { allowed, error in
        granted = allowed; failed = error != nil; semaphore.signal()
    }
    guard semaphore.wait(timeout: .now() + 120) == .success else { throw HelperError("TIMEOUT", "Notification permission request timed out") }
    guard !failed else { throw HelperError("NATIVE_ERROR", "macOS rejected the notification permission request") }
    return ["initiated": true, "granted": granted, "status": try notificationStatus()]
}
func enqueueNotification(_ params: [String: Any]) throws -> [String: Any] {
    let input = try AuxNotificationInput(params)
    let status = try notificationStatus()
    guard status["available"] as? Bool == true, ["authorized", "provisional"].contains(status["authorization"] as? String ?? "") else { throw HelperError("PRECONDITION_FAILED", "Enable notifications explicitly in Aux permission settings") }
    let fresh = try notificationLedger.claim(input)
    if fresh {
        let content = UNMutableNotificationContent()
        content.title = input.title; content.body = input.body
        content.userInfo = ["auxOperationId": input.operationId]
        let request = UNNotificationRequest(identifier: input.operationId, content: content, trigger: nil)
        let semaphore = DispatchSemaphore(value: 0)
        var failed = false
        UNUserNotificationCenter.current().add(request) { error in failed = error != nil; semaphore.signal() }
        // Timeout remains claimed: outcome is uncertain, so never auto-send again.
        guard semaphore.wait(timeout: .now() + 5) == .success else { throw HelperError("TIMEOUT", "Notification enqueue outcome is unknown; do not retry automatically") }
        if failed {
            notificationLedger.reject(input.operationId)
            throw HelperError("NATIVE_ERROR", "macOS rejected the notification request")
        }
    }
    notificationLedger.complete(input.operationId)
    return ["enqueued": true, "operationId": input.operationId, "replayed": !fresh, "deliveryConfirmed": false]
}
func takeNotificationActivations() throws -> [String: Any] {
    guard notificationRoleEligible() else { throw HelperError("PRECONDITION_FAILED", "Dedicated notification app is unavailable") }
    return ["operationIds": notificationLedger.drain()]
}
