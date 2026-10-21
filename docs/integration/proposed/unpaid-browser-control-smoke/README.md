# Unpaid actual supplied browser-control smoke

Prepared only. No authentication, native helper, browser operation or paid request executed by this lane. JavaScript syntax check passes.

Run from the root repository with the same Node runtime used for the successful supplied CLI smoke:

```
node scripts/e2e/unpaid-browser-control.mjs out/<actual-candidate-directory>
```

The candidate argument is the directory containing Aux.app, exactly as smoke-local-browser.mjs expects. Root must use the current approved scoped helper-bearing candidate and already running normal disposable browser/daemon after566. No command-line debugging switch is required. Do not run against an owner profile.

## Reuse and boundaries

The script copies only the validated prefix of out/native-integration/smoke-local-browser.mjs through supplied daemon client creation. It uses the existing exact-scope proposal/home hash assertion and signed carrier cdp-sign path. Its authorizer, RPC client and account resolver are unchanged supplied CLI helpers loaded by the existing pinned loader. The intercept used to obtain the supplied token remains in memory and is restored in finally. No .env, provider credential, model setting, AI chat/session API or paid request is present.

Original CLI source013dbd114ac574df1e4c72f53fd438d4b7da4d2aebbf3c45fa22a6fb2fe1dd62 lines69493–69594 owns the exact local sequence: resolveAccount → accountId/accountCreatedAt → cli.replStart(profileId) → cli.replRun(id,code) → cli.replClose. The smoke invokes those actual methods, not a replacement CDP client/auth protocol. Account1 and profile70f3b1d5-acdc-4528-b6ea-78aa6e7168b9 are pinned; profile binding must resolve under the approved disposable home. It does not select another account on mismatch.

A loopback ephemeral HTTP fixture serves one generated marker. The real supplied REPL must openTab at that URL, snapshot its accessibility tree, find the marker, and closeTab in finally. Only that newly created tab is touched. The script requires both a server visit and marker in actual REPL output, plus explicit close completion. It closes the REPL and fixture and writes a small report beneath the approved disposable home. A failed open before a tab handle is returned may require root to inspect only the disposable app for an incomplete new tab; it never attempts blanket cleanup of existing tabs.

Success proves actual daemon authentication, exact profile binding and the supplied runtime's authenticated CDP/browser-control path far beyond a TCP check. It does not independently prove unauthenticated CDP rejection; retain the separate negative authorization check. A failure before an AI call should be investigated through the same disposable session diagnostics. Do not rerun the paid Muse test until this succeeds.
