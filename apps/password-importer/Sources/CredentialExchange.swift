import AppKit
import AuthenticationServices
import CryptoKit
import Foundation
import Security

private let exchangeIdleSeconds: TimeInterval = 600
private let exchangeRetentionSeconds: TimeInterval = 86400

final class CredentialExchange {
    func capability() -> [String: Any] {
        guard #available(macOS 26.0, *) else { return ["supported": false, "reason": "macos26-required"] }
        var code: SecCode?
        var information: CFDictionary?
        var staticCode: SecStaticCode?
        guard SecCodeCopySelf([], &code) == errSecSuccess, let code,
              SecCodeCopyStaticCode(code, [], &staticCode) == errSecSuccess, let staticCode,
              SecCodeCopySigningInformation(staticCode, SecCSFlags(rawValue: kSecCSSigningInformation), &information) == errSecSuccess,
              let information = information as? [String: Any] else { return ["supported": false, "reason": "signing-identity-unavailable"] }
        let entitlements = information[kSecCodeInfoEntitlementsDict as String] as? [String: Any] ?? [:]
        let entitled = entitlements["com.apple.developer.authentication-services.autofill-credential-provider"] as? Bool == true
        return ["supported": entitled, "reason": entitled ? "os-registration-unverified" : "os-authorized-signing-required"]
    }
    private struct Session {
        let id: String
        let accountId: Int64
        let profileId: String
        let vaultId: String
        let created: Date
        var updated: Date
        var state = "waiting"
        var records: [[String: Any]] = []
        var cursor = 0
        var pendingCount: Int?
        var receiptId: String?
        var passwordTotal = 0
        var passkeyTotal = 0
        var passwordCompleted = 0
        var passkeyCompleted = 0
        var unsupported: [String: Int] = [:]
        var task: Task<Void, Never>?
    }
    private let lock = NSLock()
    private var sessions: [String: Session] = [:]
    private var activeId: String?

