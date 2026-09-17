//! Signed update verification (VEC-014).
//!
//! Manifest bytes are Ed25519-signed. A missing or invalid signature is a
//! failed update, never an unsigned fallback.

use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};

/// A development or packaged update key pair.
#[derive(Clone, Debug)]
pub struct UpdateKeyPair {
    /// 32-byte seed.
    pub secret: [u8; 32],
    /// 32-byte verifying key.
    pub public: [u8; 32],
}

impl UpdateKeyPair {
    /// Deterministic pair from a 32-byte seed (tests and bundled channel keys).
    #[must_use]
    pub fn from_seed(secret: [u8; 32]) -> Self {
        let signing = SigningKey::from_bytes(&secret);
        Self {
            secret,
            public: signing.verifying_key().to_bytes(),
        }
    }

    /// Signs `manifest`.
    #[must_use]
    pub fn sign(&self, manifest: &[u8]) -> [u8; 64] {
        SigningKey::from_bytes(&self.secret)
            .sign(manifest)
            .to_bytes()
    }
}

/// Verifies `signature` over `manifest` with `public`.
#[must_use]
pub fn verify_update_manifest(public: &[u8; 32], manifest: &[u8], signature: &[u8]) -> bool {
    let Ok(pk) = VerifyingKey::from_bytes(public) else {
        return false;
    };
    let Ok(sig) = Signature::from_slice(signature) else {
        return false;
    };
    pk.verify(manifest, &sig).is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_signature_verifies_and_tamper_fails() {
        let keys = UpdateKeyPair::from_seed([0x42; 32]);
        let manifest = br#"{"version":"0.0.2","url":"https://updates.vector.test/app"}"#;
        let sig = keys.sign(manifest);
        assert!(verify_update_manifest(&keys.public, manifest, &sig));
        let mut bad = manifest.to_vec();
        bad[10] ^= 1;
        assert!(!verify_update_manifest(&keys.public, &bad, &sig));
        let mut bad_sig = sig;
        bad_sig[0] ^= 1;
        assert!(!verify_update_manifest(&keys.public, manifest, &bad_sig));
        assert!(!verify_update_manifest(&keys.public, manifest, &[]));
    }
}
