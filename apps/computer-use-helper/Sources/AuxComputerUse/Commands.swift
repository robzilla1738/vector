import AppKit
import Contacts
import CoreServices

/// An error in the envelope shape of spec 7.2: `{code, message, reason?}`.
struct HelperError: Error {
    let code: String
    let message: String
    var reason: String? = nil

    static func usage(_ message: String) -> HelperError { HelperError(code: "usage", message: message) }
    static func failed(_ message: String) -> HelperError { HelperError(code: "failed", message: message) }

    /// The release route refuses every Messages, Contacts and KakaoTalk export (spec G2). The code is the
    /// one the daemon's native bridge uses for the same refusal; the daemon maps it to a plain Error.
    static let externalData = HelperError(
        code: "AUX_COMPUTER_USE_EXTERNAL_DATA_UNAVAILABLE",
        message: "Messages, Contacts and KakaoTalk data are not available to Aux Computer Use.")

    var json: JSON {
        var error: JSON = ["code": code, "message": message]
        error["reason"] = reason
        return error
    }
}

/// Named operations shared by the one-shot CLI (spec 7) and observer `invoke` (spec 6.3).
enum Commands {
    /// Data commands kept for protocol parity. Their payloads are validated, then refused.
    static let externalData: [String: [String]] = [
        "permissions.request": [], "messages-permission-dialog": [],
        "contacts.resolve": ["handles"], "contacts.search": ["query"],
        "imessage.list-chats": [], "imessage.get-history": ["chatGuid"], "imessage.search": [],
        "imessage.max-rowid": [], "imessage.send": ["text"], "imessage.chat-exists": ["chatGuid"],
        "imessage.find-chat-guids": ["handle"], "imessage.most-active-sibling": ["chatGuid"],
        "imessage.outgoing-delivery": ["sinceRowid"],
        "kakaotalk.list-chats": [], "kakaotalk.get-history": ["chatId"], "kakaotalk.search": [],
    ]
    static let local: Set<String> = ["permissions.check", "lifecycle.shutdown", "applications.list"]

    static func isKnown(_ name: String) -> Bool { local.contains(name) || externalData[name] != nil }

    static func run(_ name: String, _ payload: JSON) throws -> Any {
        if let required = externalData[name] {
            for key in required where payload[key] == nil || payload[key] is NSNull {
                throw HelperError.usage("\(key) is required")
            }
            if name == "imessage.send", payload["chatGuid"] == nil, payload["to"] == nil {
                throw HelperError.usage("chatGuid or to is required")
            }
            throw HelperError.externalData
        }
        switch name {
        case "permissions.check": return Permissions.check()
        case "applications.list": return Applications.list()
        case "lifecycle.shutdown":
            guard let appPath = payload["appPath"] as? String, !appPath.isEmpty else { throw HelperError.usage("appPath is required") }
            return Lifecycle.shutdown(appPath: appPath)
        default: throw HelperError.usage("Unknown command: \(name)")
        }
    }
}

/// Stops another running copy of this helper by its app path (the legacy route's install refresh).
enum Lifecycle {
    static func shutdown(appPath: String) -> JSON {
        let wanted = URL(fileURLWithPath: appPath).standardizedFileURL.resolvingSymlinksInPath().path
        let others = NSRunningApplication.runningApplications(withBundleIdentifier: "dev.aux.browser.computer-use").filter {
            $0.processIdentifier != getpid() && $0.bundleURL?.standardizedFileURL.resolvingSymlinksInPath().path == wanted
        }
        others.forEach { kill($0.processIdentifier, SIGTERM) }
        let deadline = Date().addingTimeInterval(2)
        while others.contains(where: { !$0.isTerminated }), Date() < deadline { usleep(50_000) }
        let stubborn = others.filter { !$0.isTerminated }
        stubborn.forEach { kill($0.processIdentifier, SIGKILL) }
        return ["completed": true, "terminated": others.count]
    }
}

/// `aux-computer-use <command> [--json <object>] [--no-dialog]`: one envelope on stdout, then exit.
enum OneShot {
    static let usage = "Missing command. Usage: aux-computer-use <command> [--json <payload>]"

    static func run(_ arguments: [String]) -> Int32 {
        do {
            let (name, payload) = try parse(arguments)
            let data = try Commands.run(name, payload)
            return write(["ok": true, "data": data]) ? 0 : 1
        } catch let error as HelperError {
            _ = write(["ok": false, "error": error.json])
            return 1
        } catch {
            _ = write(["ok": false, "error": HelperError.failed(error.localizedDescription).json])
            return 1
        }
    }

    /// `--no-dialog` is accepted and has nothing to suppress: no data command shows the Messages sheet.
    static func parse(_ arguments: [String]) throws -> (String, JSON) {
        guard let name = arguments.first, !name.isEmpty else { throw HelperError.usage(usage) }
        var payload: JSON = [:]
        var rest = arguments.dropFirst()
        while let argument = rest.popFirst() {
            switch argument {
            case "--no-dialog": continue
            case "--json":
                guard let text = rest.popFirst() else { throw HelperError.usage("--json requires a JSON object") }
                guard let object = try? JSONSerialization.jsonObject(with: Data(text.utf8), options: [.fragmentsAllowed]) as? JSON else {
                    throw HelperError.usage("--json must be a JSON object")
                }
                payload = object
            default: throw HelperError.usage("Unknown argument: \(argument)")
            }
        }
        guard Commands.isKnown(name) else { throw HelperError.usage("Unknown command: \(name)") }
        return (name, payload)
    }

    private static func write(_ envelope: JSON) -> Bool {
        guard let data = Output.encode(envelope) else {
            print(#"{"ok":false,"error":{"code":"failed","message":"Failed to encode response"}}"#)
            return false
        }
        Output.writeLine(data)
        return true
    }
}
