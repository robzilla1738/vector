// Fixture-only identity observation. This is NOT the authenticated loader.
// Decoded/public data here supplies no production admission or signature proof.
import Foundation

struct AuxAuthenticatedFreshBootstrapPolicy {
    let contents: AuxFreshBootstrapPolicyContents
    let policySha256 = String(repeating: "b", count: 64)
    let bundlePath = "/synthetic/Aux.app"
    let hostCdHash = "captured-only"
    func revalidateCurrentIdentity() throws { CapturedPolicyEffects.revalidations += 1 }
}
enum CapturedPolicyEffects { static var revalidations = 0 }
