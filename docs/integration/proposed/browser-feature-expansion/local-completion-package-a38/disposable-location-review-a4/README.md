# Fresh disposable location — narrow scope review

The owner-approved emptiness-only check found the original Aux Browser support
container **nonempty**. It was not moved; no files or entry names were read or
reported. The current signed A38 app and accepted app are unchanged.

The smallest solution is a separate fixed test namespace, not adoption or
cleanup of that existing folder. Proposed roots:

- `/Users/rcourson/Library/Application Support/Aux Browser A38 Disposable`
- `/Users/rcourson/Library/Caches/Aux Browser A38 Disposable`

Metadata-only preflight currently finds both absent. Nothing is created.

`review.json` and `fixed-test-location.patch` pin exactly15 literal replacements
in the existing native directory preparer, Chromium main/child directory
selection, macOS cache mapping, and paired Swift OS-user resolver. There are no
UI, CSS, assets, cryptographic labels, entitlement, helper, architecture or
policy-schema changes. Native OS-user derivation and unknown/legacy/partial
state refusal remain in place; no caller-controlled environment/root override
is introduced.

Proposed execution: rebuild the affected existing targets, preserve the current
signed bytes, replace the affected browser/daemon artifacts in this same A38
candidate, and re-sign only its framework, daemon and outer app with the existing
Robert Courson identity/profile/entitlements. Retain the other16 signatures. Then
initialize only the new disposable namespace and its installation/authentication
entries and run the already-listed focused app checks. Preserve the accepted UI
and fix demonstrated failures only within that same bounded milestone.

This needs owner approval because the previous exact review authorized only the
original Aux Browser namespace, and the latest instruction permits moving that
folder only if empty. It authorizes no access to the nonempty folder, owner
profiles/credentials, new signing objects, OS grants, provisioning or release.
No source has been projected into the build tree, compiled, signed or executed
for this proposal.
