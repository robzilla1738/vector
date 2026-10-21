# Synthetic Chrome import acceptance

This is a focused real native API probe for the combined local candidate. It is **prepared, not executed**. It uses the existing authenticated Aux CDP connection and supplied Agent extension context; it does not introduce another authentication implementation or run on module import.

## Boundary and launch

The integrator owns launch, shutdown and packaging. Use the existing approved disposable accepted-development app/profile and `out/native-integration/pass2-import-fixture.json`. Do not use an owner browser profile or run the source picker before the probe proves its boundary.

1. Confirm the candidate contains the password-exclusion patch and is a non-official build (`migrator.cc::SourceHome` compiles the fixture branch only without `OFFICIAL_BUILD`). The probe cannot prove compile flags from a live API.
2. Normally quit the previous disposable Aux instance. Directly launch the accepted candidate's `Contents/MacOS/Aux` with `AUX_IMPORT_FIXTURE_HOME` set to the manifest's canonical root. Do not set `AUX_HOME`, scope/carrier variables, `--user-data-dir`, or `--profile-directory`: these conflict with or bypass accepted startup. Use the existing accepted startup record. It sets the disposable home and preserves the fixture variable. Do not use `scripts/aux.mjs` for this launch: it supplies `AUX_HOME` before accepted startup.
3. Record the new owned browser PID and exact app path. Reuse the existing authenticated CDP client on isolated port 45203. Bind its evaluator to the supplied Agent extension's default context in the intended disposable profile. Do not print token, challenge, environment, target inventory or exception payloads.
4. Run `mode: 'import'` once. A second import is rejected by the probe if the synthetic rows already exist. Do not navigate the fixture URLs, which would change history visit counts.
5. Normally quit Aux (allowing bookmarks/history writes to flush), relaunch the same accepted app and disposable profile with the same fixture variable, reconnect/authenticate and bind the new Agent context. Run `mode: 'after-restart'` with the new PID. This performs no import and requires durable bookmark hierarchy and history rows.

`proveFixtureBoundary` runs before any extension API on both invocations. It requires the owned canonical 0700 synthetic fixture, precisely its four source files with no symlinks, the exact app executable PID, sole ownership of the CDP listener, and the exact inherited fixture environment marker. Raw process environment is inspected only in memory and never returned or logged. If proof fails, stop; do not retry source discovery without it. The fixture branch rejects invalid explicit roots rather than falling back to owner discovery. This relies on the reviewed candidate's source behavior and a trusted fixture manifest, not merely the public inventory (which strips `nativeFixture`).

## Adapter

Import `runSyntheticImportProbe` from this directory's `probe.mjs` inside the integrator's existing authenticated CDP harness. Supply:

```js
const result = await runSyntheticImportProbe({
  mode: 'import', // then 'after-restart' after a normal quit/relaunch
  fixtureManifest: '/Users/rcourson/Documents/Vibe/web/out/native-integration/pass2-import-fixture.json',
  app: acceptedCandidateAppPath,
  browserPid: ownedBrowserPid,
  extensionId: suppliedAgentExtensionId,
  evaluate: async expression => {
    // Adapt only this call to the already connected CDP client's signature.
    const reply = await existingAgentSession.send('Runtime.evaluate', {
      expression, awaitPromise: true, returnByValue: true,
    });
    if (reply.exceptionDetails) throw new Error('Synthetic import acceptance failed');
    return reply.result.value;
  },
});
console.log(JSON.stringify(result)); // booleans and mode only
```

Do not log raw caught CDP errors; report the fixed failure label and investigate through source or bounded synthetic diagnostics. The harness must keep the same process/context attached throughout each call. Never substitute an unauthenticated debugging endpoint or an owner browser context.

## Assertions and scope

The import pass checks empty destination for the fixture values, exactly one populated non-Safari Chrome source with profile `Aux Synthetic Import`, absence of advertised password import, and explicit `dataKinds: ['passwords']` rejection with the native typed message. It then invokes **full import by omitting dataKinds**, polls the actual job's public `state` to success (30-second limit), and reads the destination's actual bookmark/history APIs (up to 15 seconds for asynchronous writes). An unexpected password job is cancelled; an unfinished full job is cancelled on timeout/error.

Expected destination: bookmark `Aux Synthetic Bookmark` at `https://aux-import.test/bookmark` beneath `Aux Import Fixture`; history `Aux Synthetic History One` and `Aux Synthetic History Two` at `/history-one` and `/history-two`, with visit counts 2 and 1. Only synthetic values are queried. Reports contain no job IDs, credentials or profile content.

The restart pass verifies the same rows without reimport. Its `passwordRejected` and `importSucceeded` remain false because those operations are deliberately not repeated; the prior import report establishes them.

This proves the full **fixture-backed Chrome path**, password exclusion at the public boundary, and persistence. It does not prove encrypted cookies, Safari archive import, Firefox, extension migration, third-party password manager compatibility or owner-profile import. Fixture mode deliberately excludes source Safe Storage access. No paid AI request is made.

## Prepared validation

- `node --check probe.mjs`: passed.
- Source checked: public source/profile fields (`name`, `supportedDataKinds`), promise API signatures, public job `state`, exact password error, accepted startup fixture-variable preservation, and explicit invalid-fixture fail-closed behavior.
- Runtime acceptance remains the integrator's next action against the combined build. No app was launched and no native import/API was invoked while preparing this probe.
