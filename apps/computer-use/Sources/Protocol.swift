import Foundation
import CryptoKit

struct HelperError: Error {
    let code: String
    let message: String
    init(_ code: String, _ message: String) { self.code = code; self.message = message }
}
func requiredString(_ params: [String: Any], _ key: String, limit: Int = 100000) throws -> String {
    guard let value = params[key] as? String, !value.isEmpty, value.utf8.count <= limit, !value.contains("\0") else { throw HelperError("BAD_REQUEST", "Invalid \(key)") }
    return value
}
func requiredNumber(_ params: [String: Any], _ key: String, range: ClosedRange<Double> = -100000...100000) throws -> Double {
    guard let value = params[key] as? NSNumber, CFGetTypeID(value) != CFBooleanGetTypeID(), value.doubleValue.isFinite, range.contains(value.doubleValue) else { throw HelperError("BAD_REQUEST", "Invalid \(key)") }
    return value.doubleValue
}
func accountIdentity(_ params: [String: Any]) throws -> String {
    let accountId = try requiredNumber(params, "accountId", range: 0...9007199254740991)
    guard accountId.rounded() == accountId else { throw HelperError("BAD_REQUEST", "Account ID must be an integer") }
    let vaultId = try requiredString(params, "vaultId", limit: 128)
    guard vaultId.range(of: "^[A-Za-z0-9_-]+$", options: .regularExpression) != nil else { throw HelperError("BAD_REQUEST", "Invalid vault identity") }
    return "\(Int64(accountId)):\(vaultId)"
}
final class HelperProtocol {
    let token: String?
    let nativeMessaging: Bool
    init() {
        token = ProcessInfo.processInfo.environment["AUX_HELPER_AUTH_TOKEN"]
        nativeMessaging = CommandLine.arguments.contains("--native-messaging") || CommandLine.arguments.dropFirst().contains(where: { $0.hasPrefix("chrome-extension://") })
    }
    func requirePrivate(_ request: [String: Any]) throws {
        guard let token, token.utf8.count >= 32, let supplied = request["auth"] as? String else { throw HelperError("UNAUTHORIZED", "This operation requires the daemon-owned private helper pipe") }
        let expectedHash = SHA256.hash(data: Data(token.utf8)), actualHash = SHA256.hash(data: Data(supplied.utf8))
        var different: UInt8 = 0
        for (left, right) in zip(expectedHash, actualHash) { different |= left ^ right }
        guard different == 0 else { throw HelperError("UNAUTHORIZED", "Private helper authorization failed") }
    }
    private func readExactly(_ count: Int) throws -> Data? {
        var result = Data()
        while result.count < count {
            let data = try FileHandle.standardInput.read(upToCount: count - result.count) ?? Data()
            if data.isEmpty { if result.isEmpty { return nil }; throw HelperError("BAD_REQUEST", "Truncated native message") }
            result.append(data)
        }
        return result
    }
    private func readMessage() throws -> Data? {
        if nativeMessaging {
            guard let header = try readExactly(4) else { return nil }
            let length = header.withUnsafeBytes { $0.loadUnaligned(as: UInt32.self).littleEndian }
            guard length > 0, length <= 8 * 1024 * 1024 else { throw HelperError("BAD_REQUEST", "Native request exceeds helper limit") }
            return try readExactly(Int(length))
        }
        var result = Data()
        while true {
            guard let byte = try readExactly(1) else { return result.isEmpty ? nil : result }
            if byte.first == 10 { return result }
            result.append(byte)
            guard result.count <= 8 * 1024 * 1024 else { throw HelperError("BAD_REQUEST", "NDJSON request exceeds helper limit") }
        }
    }
    private func write(_ value: [String: Any]) throws {
        var data = try JSONSerialization.data(withJSONObject: value, options: [.sortedKeys])
        if nativeMessaging {
            guard data.count <= 1024 * 1024 else { throw HelperError("RESOURCE_EXHAUSTED", "Reply exceeds native messaging limit") }
            var length = UInt32(data.count).littleEndian
            try withUnsafeBytes(of: &length) { try FileHandle.standardOutput.write(contentsOf: Data($0)) }
        } else { data.append(10) }
        try FileHandle.standardOutput.write(contentsOf: data)
    }
    func run() {
        if let origin = CommandLine.arguments.dropFirst().first(where: { $0.hasPrefix("chrome-extension://") }) {
            let allowed = Bundle.main.object(forInfoDictionaryKey: "AuxNativeMessagingOrigins") as? [String] ?? []
            guard allowed.contains(origin) else { try? write(["id": NSNull(), "error": ["code": "FORBIDDEN", "message": "Native messaging caller is not an Aux extension"]]); return }
        }
        while true {
            var id: Any = NSNull()
            do {
                guard let data = try readMessage() else { break }
                guard let request = try JSONSerialization.jsonObject(with: data) as? [String: Any], let method = request["method"] as? String else { throw HelperError("BAD_REQUEST", "Expected a helper request object") }
                id = request["id"] ?? NSNull()
                guard id is String || id is NSNumber else { throw HelperError("BAD_REQUEST", "Request ID must be a string or number") }
                let params = request["params"] as? [String: Any] ?? [:]
                if !["ping", "capabilities", "permissions.status", "vault.biometryAvailable"].contains(method) { try requirePrivate(request) }
                let result = try execute(method, params)
                try write(["id": id, "result": result])
            } catch let error as HelperError {
                do { try write(["id": id, "error": ["code": error.code, "message": error.message]]) } catch { break }
            } catch {
                do { try write(["id": id, "error": ["code": "INTERNAL", "message": "Aux helper could not complete the operation"]]) } catch { break }
            }
        }
    }
}
