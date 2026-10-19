# Optional native API argument correction

The integrator observed the new-tab surface reporting `Invalid autocomplete query` when it omitted the third `queryAutocomplete` argument. Passing `{}` temporarily avoided the error. This is observed integration evidence supplied by the integrator; this lane did not reproduce it against the still-building native candidate.

The independently authored `docs/spec/native/omnibox.md` contract permits optional options for `createSession` and `queryAutocomplete`, and optional boolean flags for `addTabContext` and `deleteContext`. `docs/spec/native/adblock-import.md` permits omitted `startSubscriptionUpdate` options and defines omitted IDs as all configured sources.

The public upstream implementation in `extensions/renderer/bindings/api_signature.cc` explains the boundary: `ArgumentParser::ParseArgument` calls `AddNull()` when an optional value is absent; `BaseValueArgumentParser::AddNull` appends `base::Value()`. Consequently, the native list contains a NONE placeholder, even when JavaScript omitted the argument. Checking only list length and dictionary type rejects this valid input. This evidence was read from the local licensed Chromium source, not a reference bundle.

## Schema audit

Every independent `chrome/common/extensions/api/aux_*.json` schema was parsed. Exactly five top-level function parameters are optional:

| API | Optional argument | Before 0105 | Proposed behavior |
| --- | --- | --- | --- |
| auxOmnibox.createSession | options object at 0 | Rejects NONE | Treat absent/NONE as default options |
| auxOmnibox.queryAutocomplete | options object at 2 | Rejects NONE | Treat absent/NONE as both flags false |
| auxAdblock.startSubscriptionUpdate | options object at 0 | Rejects NONE | Treat absent/NONE as all configured sources |
| auxOmnibox.addTabContext | delayUpload boolean at 2 | Ignores optional value | Accept absent/NONE/bool; reject other types and extra arguments |
| auxOmnibox.deleteContext | fromAutomaticChip boolean at 2 | Ignores optional value | Accept absent/NONE/bool; reject other types and extra arguments |

0105 changes only two independently implemented native files. It retains required argument types, input limits, dictionary checks, existing session/profile ownership gates, and downstream behavior. Dictionary access occurs only after confirming a real dictionary. The two local-only attachment flags retain their current semantics; this correction introduces no external upload. It also enforces the shared `getTabPreview` branch's declared two-argument maximum.

## Verification and remaining checks

The staged patch passes `git apply --check` against the active native source without editing it. `node --check scripts/fixtures/native-optional-arguments.js` passes. The fixture runs through actual public renderer bindings and native entry points in a disposable extension page, covers omitted/undefined/null/object forms, rejects non-null malformed options and oversized query input, and destroys its sessions in `finally`. It deliberately does not start subscription updates. It has not been executed yet: the native build remains active and 0105 has not been applied or compiled.

After integration, compile the enabled native targets and run the fixture in the rebuilt disposable new-tab page. Confirm the original UI call without its temporary `{}` workaround succeeds. Subscription-update omission/default behavior and attachment optional booleans still require disposable-profile native observation; do not record those as runtime passes based on this static audit.
