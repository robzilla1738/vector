# Supplied Safari archive owner recovery

This slice corrects two positively recovered admission mismatches and records the real archive/card owner. It does **not** claim the current independent `safari_archive.cc` implements the supplied importer. Native changes are immutable proposals, not applied to the shared Chromium checkout.

`native.patch` changes two files: Safari publishes an empty profiles array, and startImport accepts Safari without a selected profile or archive fileName. An explicitly supplied profile ID remains optional metadata. Other sources still require a real discovered profile. The existing independent archive limits and category reader remain in this first slice; replacing them with the recovered native owner is required follow-up.

## Original API and phases

The original arm64 framework is pinned in evidence.json. Addresses below refer to that exact image. Retained LLVM instructions supplement Ghidra decompilation; the raw slices lack external data/type mappings, and some decompiler branches terminate early. No owner archive or profile was read.

| Owner | Positive evidence | Actual behavior |
| --- | --- | --- |
| Source descriptor | 04275f50 (parent's already recovered descriptor), 04275fa8 | Safari has profiles=[], requiresFileImport=true, and history/bookmarks/passwords/paymentCards capabilities. There is no fabricated archive profile. |
| Public start | 0427690c..04276968, 04276b34..04276bb8 | sourceProfileId is optional/nonempty when retained. Safari finds safariArchive.data as a nonempty blob; fileName is not read. Explicit dataKinds admits exactly bookmarks; omission means full import. |
| Archive staging | 04279d10..04279ecc | Create temporary directory, append fixed safari-export.zip, write caller's binary bytes. Failure becomes Failed to stage Safari archive. No parsing of the supplied filename. |
| Destination construction | 04279ecc..0427a580, constructor call0427a1d0 | Resolve the actual destination Profile; obtain affiliation service, personal/payment data manager, history, bookmarks, reading list, sync and preferences; create profile/account SavedPasswordsPresenter and a real BookmarkParser; construct SafariDataImporter040edff4. Missing required services fails Safari importer unavailable. |
| Preparation | 0427a43c..0427a4f0, 040ee4ac | Mark running at0.08 and call PrepareImport(path, bookmarksOnly). The supplied extra bool is stored at importer+0x298. Chromium155's current PrepareImport lacks this argument. |
| Ready callbacks | client vtable0xe26ee28; 04278b20/04278c54/04278d94/04279040 | Respectively bookmarks/history/passwords/paymentCards ready. Each marks a real ready flag and publishes currentDataKind. Ready counts do not stand in for imported results. Full import waits all four ready flags. Bookmarks-only waits only bookmarks. |
| Conflict selection | 04278d94..04279040 | Clear previous selected IDs; if successful expected result, append every ImportResults.displayed_entries[].id, preserving source order. This is original conflict selection, not an independently chosen skip-existing policy. |
| Commit boundary | 04278bd4..04278c50 and equivalent ready callbacks | A once flag prevents duplicate CompleteImport. Publish running0.5 and invoke040ef57c(selected_password_ids). |
| Completion callbacks | 0427917c/0427921c/042792c8/04279368 | Respectively bookmarks/history/passwords/paymentCards imported. Each marks the corresponding real completion flag, emits category progress, then checks the terminal barrier. |
| Terminal lifetime | 0427a9cc..0427ab98 | Requires commit-started and all four imported flags (only bookmarks flag for bookmarks-only). Destroy importer before presenter, clear selected IDs, asynchronously delete archive directory, then publish succeeded1.0. Do not report success from parse-ready or card queue submission. |

The native supplied WebUI has its own selectSafariExportZipFile message and file dialog. Its packaged JavaScript is pinned here for provenance; it does not establish the public extension binary payload path by itself.

## Genuine Chromium155 mapping

The existing Chromium155 component is the direct implementation owner to reuse:

- `components/user_data_importer/utility:safari_data_importer` owns archive preparation, readiness callbacks, password conflict continuation, policy checks and destination writes. It already depends on its genuine Rust archive parser.
- `user_data_importer::MakeBookmarkParser()` is implemented by `components/user_data_importer/content/content_bookmark_parser.cc`; the supplied constructor uses the same real BookmarkParser owner. Do not flatten these bookmarks into the independent JSON reader.
- `parsing_ffi/models.rs` defines PaymentCardJSONEntry: required card_number, optional card_name/cardholder_name, optional integer card_expiration_month/year. Missing strings default empty and missing dates default0 in the actual conversion. Cards are JSON, not CSV.
- `parsing_ffi/utils.rs` selects nonhidden files by their extension (JSON for cards), while zip_archive.rs validates metadata.data_type through the actual streaming top-level deserializer. Do not require a literal PaymentCards.json basename: the real parser can locate matching JSON metadata in the ZIP.
- `SafariDataImporter::BlockingWorker::ParsePaymentCards()` calls that actual parser. `PreparePaymentCards()` converts to local autofill::CreditCard values. This preserves the real card validation and managed credit-card policy.
- Original ContinueImportPaymentCards is040f0cc8 (REA ev_537a22131daf46480f8b53c54a39d661ab25f8004fa460c0ac9c2faee83d4508). It tests the managed autofill credit-card preference, validates each card, looks up by number through043b9fac, then dispatches the payments manager UpdateCreditCard virtual slot0xb8 for an existing local card or AddCreditCard slot0xa8 otherwise. Real Chromium155 ContinueImportPaymentCards has the corresponding GetCreditCardByNumber/UpdateCreditCard/AddCreditCard implementation. Its client callback acknowledges the number accepted by that implementation; do not invent a stronger database flush guarantee.
- Genuine SafariDataImporter also preserves account-versus-profile password destination through features_util::IsAccountStorageActive(sync_service). A generic profile-only CSV adapter would change supplied behavior.

## Supplied bookmarks-only component adaptation

Original040ee4ac stores bookmarksOnly;040eeb84 branches on it. For true, OnZipArchiveReady schedules only WriteBookmarksToTmpFile→PrepareBookmarks; passwords, payment-card and history parsing are skipped. Original040ef57c true branch creates a one-task barrier and posts only ContinueImportBookmarks. False retains the four-task pipeline. The narrow faithful155 adaptation is an optional default-false PrepareImport parameter plus this exact two-branch behavior, preserving existing upstream callers. Client ready/completion barriers must use the same distinction. These component edits are **not** included in this admission-only patch yet.

## Remaining implementation work

Replace public Safari's per-category ReadSafariArchive path with a real lifetime-owning SafariDataImportClient and staged-file owner using the actual Profile services and upstream importer. Preserve the recovered currentDataKind/progress/error/cancellation and four-callback barriers. Port the supplied bookmarksOnly component extension. Verify the original SavedPasswordsPresenter initialization/wait ownership rather than adding guessed account readiness. Pin and review all GN changes through the integrator. The independent16MiB API bound and archive/parser bounds still differ from original and need to disappear with that real-owner replacement, not be described as faithful.

Validation here is a disposable two-file git apply --check/replay plus complete baseline/output SHA verification. No native compile, runtime import, password/card data access, Keychain operation, OS grant or shared checkout mutation occurred. This is source recovery and a reviewable admission correction, not runtime acceptance.
