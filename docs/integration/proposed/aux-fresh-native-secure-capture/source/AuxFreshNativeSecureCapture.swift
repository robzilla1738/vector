// Inactive native capture producer. Calling capture performs real DP reads;
// fixtures replace only those effects and authenticated-policy observation.
import Foundation
import Security

// Captured statuses are not permissions, writer custody or an authority grant.
enum AuxFreshSecureObservation {
    case absent
    case present
    case unavailable(OSStatus)
    case invalid
}
enum AuxFreshSecureCaptureError: Error {
    case binding
    case present(AuxFreshSecureRow)
    case unavailable(AuxFreshSecureRow, OSStatus)
    case invalid(AuxFreshSecureRow)
}
enum AuxFreshSecureRow: String, CaseIterable {
    case metadata, signing, kem, wrappedRoot, secureStage
}
struct AuxFreshSecureSelector {
    let row: AuxFreshSecureRow
    let service: String
    let account: String
    let accessGroup: String
    fileprivate init(row: AuxFreshSecureRow, service: String, account: String, group: String) {
        self.row = row
        self.service = service
        self.account = account
        accessGroup = group
    }
}

final class AuxFreshNativeSecureCapture {
    let policy: AuxAuthenticatedFreshBootstrapPolicy
    let home: AuxFreshNativeHome
    let selectors: [AuxFreshSecureSelector]
    var targetSelectors: [AuxFreshSecureSelector] { Array(selectors.prefix(4)) }
    var stageSelector: AuxFreshSecureSelector { selectors[4] }
    var scope: String { home.scope }
    var transactionId: String { home.transactionId }

    private init(
        policy: AuxAuthenticatedFreshBootstrapPolicy,
        home: AuxFreshNativeHome, selectors: [AuxFreshSecureSelector]
    ) {
        self.policy = policy
        self.home = home
        self.selectors = selectors
    }

    // No selector, scope, absence flag, policy path or review receipt parameter.
    // This authenticates host content and captures actual absence only; the
    // missing early native launch/custody consumer remains a separate boundary.
    static func capture(
        policy: AuxAuthenticatedFreshBootstrapPolicy, home: AuxFreshNativeHome
    ) throws -> AuxFreshNativeSecureCapture {
        try validate(policy: policy, home: home)
        let selectors = try fixedSelectors(
            scope: home.scope, transactionId: home.transactionId,
            accessGroup: policy.contents.accessGroup
        )
        try readAbsent(selectors)
        try validate(policy: policy, home: home)
        return AuxFreshNativeSecureCapture(policy: policy, home: home, selectors: selectors)
    }

    // Facts may become stale; factory integration must recapture immediately
    // before generation and retain the real native home/host ownership.
    func takeAbsentForGeneration() throws {
        try home.claimInitialAuthorityGenerationAttempt()
        try Self.validate(policy: policy, home: home)
        try Self.readAbsent(selectors)
        try Self.validate(policy: policy, home: home)
    }

    private static func validate(
        policy: AuxAuthenticatedFreshBootstrapPolicy, home: AuxFreshNativeHome
    ) throws {
        try policy.revalidateCurrentIdentity()
        try home.requireEmptyBeforeAuthorityGeneration()
        let parent = URL(fileURLWithPath: home.canonicalHome).deletingLastPathComponent().path
        guard parent == policy.contents.canonicalPrivateParent,
              home.scope == freshBootstrapDigest(Data(home.canonicalHome.utf8)),
              UUID(uuidString: home.transactionId)?.uuidString == home.transactionId,
              AuxFreshBootstrapPolicyContents.validAccessGroup(policy.contents.accessGroup)
        else { throw AuxFreshSecureCaptureError.binding }
    }

    // Source-known AuxRuntimeSelection selector layout plus exact secure stage.
    // This pure builder does not construct a capture or assert any absence.
    static func fixedSelectors(
        scope: String, transactionId: String, accessGroup: String
    ) throws -> [AuxFreshSecureSelector] {
        guard scope.utf8.count == 64,
              scope.utf8.allSatisfy({ (48...57).contains($0) || (97...102).contains($0) }),
              UUID(uuidString: transactionId)?.uuidString == transactionId,
              AuxFreshBootstrapPolicyContents.validAccessGroup(accessGroup)
        else { throw AuxFreshSecureCaptureError.binding }
        let installation = "aux." + scope + ".installation.v2"
        var selected: [AuxFreshSecureSelector] = []
        let rows: [(AuxFreshSecureRow, String)] = [
            (.metadata, "meta"), (.signing, "sig"), (.kem, "kem"), (.wrappedRoot, "dk"),
        ]
        for (row, suffix) in rows {
            selected.append(.init(
                row: row, service: installation, account: installation + "." + suffix,
                group: accessGroup
            ))
        }
        selected.append(.init(
            row: .secureStage, service: "aux." + scope + ".install.secure-stage.v1",
            account: "aux." + scope + ".fresh." + transactionId.lowercased(), group: accessGroup
        ))
        return selected
    }

    static func readQuery(_ selector: AuxFreshSecureSelector) -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: selector.service,
            kSecAttrAccount as String: selector.account,
            kSecAttrAccessGroup as String: selector.accessGroup,
            kSecUseDataProtectionKeychain as String: true,
            kSecUseAuthenticationUI as String: kSecUseAuthenticationUIFail,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
    }

    static func classify(status: OSStatus, result: CFTypeRef?) -> AuxFreshSecureObservation {
        if status == errSecItemNotFound {
            // Preserve actual absence; contradictory captured output is invalid.
            return result == nil ? .absent : .invalid
        }
        guard status == errSecSuccess else { return .unavailable(status) }
        guard let result, CFGetTypeID(result) == CFDataGetTypeID() else { return .invalid }
        let data = result as! CFData
        guard CFDataGetLength(data) > 0, CFDataGetLength(data) <= 16_384 else { return .invalid }
        return .present
    }

    private static func readAbsent(_ selectors: [AuxFreshSecureSelector]) throws {
        for selector in selectors {
            let observation: AuxFreshSecureObservation
#if AUX_FRESH_SECURE_CAPTURE_FIXTURE
            observation = try AuxFreshSecureCaptureFixture.read(selector)
#else
            var result: CFTypeRef?
            let status = SecItemCopyMatching(readQuery(selector) as CFDictionary, &result)
            observation = classify(status: status, result: result)
#endif
            switch observation {
            case .absent: continue
            case .present: throw AuxFreshSecureCaptureError.present(selector.row)
            case .unavailable(let status):
                throw AuxFreshSecureCaptureError.unavailable(selector.row, status)
            case .invalid: throw AuxFreshSecureCaptureError.invalid(selector.row)
            }
        }
    }
}
