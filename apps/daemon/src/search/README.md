# Aux standalone web search

Implements ready `docs/spec/daemon/agent.md` Tool inventory `websearch` with an original direct Perplexity Search adapter. Search returns actual ranked source evidence, not generated model prose. No SDK source is copied or vendored; transport uses the independently licensed upstream Node HTTPS runtime already used by Aux.

## Public contract and choice

Checked installed `@ai-sdk/gateway` 4.0.116 declarations/implementation and Vercel's [current web-search documentation](https://vercel.com/docs/ai-gateway/models-and-providers/web-search). Gateway's search helper is a provider-executed tool definition used within model inference. No documented standalone Gateway search endpoint was found. Aux does not infer a private endpoint, substitute a model request for search, borrow another application's key, or reuse the configured Gateway credential.

The adapter follows the official [Perplexity Search API reference](https://docs.perplexity.ai/api-reference/search-post): direct `POST https://api.perplexity.ai/search`, Bearer authentication, a concrete query with bounded result/content budgets, and structured source results. This is distinct from Perplexity's answer-generating Agent API. It requires a separately issued, user-owned Perplexity Search API key and may incur the provider's search-service charges under the user's provider account. Entering the initial AI Gateway key never enables this service. Configuration is local and does not test or validate a key against the provider.

No live search, paid endpoint, registration, token exchange or AI inference was used to implement or verify this slice. Only fake transport/stream fixtures and disposable homes are used. Existing Muse-only AI acceptance remains unchanged.

## Configuration RPC

Mount `search: createSearchRouter(services,service)`:

- `search.status({accountId})` returns `{provider:'perplexity',configured,enabled,maxResults,credentialRequired,endpoint:'https://api.perplexity.ai/search'}`. This is local configuration status, never proof of key validity or network availability.
- `search.configure({accountId,apiKey,enabled?:true,maxResults?:5})` replaces a credential. Key is 1–8192 printable ASCII characters without whitespace; results default5 and range1–10. Returns status only. Never echo/prefill the stored key. A blank credential must never overwrite an existing credential.
- `search.setEnabled({accountId,enabled})` preserves the key. Fails if none is configured.
- `search.clear({accountId})` removes the credential and disables search. Returns status only.

These authenticated local RPCs require an unlocked account. There is deliberately no settings “test search” RPC with hidden spend. Root UI can expose explicit configure/enable/disable/remove actions and link the official documentation for obtaining the separate user credential.

`search-credentials.json` resides only under that account's private home, atomic replacement mode0600, parent mode0700. Read/open checks reject symbolic links, hardlinks, nonregular files, foreign ownership, overly broad permission bits and oversized documents. Parsing/storage errors use generic messages. Ordinary account settings, logs, RPC results and model configuration never contain its key. This private file is plaintext like the existing API-key credential store, not a claim of OS-keychain or Vault-at-rest encryption. Account deletion removes it with the account home. Root must add its exact filename to the agent credential-access denial list before exposing tools.

## Tool and evidence

Always spread `searchTools(service,session,signal)`. Input is exactly one of `query:string` or `queries:string[]` (1–3), optionally `maxResults:1–10`. Queries are nonempty and limited to1000 characters. Duplicate queries are coalesced. The tool applies central account/session deny and explicit ask rules and guard approval to the concrete provider/endpoint/queries/result limit. Read-only sessions can search after the same read-operation policy checks. Unconfigured or disabled search is explicitly unavailable; no successful fabricated empty results are returned. Only a genuine validated provider response with an empty results array can produce an empty batch.

Output is `{provider,attribution,retrievedAt,batches:[{query,requestId,excludedCount,results:[{title,url,snippet,citation:{id,title,url,provider},publishedAt?,updatedAt?}]}]}`. Preserve title/source URL/citation when presenting results. All provider/source prose is untrusted evidence. Returned title/snippet are bounded1000/8000 characters and the known account key is redacted before truncation. Invalid/non-HTTP(S), embedded-credential, literal private-network, reserved-local or credential-bearing source URLs are excluded; a nonempty result set with no usable public source fails explicitly. Dates are provider metadata, not independently verified publication times. The tool never visits source pages; downstream `webfetch` or browser navigation must independently revalidate its own destination/network/profile policy. Result hostname metadata is not DNS-resolved or treated as authority to fetch.

## Network/lifecycle boundaries

Only the fixed official HTTPS endpoint is configurable in code; there is no arbitrary URL/host/proxy/header override. DNS results must all be public addresses and one validated address is pinned into the TLS connection lookup; original-host TLS verification remains enabled. Local/mapped/link-local/multicast/reserved destinations are rejected. Redirects are never followed and credentials are never forwarded to a redirect. JSON response bodies are capped512KB including unknown/chunked lengths; unexpected encoding/content type, malformed bodies and invalid result shapes fail. Each tool call has one20-second overall deadline across DNS, up to3 sequential queries and complete body processing. Cancellation, account security invalidation, credential update/removal and shutdown abort owned requests and discard stale results. No automatic retries are performed. Provider error payloads and raw transport error details are withheld, rather than trusting them to omit authentication material.

Factory integration:

```ts
import {createSearchService, createSearchRouter, searchTools} from './search/index.js';
const search = createSearchService(services, engine, {isUnlocked: id => vault.isUnlocked(id)});
// engine tool extension: {...searchTools(search, session, signal)}
// router extension: {search: createSearchRouter(services, search)}
// engine redactor callback: search.redact(accountId, text)
// security/deletion event: search.invalidate(accountId)
// engine close handler: search.close()
```

Register the redactor before starting any session; if credential storage is unreadable it deliberately withholds potentially secret text. The adapter does not know Vault/native/browser internals and does not mutate any owned-tab ledger. Root owns UI mounts, security hooks and shared credential-denial wiring.

Verification: five focused fixtures cover private-file/symlink/hardlink/mode boundaries, actual bounded stream decoding/redirect/error rejection, public IP/URL filters, unavailable/disabled/denied/locked/no-network behavior, exact approval and read-only ask rules, attributed fixture results with key redaction, in-flight invalidation and raw-error suppression. Source-alias daemon/agent/memory typecheck and focused lint pass. Live Perplexity API behavior, real credentials, account billing and network success remain unverified.
