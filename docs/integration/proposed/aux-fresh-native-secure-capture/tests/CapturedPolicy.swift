// Fixture-only captured policy API. This is NOT the authenticated reader and
// proves no signature acceptance. Production typecheck compiles the real reader.
import Foundation

enum CapturedPolicyError: Error { case changed }
struct AuxAuthenticatedFreshBootstrapPolicy {
    let contents: AuxFreshBootstrapPolicyContents
    let policySha256 = String(repeating: "a", count: 64)
    let bundlePath = "/synthetic/Aux.app"
    let hostCdHash = "synthetic"
    func revalidateCurrentIdentity() throws {
        CapturedPolicyState.calls += 1
        if CapturedPolicyState.failAt == CapturedPolicyState.calls { throw CapturedPolicyError.changed }
    }
}
enum CapturedPolicyState {
    static var calls = 0
    static var failAt: Int?
}
enum AuxFreshSecureCaptureFixture {
    static var calls = 0
    static var effect: (AuxFreshSecureSelector) throws -> AuxFreshSecureObservation = { _ in .absent }
    static func read(_ selector: AuxFreshSecureSelector) throws -> AuxFreshSecureObservation {
        calls += 1
        return try effect(selector)
    }
}
