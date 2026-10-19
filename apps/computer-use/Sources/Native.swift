import Foundation
import AppKit
import ApplicationServices
import Contacts
import Carbon
import Darwin
import CryptoKit

func contactPermission() -> String {
    switch CNContactStore.authorizationStatus(for: .contacts) {
    case .authorized: return "granted"
    case .denied: return "denied"
    case .restricted: return "restricted"
    case .notDetermined: return "not-determined"
    default: return "limited-or-unknown"
    }
}
func automationPermission(_ bundleId: String, request: Bool) throws -> [String: Any] {
    var descriptor = AEDesc()
    let bytes = Array(bundleId.utf8)
    let created = bytes.withUnsafeBytes { AECreateDesc(DescType(typeApplicationBundleID), $0.baseAddress, bytes.count, &descriptor) }
    guard created == noErr else { throw HelperError("BAD_REQUEST", "Invalid automation target") }
    defer { AEDisposeDesc(&descriptor) }
    let status = AEDeterminePermissionToAutomateTarget(&descriptor, AEEventClass(typeWildCard), AEEventID(typeWildCard), request)
    let state = status == noErr ? "granted" : status == -1743 ? "denied" : status == -1744 ? "not-determined" : "unknown-or-not-running"
    return ["bundleId": bundleId, "state": state, "osStatus": status]
}
func permissionStatus(_ params: [String: Any]) throws -> [String: Any] {
    let targets = params["automationTargets"] as? [String] ?? []
    guard targets.count <= 20 else { throw HelperError("BAD_REQUEST", "Too many automation targets") }
    return ["accessibility": AXIsProcessTrusted() ? "granted" : "not-granted", "screenRecording": CGPreflightScreenCaptureAccess() ? "granted" : "not-granted", "contacts": contactPermission(), "automation": try targets.map { try automationPermission($0, request: false) }, "fullDiskAccess": "unknown", "messages": "requires-authorized-operation", "biometry": biometricAvailability(), "semanticCapture": AXIsProcessTrusted() ? "available" : "permission-required"]
}
func requestPermission(_ params: [String: Any]) throws -> [String: Any] {
    switch try requiredString(params, "kind", limit: 50) {
    case "accessibility":
        let granted = AXIsProcessTrustedWithOptions([kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary)
        return ["initiated": true, "granted": granted]
    case "screenRecording": return ["initiated": true, "granted": CGRequestScreenCaptureAccess()]
    case "contacts":
        let semaphore = DispatchSemaphore(value: 0)
        var granted = false
        CNContactStore().requestAccess(for: .contacts) { allowed, _ in granted = allowed; semaphore.signal() }
        guard semaphore.wait(timeout: .now() + 120) == .success else { throw HelperError("TIMEOUT", "Contacts permission request timed out") }
        return ["initiated": true, "granted": granted, "state": contactPermission()]
    case "automation": return try automationPermission(requiredString(params, "bundleId", limit: 255), request: true)
    case "fullDiskAccess":
        guard let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles") else { throw HelperError("INTERNAL", "Settings URL is unavailable") }
        let opened = NSWorkspace.shared.open(url)
        return ["initiated": opened, "state": "unknown", "reason": "macOS does not expose a public Full Disk Access status API"]
    default: throw HelperError("BAD_REQUEST", "Unknown permission kind")
    }
}
func artifactDirectory() throws -> URL {
    guard let path = ProcessInfo.processInfo.environment["AUX_HELPER_ARTIFACT_DIR"], path.hasPrefix("/") else { throw HelperError("PRECONDITION_FAILED", "The daemon must supply a private artifact directory") }
    let url = URL(fileURLWithPath: path, isDirectory: true)
    try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
    let values = try url.resourceValues(forKeys: [.isSymbolicLinkKey])
    guard values.isSymbolicLink != true else { throw HelperError("FORBIDDEN", "Helper artifacts cannot use a symbolic link") }
    return url
}
func runProgram(_ executable: String, _ arguments: [String], stdin: Data? = nil, timeout: Double = 30) throws -> [String: Any] {
    let directory = try artifactDirectory()
    let output = directory.appendingPathComponent("command-\(UUID().uuidString).out"), errors = directory.appendingPathComponent("command-\(UUID().uuidString).err")
    FileManager.default.createFile(atPath: output.path, contents: Data(), attributes: [.posixPermissions: 0o600])
    FileManager.default.createFile(atPath: errors.path, contents: Data(), attributes: [.posixPermissions: 0o600])
    let stdout = try FileHandle(forWritingTo: output), stderr = try FileHandle(forWritingTo: errors)
    defer { try? stdout.close(); try? stderr.close(); try? FileManager.default.removeItem(at: output); try? FileManager.default.removeItem(at: errors) }
    let process = Process()
    process.executableURL = URL(fileURLWithPath: executable)
    process.arguments = arguments
    process.standardOutput = stdout
    process.standardError = stderr
    let input = Pipe()
    process.standardInput = input
    try process.run()
    if let stdin { try input.fileHandleForWriting.write(contentsOf: stdin) }
    try input.fileHandleForWriting.close()
    var expired = false
    let timer = DispatchSource.makeTimerSource(queue: .global())
    timer.schedule(deadline: .now() + timeout)
    timer.setEventHandler { if process.isRunning { expired = true; process.terminate() } }
    timer.resume()
    process.waitUntilExit()
    timer.cancel()
    if expired { throw HelperError("TIMEOUT", "Native command exceeded its deadline") }
    let data = try Data(contentsOf: output)
    guard data.count <= 100000 else { throw HelperError("RESOURCE_EXHAUSTED", "Native output exceeds the helper limit") }
    guard process.terminationStatus == 0 else { throw HelperError("NATIVE_ERROR", "Native command failed (\(process.terminationStatus)); sensitive command output was withheld") }
    return ["exitCode": process.terminationStatus, "stdout": String(data: data, encoding: .utf8) ?? ""]
}
func requireAccessibility() throws { guard AXIsProcessTrusted() else { throw HelperError("PRECONDITION_FAILED", "Enable Accessibility for Aux Computer Use in macOS Settings") } }
func screenCapture(_ params: [String: Any]) throws -> [String: Any] {
    guard CGPreflightScreenCaptureAccess() else { throw HelperError("PRECONDITION_FAILED", "Enable Screen Recording for Aux Computer Use in macOS Settings") }
    let output = try artifactDirectory().appendingPathComponent("screenshot-\(UUID().uuidString).png")
    var arguments = ["-x", "-t", "png"]
    if params["width"] != nil {
        let x = try requiredNumber(params, "x"), y = try requiredNumber(params, "y"), width = try requiredNumber(params, "width", range: 1...20000), height = try requiredNumber(params, "height", range: 1...20000)
        arguments += ["-R", "\(Int(x)),\(Int(y)),\(Int(width)),\(Int(height))"]
    }
    arguments.append(output.path)
    _ = try runProgram("/usr/sbin/screencapture", arguments)
    try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: output.path)
    guard let image = NSBitmapImageRep(data: try Data(contentsOf: output)) else { throw HelperError("NATIVE_ERROR", "Screenshot image could not be decoded") }
    return ["path": output.path, "mimeType": "image/png", "width": image.pixelsWide, "height": image.pixelsHigh]
}
func mouseClick(_ params: [String: Any]) throws -> [String: Any] {
    try requireAccessibility()
    let point = CGPoint(x: try requiredNumber(params, "x"), y: try requiredNumber(params, "y"))
    let right = (params["button"] as? String ?? "left") == "right"
    let button: CGMouseButton = right ? .right : .left
    guard let down = CGEvent(mouseEventSource: nil, mouseType: right ? .rightMouseDown : .leftMouseDown, mouseCursorPosition: point, mouseButton: button), let up = CGEvent(mouseEventSource: nil, mouseType: right ? .rightMouseUp : .leftMouseUp, mouseCursorPosition: point, mouseButton: button) else { throw HelperError("NATIVE_ERROR", "Could not create mouse events") }
    down.post(tap: .cghidEventTap); up.post(tap: .cghidEventTap)
    return ["posted": true]
}
func typeText(_ params: [String: Any]) throws -> [String: Any] {
    try requireAccessibility()
    let text = try requiredString(params, "text", limit: 50000)
    for character in text {
        let units = Array(String(character).utf16)
        guard let event = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true) else { throw HelperError("NATIVE_ERROR", "Could not create text event") }
        units.withUnsafeBufferPointer { event.keyboardSetUnicodeString(stringLength: units.count, unicodeString: $0.baseAddress!) }
        event.post(tap: .cghidEventTap)
    }
    return ["posted": true, "characters": text.count]
}
func pressKey(_ params: [String: Any]) throws -> [String: Any] {
    try requireAccessibility()
    let keys: [String: CGKeyCode] = ["enter": 36, "tab": 48, "space": 49, "backspace": 51, "escape": 53, "left": 123, "right": 124, "down": 125, "up": 126, "home": 115, "end": 119, "pageup": 116, "pagedown": 121, "a": 0, "c": 8, "v": 9, "x": 7, "z": 6, "s": 1, "w": 13, "l": 37, "r": 15]
    let name = try requiredString(params, "key", limit: 30).lowercased()
    guard let code = keys[name] else { throw HelperError("BAD_REQUEST", "Unsupported key name") }
    let modifiers = params["modifiers"] as? [String] ?? []
    var flags = CGEventFlags()
    for modifier in modifiers { switch modifier { case "command": flags.insert(.maskCommand); case "shift": flags.insert(.maskShift); case "option": flags.insert(.maskAlternate); case "control": flags.insert(.maskControl); default: throw HelperError("BAD_REQUEST", "Unsupported key modifier") } }
    guard let down = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: true), let up = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: false) else { throw HelperError("NATIVE_ERROR", "Could not create keyboard events") }
    down.flags = flags; up.flags = flags; down.post(tap: .cghidEventTap); up.post(tap: .cghidEventTap)
    return ["posted": true]
}
func contactsSearch(_ params: [String: Any]) throws -> [String: Any] {
    guard contactPermission() == "granted" else { throw HelperError("PRECONDITION_FAILED", "Contacts permission is required") }
    let query = try requiredString(params, "query", limit: 200)
    let limit = min(max((params["limit"] as? Int ?? 20), 1), 100)
    let contacts = try CNContactStore().unifiedContacts(matching: CNContact.predicateForContacts(matchingName: query), keysToFetch: [CNContactIdentifierKey, CNContactGivenNameKey, CNContactFamilyNameKey, CNContactOrganizationNameKey, CNContactPhoneNumbersKey, CNContactEmailAddressesKey] as [CNKeyDescriptor])
    return ["contacts": contacts.prefix(limit).map { ["id": $0.identifier, "givenName": $0.givenName, "familyName": $0.familyName, "organization": $0.organizationName, "phones": $0.phoneNumbers.map { $0.value.stringValue }, "emails": $0.emailAddresses.map { $0.value as String }] as [String: Any] }]
}
func appleScriptLiteral(_ value: String) -> String { "\"" + value.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"").replacingOccurrences(of: "\r", with: "\\r").replacingOccurrences(of: "\n", with: "\\n") + "\"" }
func execute(_ method: String, _ params: [String: Any]) throws -> [String: Any] {
    switch method {
    case "ping": return ["service": "aux-computer-use", "version": "0.1.0", "pid": ProcessInfo.processInfo.processIdentifier]
    case "capabilities": return ["methods": ["permissions.status", "permissions.request", "screen.capture", "input.click", "input.type", "input.scroll", "input.key", "apps.list", "apps.frontmost", "apps.open", "accessibility.snapshot", "automation.run", "contacts.search", "messages.send", "vault.biometryAvailable", "vault.biometryStatus", "vault.biometryEnroll", "vault.biometryUnlock", "vault.biometryRemove"], "privateTransportRequired": true, "semanticCapture": AXIsProcessTrusted() ? "available" : "permission-required", "messagesRead": "unavailable"]
    case "permissions.status": return try permissionStatus(params)
    case "permissions.request": return try requestPermission(params)
    case "vault.biometryAvailable": return biometricAvailability()
    case "vault.biometryStatus", "vault.biometryEnroll", "vault.biometryUnlock", "vault.biometryRemove": return try vaultBiometry(method, params)
    case "screen.capture": return try screenCapture(params)
    case "input.click": return try mouseClick(params)
    case "input.type": return try typeText(params)
    case "input.key": return try pressKey(params)
    case "input.scroll":
        try requireAccessibility()
        let x = Int32(try requiredNumber(params, "x", range: -10000...10000)), y = Int32(try requiredNumber(params, "y", range: -10000...10000))
        guard let event = CGEvent(scrollWheelEvent2Source: nil, units: .pixel, wheelCount: 2, wheel1: y, wheel2: x, wheel3: 0) else { throw HelperError("NATIVE_ERROR", "Could not create scroll event") }
        event.post(tap: .cghidEventTap); return ["posted": true]
    case "apps.frontmost": return try frontmostApplication()
    case "accessibility.snapshot": return try accessibilitySnapshot(params)
    case "apps.list": return ["applications": NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }.map { ["pid": $0.processIdentifier, "bundleId": $0.bundleIdentifier ?? "", "name": $0.localizedName ?? "", "bundlePath": $0.bundleURL?.path ?? "", "active": $0.isActive] as [String: Any] }]
    case "apps.open":
        let bundleId = try requiredString(params, "bundleId", limit: 255)
        guard let url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleId) else { throw HelperError("NOT_FOUND", "Application is not installed") }
        let semaphore = DispatchSemaphore(value: 0)
        var identifier: pid_t?, failed = false
        NSWorkspace.shared.openApplication(at: url, configuration: NSWorkspace.OpenConfiguration()) { app, error in identifier = app?.processIdentifier; failed = error != nil; semaphore.signal() }
        guard semaphore.wait(timeout: .now() + 30) == .success, !failed, let identifier else { throw HelperError("NATIVE_ERROR", "Application could not be opened") }
        return ["pid": identifier, "bundleId": bundleId]
    case "automation.run": return try runProgram("/usr/bin/osascript", ["-"], stdin: Data(requiredString(params, "script", limit: 100000).utf8), timeout: 60)
    case "contacts.search": return try contactsSearch(params)
    case "messages.send":
        guard params["confirmed"] as? Bool == true else { throw HelperError("FORBIDDEN", "Message sending requires a recorded human confirmation") }
        let recipient = try requiredString(params, "recipient", limit: 500), body = try requiredString(params, "body", limit: 50000)
        let operationId = try requiredString(params, "operationId", limit: 200)
        let operationHash = SHA256.hash(data: Data(operationId.utf8)).map { String(format: "%02x", $0) }.joined()
        let requestHash = SHA256.hash(data: Data("\(recipient)\0\(body)".utf8)).map { String(format: "%02x", $0) }.joined()
        let journal = try artifactDirectory().appendingPathComponent("operation-\(operationHash).json")
        if FileManager.default.fileExists(atPath: journal.path) {
            guard let existing = try JSONSerialization.jsonObject(with: Data(contentsOf: journal)) as? [String: String], existing["requestHash"] == requestHash else { throw HelperError("CONFLICT", "Native operation identity does not match") }
            guard existing["state"] == "completed" else { throw HelperError("CONFLICT", "Message outcome is unknown; inspect Messages before choosing a new operation") }
            return ["sent": true, "transport": "imessage", "replayed": true]
        }
        let claim = try JSONSerialization.data(withJSONObject: ["requestHash": requestHash, "state": "started"])
        let descriptor = open(journal.path, O_WRONLY | O_CREAT | O_EXCL, 0o600)
        guard descriptor >= 0 else { throw HelperError("CONFLICT", "Native operation identity was already claimed") }
        let handle = FileHandle(fileDescriptor: descriptor, closeOnDealloc: true)
        try handle.write(contentsOf: claim); fsync(descriptor); try handle.close()
        let script = "tell application \"Messages\"\nset channel to first service whose service type is iMessage\nset destination to buddy \(appleScriptLiteral(recipient)) of channel\nsend \(appleScriptLiteral(body)) to destination\nend tell"
        _ = try runProgram("/usr/bin/osascript", ["-"], stdin: Data(script.utf8), timeout: 60)
        try JSONSerialization.data(withJSONObject: ["requestHash": requestHash, "state": "completed"]).write(to: journal, options: .atomic)
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: journal.path)
        return ["sent": true, "transport": "imessage"]
    default: throw HelperError("NOT_IMPLEMENTED", "Unknown Aux helper method")
    }
}
