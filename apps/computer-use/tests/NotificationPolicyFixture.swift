import Foundation

// Minimal protocol validation fixture. No helper process, OS authorization or UN center.
struct HelperError: Error { let code: String; let message: String; init(_ code: String, _ message: String) { self.code = code; self.message = message } }
func requiredString(_ params: [String: Any], _ key: String, limit: Int) throws -> String {
    guard let value = params[key] as? String, !value.isEmpty, value.utf8.count <= limit, !value.contains("\0") else { throw HelperError("BAD_REQUEST", "invalid fixture input") }
    return value
}
@main struct NotificationFixture {
    static func main() throws {
        let id = "aux-" + String(repeating: "a", count: 64)
        let params: [String: Any] = ["operationId": id, "title": "Synthetic title", "body": "Synthetic body", "activatesSession": true]
        let input = try AuxNotificationInput(params), ledger = AuxNotificationLedger()
        let fresh = try ledger.claim(input); precondition(fresh)
        do { _ = try ledger.claim(input); preconditionFailure("uncertain operation replayed") } catch {}
        ledger.complete(id)
        let replay = try ledger.claim(input); precondition(!replay)
        var changed = params; changed["body"] = "Changed synthetic body"
        do { _ = try ledger.claim(AuxNotificationInput(changed)); preconditionFailure("changed payload accepted") } catch {}
        ledger.activate("aux-" + String(repeating: "b", count: 64))
        ledger.activate(id); ledger.activate(id)
        precondition(ledger.drain() == [id]); precondition(ledger.drain().isEmpty)
        var invalid = params; invalid["operationId"] = "foreign"
        do { _ = try AuxNotificationInput(invalid); preconditionFailure("invalid ID accepted") } catch {}
        let expired = AuxNotificationLedger()
        _ = try expired.claim(input, now: Date(timeIntervalSince1970: 1))
        expired.activate(id, now: Date(timeIntervalSince1970: 90000))
        precondition(expired.drain().isEmpty)
        print("Aux notification validation/one-use fixtures passed; no notification center or OS permission accessed")
    }
}
