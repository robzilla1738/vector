// Source-recovered query descriptions only. No Security operations are invoked.
// Not an authority adapter or permission to read/write any installation.
import Foundation
import Security

struct ExplicitInstallSelector {
    // All three values must come from a separately reviewed authority selection.
    // No default group, HOME hash mapping, namespace rewrite or fallback exists.
    let service: String
    let account: String
    let accessGroup: String
}

enum RecoveredInstallStorageQueries {
    // Original installBaseQuery at 0x32b98, five attributes.
    static func base(_ selector: ExplicitInstallSelector) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: selector.service,
         kSecAttrAccount as String: selector.account,
         kSecAttrAccessGroup as String: selector.accessGroup,
         kSecUseDataProtectionKeychain as String: true]
    }
    // Original installRead at 0x331cc. Does not request attributes/ACL or suppress UI.
    static func read(_ selector: ExplicitInstallSelector) -> [String: Any] {
        var query = base(selector)
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        return query
    }
    // Only the original ADD payload at 0x32e80..0x32ff8. This is not installSave:
    // original installSave first deletes the selected item and ignores that status.
    // No delete, add, update, replacement, reset or persistence executor is exposed.
    static func addPayload(_ selector: ExplicitInstallSelector, data: Data) -> [String: Any] {
        var query = base(selector)
        query[kSecValueData as String] = data
        query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        return query
    }
    // Original createInstallAccessControl at 0x33614 is separate from item storage.
    // Describes arguments only; does NOT create an access-control object.
    static let authorityProtection = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    static let authorityFlags: SecAccessControlCreateFlags = .privateKeyUsage // 0x40000000
}

enum CapturedInstallRead {
    case data(Data)
    case missing
    case securityFailure(OSStatus)
    case invalidSuccessResult

    // Pure projection of a result captured elsewhere. Preserve status distinctions
    // that the original optional-return helper discards, for future migration review.
    static func classify(status: OSStatus, result: Any?) -> CapturedInstallRead {
        if status == errSecItemNotFound { return .missing }
        guard status == errSecSuccess else { return .securityFailure(status) }
        guard let data = result as? Data else { return .invalidSuccessResult }
        return .data(data)
    }
    // Original installRead semantics: every failure projects to nil. A nil here
    // must never authorize fresh initialization or establish authority absence.
    var originalOptionalProjection: Data? {
        if case .data(let value) = self { return value }
        return nil
    }
}
