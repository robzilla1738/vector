# Agent and memory parity audit — 2026-10-19

Build-facing audit of original main source at 1a2370638, approved
`docs/spec/daemon/{agent,services}.md`, and public upstream documentation only.
This is a scoped gap inventory, not a new parity-complete claim.

| Ready requirement | Current evidence | Remaining work |
| --- | --- | --- |
| Agent tool inventory: browsing_history_search, history_search/history_read | `apps/memory/src/browser-history.ts` and context service have real semantic/list/read backends. Root exposes authenticated routers. Agent extension tools mount only memory_search/memory_operators. | Mount actual scoped evidence tools; resolve browser profile/account/mode from the session and registered bridge, reject incognito and inaccessible sources. |
| Account/profile browsing evidence and actual visits | Browser history API accepts caller-provided profileId and there is no live browser ingestion producer in current background/factory. Native browser imports do not yet feed semantic recall. | Trusted profile-bound bridge ingestion with account opt-in, stable real visit identity/time and explicit private-mode rejection. Do not infer provenance from a URL. |
| Uniform tool deny/ask/read-only policy | Browser/file/native/channel/MCP tools use central `approveOperation`. `apps/memory/src/tools.ts` directly checks only session.incognito and read-only for memory writes/revert. | Honor current central deny/ask rules and current session policy at execution and after approval. Add meaningful denial and approval-resume tests. Root authorized this as the next slice with history tools/ingestion. |
| Opt-in continuous context capture | Helper has real foreground metadata and bounded semantic AX snapshots. CaptureAdapter only bridges permission inspection/request. `ContextService.status()` reports capturing=true from enabled/unpaused/permission alone; root has no capture observer/timer. | A real observer lifecycle or truthful inactive status, permission revocation, source ownership and exclusions checked before reading content. Browser content needs native private-mode identity; OS capture must not guess private-window state. |
| Memory file/history/semantic recall and extraction/dreaming | Real local pinned ONNX embeddings, Markdown history/revert, configured-provider extraction and consolidation exist; memory tools are mounted. Extractions/dreaming are explicit API operations. | Production packaged semantic recall and real permitted Muse extraction/dreaming acceptance still need recorded evidence. Automatic trigger thresholds remain draft, so lack of automatic extraction alone is not a ready-spec failure. |
| Model/provider OAuth contract | API-key SDK adapters exist. `models.listOAuthProviders` explicitly marks openai-codex unavailable; authorize/callback/status/cancel routes are absent and provider resolver fails NOT_IMPLEMENTED. | Independent registered OAuth flow, PKCE/state/nonce/JWKS, issued client identity, refresh/revocation, private storage and Responses routing. Do not import an owner's Codex profile/auth.json or reuse another app's client identity. |
| Custom provider/model capabilities | Configuration accepts model lists and some metadata; default Muse has measured context/output/image/reasoning metadata. Custom resolver validates name/baseUrl/headers and constructs OpenAI-compatible model. | API-style-specific routing, complete custom capability/reasoning mapping and pricing; repair all category selections; verify supported metadata rather than advertising generic false/default capabilities. Only Muse may be used for real AI acceptance. |
| Subagent profile contract | Fresh/context-explorer/code-explorer child tools exist, depth/concurrency restricted and explorers read-only. | Forked parent context, custom profiles and model category selection. Child questions must route through the parent; do not give children independent approval authority. |
| Remaining ready built-in tools | Core has real bash/files/webfetch/browser/page/todos/question/confirmation and root isolated QuickJS REPL. | Built-in websearch, clip_search, notification and routine_update are absent from the directly mounted inventory. Unavailable capabilities need explicit errors rather than fabricated successful results. |

Recommended sequence after the RP harness: history ingestion/evidence tools and
memory policy boundary (authorized next), then real context observer lifecycle,
then independently registered OAuth and remaining tool/profile coverage.

Public OAuth evidence changed the feasibility assessment: OpenAI now documents
initial dynamic public-client registration and later use of its issued client
ID, loopback callback, PKCE/state/nonce and ID-token/JWKS validation. Inference
uses an appropriately authorized access token with the public Responses API.
This supports an original Aux implementation without copying Codex auth state.
No sign-in, registration, owner account or non-Muse inference was performed.

- [Registration and sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)
- [Codex app-server token integration](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server)
