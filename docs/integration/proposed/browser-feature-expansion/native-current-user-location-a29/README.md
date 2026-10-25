# Native current-user location policy A29

Three exact source successors, twelve counted anchors, from the actual A59 daemon policy/loader and current browser parent-policy reader. This implements the missing finite native location producer and paired consumers. It does not activate a new package or touch an actual user home.

## Versioned selection

`policy-v9-example.json` replaces v8's absolute development roots with exactly one signed finite `storageLocation` mode. The decoder itself is read-only. It uses `getpwuid_r(geteuid())`, requires matching real/effective nonroot UID, copies the passwd string while its C buffer is retained, canonicalizes the actual OS home and checks ownership/mode. It derives only:

- `Library/Application Support/Aux Browser/User Data`
- `Library/Application Support/Aux Browser/Control`
- `Library/Application Support/Aux Browser/Tasks`
- `Library/Caches/Aux Browser`

No environment HOME, command argument, UI payload, supplied path or caller readiness flag selects those roots. The resolved value is data until the existing authenticated policy, native descriptor and generation owners admit it. Revalidation compares resolved location facts as well as the sealed policy and actual code/bundle. V8 fixed-scope decoding, old Boolean API private-parent validation, explicit native admission, receipt bytes, encryption labels and credential formats remain unchanged. V9 is ordinary-browser-only; no privileged-task/helper authority is added.

## Earliest browser consumer (navigation/root owned)

The exact C signature is in `consumer-contract.h`. The new getter authenticates the actual retained embedded daemon code/requirement/hash, sealed resource, role, bundle and code hash using the existing parent verifier, without requiring Control to exist first. It returns only -1,8,9. Existing `AuxValidateEmbeddedNativeDaemonLaunchPolicy` stays a 0/-1 API and preserves its prior private-parent check for old formats. This classification is not a startup receipt.

The navigation lane owns C++ earliest ChromeMain, packaged identity and actual outer/child-pair callers. It must validate mode9 before creating/selecting data/cache roots, derive the same OS-current-user fixed suffixes, reject caller overrides and unknown/partial installations, and retain the existing native root/generation proof. Existing OS Library/Application Support/Caches ancestors must already exist; neither lane changes their permissions or ACLs.

## Post-seal daemon creation

After the actual running daemon code, resource seal, route and loaded images are validated, the loader prepares only Control and Tasks. It retains no-follow private support/data/cache descriptors. Both missing Control/Tasks require support inventory exactly User Data plus empty data/cache before either leaf is created. A partial pair, unknown scope entry, nonempty unmarked browser state, symlink or unsafe metadata refuses. Both existing leaves receive metadata checks; subsequent existing installer and browser-admission owners still validate their own records. There is no old-state adoption, repair or reset. Failed new creation remains partial/uncertain rather than deleting state.

The parent guest-policy reader stays read-only. Root owns launcher/package binding, v9 resource staging, actual integration and separate signing approval. `readFreshAuxLaunch` and the current accepted v8 package are not modified by this commit.

## Relocation audit

The actual loader derives its bundle from `_NSGetExecutablePath` and verifies it against `SecCodeCopyPath`, signed main-executable metadata and fixed role suffixes. Image expectations are relative to that validated bundle. No developer app path needs a new signed field in these policy consumers. Outer-browser/child-pair validation and launcher package selection remain navigation/root's actual integration requirement.

## Focused evidence

`check.py` replays all twelve anchors, independently applies the unified patch, and verifies every output hash. The complete policy and parent reader pass actual Swift type checking with the existing strict JSON parser. A compiled synthetic fixture exercises the actual fixed-suffix rules, actual v8 decoder, v9 exact-field branch and unchanged extracted filesystem preparation owner. Only the v9 branch's OS capture call is explicitly replaced by synthetic captured-home data in that generated fixture; the shipped capture has no override. Empty creation, existing bytes, partial pair and nonempty data/cache refusal pass. No real-user home query, Security signature execution, native daemon/browser launch, product/developer-key signing, provisioning or OS grant occurred. Full paired graph compilation and actual approved new-install/reopen observation remain root-owned acceptance steps.

## Verification runner correction

The original `focused-check.json` remains historical. That run invoked `swiftc -o`; the linker implicitly ad hoc signed its temporary host fixture executable. No product/developer identity or Keychain was used, but the earlier blanket no-signing wording was too broad. The runner now uses the existing `/usr/bin/swift` interpreter and no-output type checking only. `focused-check-interpreter.json` records the fresh successful outcomes. No crypto function was replaced or bypassed. The shipped source/output pins are unchanged.