    private func expire() {
        let now = Date()
        for (id, var session) in sessions {
            let elapsed = now.timeIntervalSince(session.updated)
            if ["waiting", "importing", "ready"].contains(session.state), elapsed >= exchangeIdleSeconds {
                session.task?.cancel(); session.task = nil; session.records.removeAll()
                session.state = "timeout"; session.updated = now; sessions[id] = session
                if activeId == id { activeId = nil }
            } else if !["waiting", "importing", "ready"].contains(session.state), elapsed >= exchangeRetentionSeconds {
                sessions.removeValue(forKey: id)
            }
        }
    }
    private func status(_ session: Session) -> [String: Any] {
        ["sessionId": session.id, "state": session.state, "createdAt": session.created.timeIntervalSince1970 * 1000,
         "updatedAt": session.updated.timeIntervalSince1970 * 1000, "passwordTotal": session.passwordTotal,
         "passkeyTotal": session.passkeyTotal, "passwordCompleted": session.passwordCompleted,
         "passkeyCompleted": session.passkeyCompleted, "unsupported": session.unsupported, "cursor": session.cursor, "receiptId": session.receiptId ?? NSNull()]
    }
    func execute(_ method: String, _ params: [String: Any]) throws -> [String: Any] {
        guard #available(macOS 26.0, *) else { throw HelperError("PRECONDITION_FAILED", "Native credential exchange requires macOS 26 or newer") }
        lock.lock(); defer { lock.unlock() }
        expire()
        if method == "exchange.begin" {
            guard capability()["supported"] as? Bool == true else { throw HelperError("PRECONDITION_FAILED", "Native credential exchange requires an OS-authorized credential provider signature; this local helper is not eligible") }
            let id = try requiredString(params, "sessionId", limit: 36)
            guard UUID(uuidString: id) != nil, sessions[id] == nil else { throw HelperError("BAD_REQUEST", "Use a fresh exchange session identity") }
            let account = try requiredNumber(params, "accountId", range: 0...9007199254740991)
            guard account.rounded() == account else { throw HelperError("BAD_REQUEST", "Invalid exchange account") }
            guard params["browserMode"] as? String == "default" else { throw HelperError("FORBIDDEN", "Native credential import requires an ordinary browser context") }
            let profile = try requiredString(params, "profileId", limit: 256)
            let vault = try requiredString(params, "vaultId", limit: 128)
            guard activeId == nil else { throw HelperError("CONFLICT", "Finish or cancel the active native exchange first") }
            guard sessions.count < 64 else { throw HelperError("RESOURCE_EXHAUSTED", "Too many retained native exchange sessions") }
            let now = Date(), session = Session(id: id, accountId: Int64(account), profileId: profile, vaultId: vault, created: now, updated: now)
            sessions[id] = session; activeId = id
            return status(session)
        }
        let id = try requiredString(params, "sessionId", limit: 36)
        guard var session = sessions[id] else { throw HelperError("NOT_FOUND", "Native exchange session expired or is unavailable") }
        if ["exchange.read", "exchange.ack", "exchange.finish"].contains(method) {
            guard let receipt = session.receiptId, params["receiptId"] as? String == receipt else { throw HelperError("FORBIDDEN", "Accept the current exchange receipt before accessing credentials") }
        }
        switch method {
        case "exchange.status": return status(session)
        case "exchange.cancel":
            session.task?.cancel(); session.task = nil; session.records.removeAll(); session.state = "cancelled"; session.updated = Date()
            sessions[id] = session; if activeId == id { activeId = nil }; return status(session)
        case "exchange.read":
            guard session.state == "ready", let receipt = session.receiptId else { throw HelperError("PRECONDITION_FAILED", "Native exchange credentials are not ready") }
            let cursor = Int(try requiredNumber(params, "cursor", range: 0...10000))
            guard cursor == session.cursor else { throw HelperError("CONFLICT", "Native exchange cursor changed") }
            var records: [[String: Any]] = [], bytes = 0
            for record in session.records.dropFirst(cursor).prefix(32) {
                let size = try JSONSerialization.data(withJSONObject: record).count
                if bytes + size > 512 * 1024 { break }
                records.append(record); bytes += size
            }
            guard !records.isEmpty || cursor == session.records.count else { throw HelperError("RESOURCE_EXHAUSTED", "An exchanged credential exceeds the private batch limit") }
            if session.pendingCount == nil { session.updated = Date() }
            session.pendingCount = records.count; sessions[id] = session
            return ["sessionId": id, "receiptId": receipt, "cursor": cursor, "records": records, "done": cursor + records.count == session.records.count]
        case "exchange.ack":
            guard session.state == "ready" else { throw HelperError("PRECONDITION_FAILED", "Native exchange is no longer accepting progress") }
            let cursor = Int(try requiredNumber(params, "cursor", range: 0...10000))
            let count = Int(try requiredNumber(params, "count", range: 1...32))
            guard cursor == session.cursor, session.pendingCount == count, cursor + count <= session.records.count else { throw HelperError("CONFLICT", "Native exchange acknowledgment is stale") }
            for index in cursor..<(cursor + count) {
                if session.records[index]["kind"] as? String == "password" { session.passwordCompleted += 1 }
                else { session.passkeyCompleted += 1 }
                session.records[index].removeAll()
            }
            session.cursor += count; session.pendingCount = nil; session.updated = Date(); sessions[id] = session
            return status(session)
        case "exchange.finish":
            guard session.state == "ready", session.cursor == session.records.count else { throw HelperError("CONFLICT", "Native exchange has unaccepted credentials") }
            guard session.passwordTotal + session.passkeyTotal > 0 else { throw HelperError("PRECONDITION_FAILED", "The source provided no supported passwords or passkeys") }
            session.records.removeAll(); session.task = nil; session.state = "succeeded"; session.updated = Date(); sessions[id] = session
            if activeId == id { activeId = nil }; return status(session)
        default: throw HelperError("NOT_IMPLEMENTED", "Unknown native exchange operation")
        }
    }
    @available(macOS 26.0, *)
    @MainActor func receive(_ token: UUID) -> Bool {
        lock.lock(); expire()
        guard let id = activeId, var session = sessions[id], session.state == "waiting" else { lock.unlock(); return false }
        session.state = "importing"; session.updated = Date(); sessions[id] = session; lock.unlock()
        let task = Task { @MainActor in
            do {
                let data = try await ASCredentialImportManager().importCredentials(token: token)
                try Task.checkCancellation()
                let normalized = try normalizeExchange(data)
                self.complete(id, records: normalized.records, unsupported: normalized.unsupported)
            } catch { self.fail(id) }
        }
        lock.lock()
        if sessions[id]?.state == "importing" { sessions[id]?.task = task } else { task.cancel() }
        lock.unlock()
        return true
    }
    private func complete(_ id: String, records: [[String: Any]], unsupported: [String: Int]) {
        lock.lock(); defer { lock.unlock() }; expire()
        guard activeId == id, var session = sessions[id], session.state == "importing" else { return }
        session.records = records; session.unsupported = unsupported; session.receiptId = UUID().uuidString
        session.passwordTotal = records.filter { $0["kind"] as? String == "password" }.count
        session.passkeyTotal = records.count - session.passwordTotal
        session.state = "ready"; session.updated = Date(); sessions[id] = session
    }
    private func fail(_ id: String) {
        lock.lock(); defer { lock.unlock() }; expire()
        guard activeId == id, var session = sessions[id], session.state == "importing" else { return }
        session.records.removeAll(); session.task = nil; session.state = "failed"; session.updated = Date(); sessions[id] = session; activeId = nil
    }
}
let credentialExchange = CredentialExchange()

