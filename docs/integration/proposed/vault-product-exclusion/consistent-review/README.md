# Generated daemon source consistency — prepared local review

The approved two-leaf daemon review changed the SEA executable and builtin skill. Production staging also generates `Contents/Resources/node-development/index.mjs` from the adapted SEA source. The old signed review retained that generated file, causing exact resource validation to reject589. Neither guard nor signature verification was bypassed.

The corrected copied candidate is `out/vault-exclusion-consistent-unsigned-v589/Aux Daemon.app`. Its generated source applies exactly the same five reviewed Vault exclusion edits, each once, and equals the production589 generated output byte for byte. No additional behavior change or native runtime/addon modification is introduced. Relative to the original daemon, three leaves change instead of two;140 remain unchanged. Existing profiles, seven entitlements, installation authority and other helpers remain unchanged. Original unsigned and signed reviews are preserved.

Review: `out/vault-exclusion-consistent-unsigned-v589/review.json`, SHA256 `b13b0f0e5bab17bd53bae61be402dfc6b9a5efce2509b3f70179cf16c899c3e6`.

Additional generated file before SHA256 `13722f1922f633796b7fc334301318339ee0b10b05b264802e6bacb48aaff635`; after `420e50d0ec08411b738eb7f74e34e56ca0719c152431f1f5abffde5cdb219306`.

Prepared only: no new signing or launch. The applicable exception was for the exact two-leaf review, so this third leaf needs the owner's approval before renewing the same copied daemon's local development signature. No provisioning, release, other helper signing, owner data access or OS grant is proposed. After approval, validate complete candidate inventory, reuse the same identity/entitlements and existing scope, refresh the resource cache using the new exact receipt and perform the previously approved focused local acceptance.
