# Aux private automation identity — next integration slice

This pure source transformation is prepared separately from the current state2 build. It does not modify existing adapters, staging, packaging, native binaries or accepted app/UI. It is not activated by adding these files.

`inputs.json` pins the exact shipped1852 daemon SEA code SHA `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. All23 ordered rules replay against that source and against the actual composed local/development protocol→provider→runtime output, checking75 original occurrences. The longest private names are changed before the shared bare `__aside` prefix, preventing accidental partial matches. Incoming exact Aux names reject mixed generations; an original-source hash mismatch or composed count drift fails closed.

Covered boundaries:

- Browser injected snapshot/element helper `globalThis.__aside` and every original CDP reference → `globalThis.__aux`.
- The isolated utility world name, DOM-wait monitor, annotation overlay ID, drag-transfer producer/consumers, injected console producer/logging callers and Buffer injection reference.
- Original account registry and OAuth/refresh singleton globals, retaining one authority per original role.
- Temporary shell/PowerShell variables and the related embedded image-worker JavaScript identifier; these are code identities, not the addon ABI or persisted key material.
- Four exact background Agent session IDs: `aside:aux:context-awareness-summary`, `aside:aux:memory-dream`, `aside:aux:taxonomy_migrate`, `aside:aux:lasso` → the same IDs under `aux:aux:`. The original source has exactly four occurrences of the `aside:aux:` prefix, each a complete `sessionId` literal; no matching original filter/parser/slice consumer was found. The existing second namespace segment is deliberately retained.

Left unchanged: valid HTML/JSX `aside` semantics, `aside_dom` event persistence, signed memory/runtime catalog names and payloads, cryptographic purposes/labels, native addon exports or Swift metadata, UI assets/styles and actual owner state. Those remain separate migration/integration boundaries. This helper does not claim that historic background/session references in persisted databases have been migrated.

Integration API, after the final provider/runtime transforms and before emitting each actual daemon entrypoint:

```js
const result = applyAuxAutomationIdentity({
  component: 'daemon', path: 'entry.mjs',
  original: pinnedOriginalDaemonCode,
  text: composedDaemonCode,
});
// Record result.anchors and the helper/pin file hashes in the external stage audit.
```

The actual private names are lowercase in both supplied and Aux-capitalized composition, so no broad capitalization pass or optional rebranding mode is required. Call once; repeated application rejects mixed generations.

Focused verification:

```sh
node --experimental-vm-modules --test vendor/provided/aux-automation-identity.test.mjs
```

Four checks use the actual pinned supplied source. They compile the complete original-derived/composed module and extract/parse the real browser snapshot bundle, console script, QuickJS prelude and Buffer bundle. The actual Buffer bundle executes in an isolated VM and retains byte conversion. The actual console injector executes against a synthetic window/console, verifying original non-clearing drain/filter semantics, clear, the reinjection guard and paired renamed callers. Snapshot/QuickJS scripts are parsed and paired with their actual call sites; a real browser DOM snapshot and full native/app behavior were not executed. This is static/pure-script evidence, not desktop acceptance or proof of the remaining identity migrations.
