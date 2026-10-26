# Actual Agent active identity closure, fresh v2

The first coherent unsigned successor receipt `44d6fc9e168cfc03b8528aaeb500175bfbc052cf2cb5e9a5d3d57114f9b27a3c` proved these producers/receivers remained active. This is a source successor for that concrete finding, not a claim the prior artifact passed Q1. The native app was not edited.

Export `transformAuxAgentActiveIdentity({path,text,source})` from `vendor/provided/aux-agent-active-identity.mjs` takes accumulated output plus its separately pinned original A38 source. It returns `{text,anchors}`. It supports full app-relative, dist-relative, or unique basename inputs and returns unrelated paths unchanged. Every source and every literal occurrence must match the pinned count before replay. There are 24 anchors / 38 exact occurrences across ten contract leaves plus manifest.

Contract closure:

- daemon auth cache key → `aux.daemonAuth.v2` in background, queries and content. The native challenge/auth protocol and credential/cache value format remain unchanged.
- Capture context-menu ID and its actual dispatch → `aux.capture.v2`, both in background. This is not a CDP or native capture protocol rewrite.
- Lasso source marker → `aux.lasso-storage-bridge.v2` and storage prefix → `aux.lasso.v2`, paired across background, content and personalization.
- Profile metadata local checkpoint → `aux.profileMetadataSync.v2` in background and utils.
- Remix built-in/content/user script registrations → Aux v2 IDs; state/pending keys → `aux.remix.v2` / `aux.remix.pending.v2`; injected user-script API → `const aux = …`. The corresponding components, content script and background readers/change listeners are paired.
- Aux Code UI producer/selection/rendering discriminant → `aux-code` in provider and session composer; the MCP OAuth window target → `aux-mcp-oauth-v2`.

These cache/storage/script identifiers are an explicit **fresh namespace v2**. No v9 profile, previous local cache, remotely restored old script namespace or owner state is adopted or rewritten by this transform. The native fresh-namespace admission remains required. This does not silently migrate credentials, installation records, cryptographic labels or any existing user script text.

The manifest additionally retains an explicit `externally_connectable:{ids:[]}` rather than deleting the key: absent-key Chrome behavior can permit other extensions. This removes the obsolete excluded Vault extension grant. Actual forbidden Vault IDs must remain in the paired daemon/native privacy/security denials; a denial or protected-page redaction is not a branding failure. Integration owns those source denials and Trusted Types names. The manifest's controlled dev-cloud main.html match is left unchanged because the actual app.getaux.co desktop-connect page supplies email-code instructions, not a proved iframe consumer. No new origin permission was inferred from product information links.

Affected contract paths under `apps/extension/dist/`:

```
background.js
content/content.js
remix.js
assets/-components-4o0FSqQ9.js
assets/-utils-B_lbplVm.js
assets/mcps-DmPp5oo9.js
assets/personalization-C9HKLZT4.js
assets/provider-Cw0zhujt.js
assets/queries-ldd77hNk.js
assets/session-composer-Dc0LRfZA.js
```

The eleventh input is manifest.json. Root should apply background after its existing browser resource transforms; add the four new asset chunks to the UI cohort, retain content/remix as supplemental leaves, and compose the manifest's explicit denial separately. Source pins list every full destination. Trusted Types transforms on content.js are disjoint and still use the original A38 source separately.

Focused static evidence: actual accumulated artifact text was replayed for all eleven inputs; all ten JavaScript results parse; manifest parses with explicit empty external IDs; reversing only these changes reproduces each exact pre-transform artifact. This is not app, fresh-profile, cache migration, script execution or cloud activation evidence. Final source materialization, restaging and actual journeys remain root gates.
