# Original pre-worker Chromium source capture

This closes the actual input boundary between the real WebUI Handler and the mode0 coordinator. It layers the immutable worker `9477435e4` and coordinator `ff5e29787` outputs; root can rebase any separate compilation adaptations. It is an uncompiled/unmounted source proposal.

The Handler now calls `ChromiumNewTargetImport::Start` with only `{source, source_profile, selected_profile_name}`. It does not supply, derive, reconstruct or fabricate a source password. Start posts `CaptureChromiumNewTargetSource` on the actual MayBlock worker and its weak UI reply proceeds to target reservation/attributes and the full copied-profile worker.

This is the original42530c0 →425957c →42534e8 ordering. Provider admission is exact: Atlas enum2 bypasses first; mode0 does not set the mode1 bookmarks-only flag; an actual source directory and at least one of Login Data, Login Data For Account, Cookies or Network/Cookies are required before the provider is called. A missing/denied/unsupported result remains absent. The original worker rechecks its own real encrypted-store admission after reservation, and fails normally if the source changed to require a key. There is no retry or second lookup after copying.

`CaptureSourcePassword` calls the same real `crypto::apple::KeychainV2::FindGenericPassword(service,account)` with the six existing source-proven selector pairs. Original426abd0 does not support Edge, so this new mode0 boundary returns absent for Edge rather than using the older independent generic fallback. Atlas never reaches the provider. No destination OSCrypt, installation key, mock-success key, DP family or alternative authority is consulted.

Successful raw provider bytes are admitted exactly, including an empty vector and embedded NUL; original426afe4 only branches between SSO/storage forms and426b048 sets presence even for length0. There is no original4096/nonempty/UTF8 admission rule at this boundary. The existing unrelated mode1 `AuthorizeSourceKey` implementation is left unchanged by this patch rather than silently broadening every importer call.

The private transfer type is `CapturedSourcePassword`, a noncopyable vector-backed owner. Move transfers the actual byte buffer; destruction and overwrite call the same existing BoringSSL cleanse primitive. This avoids copying secret bytes through a public DTO or leaving std::string SSO residue. Empty `view()` supplies a valid empty byte string to the existing derivation. The original worker alone calls `DeriveSourceKey(view())`, then resets/cleanses the raw capture; its derived `SourceKey` already has its own existing cleanse destructor. A dropped weak provider reply also destroys/cleanses the capture. No credentials are included in completion results, errors, extension events or RPC.

## Integration

Add `chromium_source_capture.cc` to the same native import target. Existing source_crypto.h/.mm gains the native byte owner and raw provider function; its existing provider selectors, derived-key API and mode1 callers are otherwise unchanged. Worker h/cc changes only the private captured type/view. Coordinator h/cc changes Start to the actual capture/reply phases before reservation. The existing real CreateProfileAsync, destination callbacks and L4 completion/window binding are preserved.

`manifest.json` pins eight outputs: two new capture files plus six existing source/provider/worker/coordinator files. Existing baselines have explicit count-checked anchors and whole-file hashes. The new public Handler selection no longer has a raw-password field.

## Evidence

`source-evidence.json` pins the complete original arm64 image, full bounded dispatch/reply/provider/admission/worker assembly, exact selector bytes, complete original Start/StartPreparation decompiles and actual155 KeychainV2/cleanse APIs. `python3 verify.py` passed the source hashes and exact eight-file patch replay. It did not execute a provider, worker, key derivation, DB, profile, OS or Keychain operation. Native compilation and actual original permission/import behavior remain unverified.
