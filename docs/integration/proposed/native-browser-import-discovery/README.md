# Supplied browser-import discovery contract

Two-file, discovery-only incremental proposal against actual419. It changes no migration snapshot, password/cookie decoder, source Keychain access or native registration. L2's password-store reader proposal has disjoint migrator.cc hunks; apply this metadata proposal first, then rebase that reader with exact parent/output pins. Existing419 dataKinds validation is preserved verbatim.

## Actual supplied UI failure and correction

The supplied1852 settings component general-3dgRbrRk calls `source.supportedDataKinds.includes(N)` while filtering a partial import. Current native PublicSources returns categories but omits supportedDataKinds, causing that actual predicate to throw. Original native descriptor4278274 emits `id`, `name`, `profiles`, `supportedDataKinds`, and only emits `requiresFileImport:true` for its file-import branch. These exact field literals and the complete descriptor are pinned.

PublicSources now supplies the actual expected array, in the original kind order, projected from **currently backed** migrator categories. Independent preferences is not misrepresented as a supplied data kind. Non-file sources no longer get an invented requiresFileImport:false; Safari retains true. Native/private path fields continue to be removed. Existing internal categories and source objects remain for actual migrator/recovery consumers.

**This is not a narrower completion target:** original common Chromium discovery declares history, bookmarks, passwords, cookies and autofill (4276460–64dc). Autofill is required unfinished parity, not an intentionally unsupported Aux feature. This proposal does not add or claim its missing reader/store consumer. Likewise any source/platform currently lacking its genuine secret reader must not advertise a successful capability. The public supportedDataKinds subset is temporary truthful availability while those original implementations are completed. Full-import/actual data migration parity remains unaccepted.

## Names, Atlas alias and real profile root

The supplied import-target builder merges daemon detection/profile metadata with native sources by exact name. Thus names affect actual detected-profile presentation, not only labels. Original friendly-name helper42755a0 establishes Google Chrome, ChatGPT Atlas, Microsoft Edge and Safari. The proposal replaces current Chrome/Atlas/Edge/Safari export labels accordingly; Arc/Brave/Comet/Dia/Helium/Firefox remain unchanged.

Original getSources4275e04–5eb8 normalizes the detected atlas ID to `chatgpt-atlas`. The public source and public job response now use that canonical ID. The input accepts it through a local normalization to the existing internal atlas ID; the legacy atlas alias remains accepted. This preserves the actual internal crypto/snapshot source family, installation check and job ownership while exposing the supplied public identity. No UI rewrite or synthetic source is introduced.

Original path resolver42600fc, case2 at4260328, appends `com.openai.atlas`, `browser-data`, then `host` under Library/Application Support. Current Atlas root stops at com.openai.atlas, so its Local State/profile discovery targets the wrong directory. The proposal corrects that one path.

The initially suggested Dia-path change is **not** justified: case5 loads Dia, jumps426024c, then falls through426025c–270 and appends `User Data`. Current Dia/User Data is already source-correct and remains byte-identical. This exact control-flow correction is pinned to prevent a future misleading leaf-literal inference.

## Bounded metadata findings and remaining work

The original profile reader4266e60 parses Local State/profile.info_cache and has fallback4267508. Current code reads info_cache, preserves discovered id/name and strips nativePath from public output; its fallback completeness is not established by this patch. The supplied picker prefers daemon-detected profiles and obtains lastUsedAt from those daemon rows. Adding a guessed native lastUsedAt would not fix that producer and is not proposed.

Original application discovery's static order is Chrome, Brave, Safari, Firefox, Arc, Atlas, Comet, Dia, Helium; getSources iterates its actual detected results. Current discovery has a broader inventory/order, including Edge. This proposal does not silently remove/reorder sources based solely on a static registry: the installed-app filter and manual/fallback source branches still need complete matched-state proof. Full discovery order/availability, original fallback profiles and missing source capabilities remain actionable fidelity work, not declared complete.

## Validation and integration

`python3 verify.py` passes original whole-image/function/literal pins, exact supplied1852 UI hashes/anchors and two-file/seven-anchor patch replay in a temporary tree. `node verify-ui-contract.mjs` executes only the exact extracted settings predicate on public fixture objects: missing array throws; backed kinds pass; unavailable kinds fail. This is a pure consumer-boundary check, not native discovery or migration acceptance.

No owner browser/profile directory was read, no installed-app discovery executed, and no browser, migration, Keychain, permission, signing or provider operation occurred. No shared native/GN files were changed. Integrator focus objects are migrator and import_service; real discovery uses actual source/profile state only when separately authorized.