@available(macOS 26.0, *)
func normalizeExchange(_ data: ASExportedCredentialData) throws -> (records: [[String: Any]], unsupported: [String: Int]) {
    guard data.formatVersion == .v1, data.accounts.count <= 1000 else { throw HelperError("BAD_REQUEST", "Unsupported credential exchange format or size") }
    var records: [[String: Any]] = [], unsupported: [String: Int] = [:]
    var totalBytes = 0, visited = 0, itemCount = 0
    for account in data.accounts { for item in account.items {
        itemCount += 1
        guard itemCount <= 10000 else { throw HelperError("RESOURCE_EXHAUSTED", "Credential exchange exceeds 10,000 items") }
        guard item.credentials.count <= 10000 - visited else { throw HelperError("RESOURCE_EXHAUSTED", "Credential exchange exceeds 10,000 entries") }
        guard (item.scope?.urls.count ?? 0) <= 100 else { throw HelperError("RESOURCE_EXHAUSTED", "Too many credential scope addresses") }
        let urls = item.scope?.urls.map(\.absoluteString) ?? []
        var noteParts: [String] = [], noteBytes = 0
        for credential in item.credentials {
            if case .note(let note) = credential {
                noteBytes += note.content.value.utf8.count + 1
                guard noteBytes <= 512 * 1024 else { throw HelperError("RESOURCE_EXHAUSTED", "Exchanged notes exceed the private batch limit") }
                noteParts.append(note.content.value)
            }
        }
        let notes = noteParts.joined(separator: "\n")
        for (index, credential) in item.credentials.enumerated() {
            visited += 1
            guard visited <= 10000 else { throw HelperError("RESOURCE_EXHAUSTED", "Credential exchange exceeds 10,000 entries") }
            let sourceId = SHA256.hash(data: Data("\(account.id.base64EncodedString()).\(item.id.base64EncodedString()).\(index)".utf8)).map { String(format: "%02x", $0) }.joined()
            var record: [String: Any] = ["sourceId": sourceId, "title": item.title, "subtitle": item.subtitle ?? "", "urls": urls, "tags": item.tags, "favorite": item.favorite]
            switch credential {
            case .basicAuthentication(let password):
                guard let secret = password.password?.value, !secret.isEmpty else { unsupported["password-without-value", default: 0] += 1; continue }
                record["kind"] = "password"; record["username"] = password.userName?.value ?? ""; record["password"] = secret; record["notes"] = notes
            case .passkey(let passkey):
                if #available(macOS 26.4, *), passkey.fido2Extensions != nil { unsupported["passkey-extensions", default: 0] += 1; continue }
                record["kind"] = "passkey"; record["credentialId"] = passkey.credentialID.base64EncodedString(); record["rpId"] = passkey.relyingPartyIdentifier
                record["userName"] = passkey.userName; record["displayName"] = passkey.userDisplayName; record["userId"] = passkey.userHandle.base64EncodedString(); record["privateKey"] = passkey.key.base64EncodedString()
            case .note:
                if !item.credentials.contains(where: { if case .basicAuthentication = $0 { return true }; return false }) { unsupported["note", default: 0] += 1 }
                continue
            case .address: unsupported["address", default: 0] += 1; continue
            case .apiKey: unsupported["api-key", default: 0] += 1; continue
            case .creditCard: unsupported["card", default: 0] += 1; continue
            case .customFields: unsupported["custom-fields", default: 0] += 1; continue
            case .driversLicense: unsupported["drivers-license", default: 0] += 1; continue
            case .generatedPassword: unsupported["generated-password", default: 0] += 1; continue
            case .identityDocument: unsupported["identity-document", default: 0] += 1; continue
            case .itemReference: unsupported["item-reference", default: 0] += 1; continue
            case .passport: unsupported["passport", default: 0] += 1; continue
            case .personName: unsupported["person-name", default: 0] += 1; continue
            case .sshKey: unsupported["ssh-key", default: 0] += 1; continue
            case .totp: unsupported["totp", default: 0] += 1; continue
            case .wifi: unsupported["wifi", default: 0] += 1; continue
            @unknown default: unsupported["unknown", default: 0] += 1; continue
            }
            if let created = item.created { record["createdAt"] = created.timeIntervalSince1970 * 1000 }
            let recordBytes = try JSONSerialization.data(withJSONObject: record).count
            guard recordBytes <= 512 * 1024 else { throw HelperError("RESOURCE_EXHAUSTED", "An exchanged credential exceeds the private batch limit") }
            totalBytes += recordBytes
            guard totalBytes <= 16 * 1024 * 1024 else { throw HelperError("RESOURCE_EXHAUSTED", "Credential exchange exceeds the in-memory limit") }
            records.append(record)
        }
    } }
    return (records, unsupported)
}
