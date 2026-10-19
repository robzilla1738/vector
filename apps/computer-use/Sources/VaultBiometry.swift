import Foundation
import Security
import LocalAuthentication

private let vaultService = "Aux Vault"
func biometricAvailability() -> [String: Any] {
    let context = LAContext()
    var error: NSError?
    let available = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    return ["available": available, "kind": context.biometryType == .touchID ? "touch-id" : "none", "reason": available ? NSNull() : (error?.localizedDescription ?? "Biometry is unavailable")]
}
private func vaultQuery(_ identity: String) -> [String: Any] { [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: vaultService, kSecAttrAccount as String: identity, kSecAttrSynchronizable as String: false] }
private func verifyBiometry(_ reason: String) throws {
    let context = LAContext()
    context.localizedFallbackTitle = ""
    var error: NSError?
    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else { throw HelperError("PRECONDITION_FAILED", "Biometry is unavailable or not enrolled in macOS") }
    let semaphore = DispatchSemaphore(value: 0)
    var allowed = false
    context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in allowed = success; semaphore.signal() }
    guard semaphore.wait(timeout: .now() + 120) == .success else { context.invalidate(); throw HelperError("TIMEOUT", "Biometry timed out") }
    guard allowed else { throw HelperError("FORBIDDEN", "Biometric verification was cancelled or denied") }
}
func vaultBiometry(_ method: String, _ params: [String: Any]) throws -> [String: Any] {
    let identity = try accountIdentity(params)
    var query = vaultQuery(identity)
    switch method {
    case "vault.biometryStatus":
        query[kSecReturnAttributes as String] = true
        let context = LAContext()
        context.interactionNotAllowed = true
        query[kSecUseAuthenticationContext as String] = context
        let status = SecItemCopyMatching(query as CFDictionary, nil)
        if status != errSecSuccess && status != errSecItemNotFound && status != errSecInteractionNotAllowed && status != errSecAuthFailed { throw HelperError("KEYCHAIN_ERROR", "Keychain status could not be inspected (\(status))") }
        return biometricAvailability().merging(["enrolled": status != errSecItemNotFound]) { _, new in new }
    case "vault.biometryEnroll":
        let encoded = try requiredString(params, "key", limit: 128)
        guard var key = Data(base64Encoded: encoded), key.count == 32, key.base64EncodedString() == encoded else { throw HelperError("BAD_REQUEST", "Vault key must be exactly 32 bytes in base64") }
        defer { key.resetBytes(in: 0..<key.count) }
        try verifyBiometry("Protect your Aux vault with Touch ID")
        var error: Unmanaged<CFError>?
        guard let control = SecAccessControlCreateWithFlags(nil, kSecAttrAccessibleWhenUnlockedThisDeviceOnly, .biometryCurrentSet, &error) else { throw HelperError("KEYCHAIN_ERROR", "Could not create biometric key protection") }
        query[kSecAttrAccessControl as String] = control
        query[kSecValueData as String] = key
        query[kSecAttrLabel as String] = "Aux vault biometric unlock"
        let status = SecItemAdd(query as CFDictionary, nil)
        if status == errSecDuplicateItem { throw HelperError("CONFLICT", "Biometric unlock is already enrolled; remove it before replacing the key") }
        guard status == errSecSuccess else { throw HelperError("KEYCHAIN_ERROR", "Could not enroll biometric unlock (\(status))") }
        return ["available": true, "enrolled": true]
    case "vault.biometryUnlock":
        let context = LAContext()
        context.localizedReason = "Unlock your Aux vault"
        context.localizedFallbackTitle = ""
        query[kSecUseAuthenticationContext as String] = context
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var value: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &value)
        guard status == errSecSuccess, var key = value as? Data, key.count == 32 else { throw HelperError(status == errSecItemNotFound ? "NOT_FOUND" : "FORBIDDEN", "Biometric vault unlock was unavailable, cancelled, or denied") }
        defer { key.resetBytes(in: 0..<key.count) }
        return ["key": key.base64EncodedString()]
    case "vault.biometryRemove":
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw HelperError("KEYCHAIN_ERROR", "Could not remove biometric enrollment (\(status))") }
        return biometricAvailability().merging(["enrolled": false]) { _, new in new }
    default: throw HelperError("NOT_IMPLEMENTED", "Unknown vault helper method")
    }
}
