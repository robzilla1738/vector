# Ordinary launch boundary: refuse legacy roots before writing

## Concrete correction

The A59 daemon's actual selected `ordinary-storage-source/AuxBrowserFreshRootAdmission.swift` input is pinned at `244c9d61dd1cf36610bc616cfd772d03c5fc313063613b6950c2b6a8f9fdde5f`. `acquireOrdinary` created both lease markers before checking whether unmarked data/cache roots contained unknown files. A real extracted-code synthetic fixture confirms that legacy refusal left two newly created empty markers, although the synthetic legacy bytes stayed unchanged.

The one-anchor successor preflights **both actual retained root inventories** before either marker is created. Existing no-follow/ownership/path checks, paired-marker logic, locks and the second post-lock inventory remain unchanged. Reopen/admission/receipt semantics are unchanged; no legacy data is accepted and no existing ciphertext, key, credential or profile is transformed.

`check.py` compiles/exercises the exact actual marker preparation region plus its actual metadata/entry/inventory functions, using Darwin directory descriptors and synthetic private temporary directories. Signature verification, installation hashing and browser-peer lifecycle are outside this fixture, explicitly not proven. The baseline confirms the defect; the successor passes data-root and cache-root refusal without added markers, normal empty-root preparation, and unchanged partial-marker refusal. Fixture directories are removed after execution. No native daemon/app launch, owner state, provider, product/developer-key signing or shared source mutation occurred.

## Smallest normal-launch integration (root-owned)

Current development restrictions are explicit: `scripts/aux.mjs` requires `--temp-profile --app`; `readFreshAuxLaunch` allows only `/private/tmp/aux-fresh-browser-*` and the exact packaged path. The native v8 policy already validates arbitrary canonical, nonoverlapping fixed private roots and authenticates them through the existing selected native home/receipt. Removing only the JS regex would still leave an absolute, per-user, pre-signing policy resource and would not create a reusable installation flow.

For a reusable user installation, keep the existing native root/receipt and ordinary-mode restrictions, but add one versioned **native current-user fixed-location selection** alongside the development fixed-path selection. The signed policy chooses that finite mode; the native owner derives the fixed Aux support/cache/control/task suffixes from the actual OS user home, captures real descriptors, and applies existing fresh-vs-proven-reopen checks. No UI, environment `HOME`, `--home`, caller path or JSON readiness flag may choose the native destination. The launcher consumes only the resulting current-user native selection; current exact path development acceptance is not transferable. Root owns the policy/startup/launcher/package successor and separate signing approval. This is a missing product integration, not a completed change here.

## Existing migration scope, without owner access

- `vendor/provided/aux-ui-storage-migration.mjs` is a pure transform of explicitly captured, single-profile/origin local/session/chrome-local snapshots. It preserves supported raw strings, unknown keys and claims, and refuses conflicting targets. Existing synthetic fixtures prove transformation only; this cannot close native writers or admit a browser profile.
- `vendor/provided/aux-state-migration-transaction.mjs` is an external offline **stopped-disposable-only** file transaction. Its capability explicitly requires disposable/exclusive/stopped scope and exact existing-file hashes. It is not imported by the app. Broadening that Boolean/callback contract into owner authority is not a valid normal-user migration implementation.
- Current ordinary native admission reopens its own authenticated installation/markers and refuses missing/mixed/unknown legacy roots. That remains the correct behavior until a separately explicit migration path exists. Existing advanced UI/backend recovery prototypes do not turn this ordinary entry into a migration grant.

Available fixture work can establish raw transformations, file replacement/replay and refusal invariants. It cannot prove real owner consent, browser shutdown, key unwrap/rewrap, arbitrary cookie portability, helper/native messaging, or complete profile adoption. No generic profile scan/copy, key reset, old-ciphertext relabel or speculative new recovery architecture is introduced for this milestone. New-user ordinary launch and explicit existing-profile migration should remain distinct acceptance journeys.

## Verification runner correction

The original `focused-check.json` remains historical. That run invoked `swiftc -o`; the linker implicitly ad hoc signed its temporary host fixture executable. No product/developer identity or Keychain was used, but the earlier blanket no-signing wording was too broad. The runner now uses the existing `/usr/bin/swift` interpreter and no-output type checking only. `focused-check-interpreter.json` records the fresh successful outcomes. No crypto function was replaced or bypassed. The shipped source/output pins are unchanged.
