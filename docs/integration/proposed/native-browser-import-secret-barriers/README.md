# Original live destination password/cookie completion join

Incremental source-only two-file proposal after full staging+history. No source-profile, credential, Keychain, OS, runtime, build or shared native operation was performed. Not compiled/runtime accepted.

## Original owner

Supplied destination4258618 dispatches both secret groups against its captured real target Profile. Cookies use actual CookieManager::SetCanonicalCookie and a real count-based BarrierClosure; its callback425f838 runs the barrier without inspecting CookieAccessResult. Passwords use the actual native PasswordStore::AddLogins vector completion callback. Callbacks4258c60 and4258c6c set separate flags at owner+0x11/+0x12 and enter4258c80. The real one-shot job completion is consumed only after both flags are set; its boolean true describes native completion, not per-cookie OS/server acceptance. Empty/missing groups settle their actual flags without fabricating a pending operation.

Current independent per-category SecretLookup performs a separate destination lookup/skip for every password and serially applies cookies afterward, failing early on individual rejection. Those are different owner operations and completion ordering.

## Concrete port

For supplied staged Chromium jobs, both remaining secret snapshots are prepared against existing native metadata/model/policy validation, then passwords enter actual `PasswordStoreInterface::AddLogins` and cookies enter real CookieManager calls with BarrierClosure. Both groups can progress concurrently. Genuine weak service/captured-Profile and cancellation checks guard every completion. Completion is one-shot and waits for both actual groups; it never reports an enqueue call as a finished native operation.

The actual password store is retained through its real callback. Native cookie result callbacks are joined even when a cookie is excluded, matching original callback semantics. The existing `importedRows` counter increments only for explicitly included cookie results; a void password completion does not invent per-row accepted counts. Job `succeeded` remains the original native-operation completion meaning, with no delivery claim. The native SecretLookup path remains for Firefox/Safari/internal recovery WebUI; the supplied Chromium branch no longer uses its independent lookup/skip behavior.

Cancellation clears staged secret material and ignores late UI completion. Already dispatched native writes are not pretended undone; this matches the source's weak-callback cancellation boundary. Profile destruction invalidates the service weak pointers; callbacks do not select a replacement/current profile. The existing destination password policy/store availability and canonical-cookie/text/bounds validation are retained as current platform boundaries, and are not represented as original per-row acceptance rules.

## Remaining scope

This ports the actual completion owner and batch APIs. It does not complete original extension installation, Arc sidebar augmentation, every PasswordForm metadata field, all original availability/policy skip branches, or original canonical-cookie source filtering. The current adapters still reject malformed destination metadata; no success stub or default authority is introduced. Mode0 new-profile clone remains separate.

## Integration / proof

service.cc baseline is exact9b8bc6024 history-owner output; service.h baseline is exactd2c144467 full-staging output. Root must preserve its discovery/current code changes when rebasing exact owner hunks. Existing `base` and native importer deps suffice; only new header is `base/barrier_closure.h`, no GN/new target.

Raw `destination-start.asm`, `joined-completion.asm`, `cookie-barrier-callback.asm` plus provided04258618.c/04258c80.c and current155 PasswordStoreInterface definitions are pinned. `verify.py` replays against explicit parent proposal files in a temporary tree and hashes the original static inputs. Root owns focused native compilation; no OS or owner data fixtures were run.
