# Structured Gateway web search

Aux's existing `websearch` tool accepts `auto`, explicit Gateway or explicit configured-engine HTML search. Auto uses structured search only when the original run's selected Gateway client implements it. Non-Gateway connections use the explicitly labelled HTML fallback for unfiltered queries. Filtered fallback and an unavailable explicit Gateway request fail visibly.

## Verified interfaces

Implementation matches installed `ai@7.0.93` and `@ai-sdk/gateway@4.0.75` declarations and bundled docs. Current [official Gateway search documentation](https://vercel.com/docs/ai-gateway/models-and-providers/web-search) was verified on 2026-10-18. The full public model catalogue contained 476 entries; this feature introduces no model default and uses the original run's admitted model.

Perplexity and Exa are actual Gateway provider-executed tools. Perplexity accepts regional, language, domain or relative-recency defaults; Exa accepts regional, domain, published-date and category defaults. Unsupported combinations are rejected. Perplexity cannot mix included and excluded domains. Dates are validated; reversed intervals fail.

Factory values are defaults. Aux returns the requested query/filters, exact factory defaults and observed provider tool inputs separately. It never asserts that the model used the requested values or that defaults were enforced. Actual provider request IDs, available source IDs, URLs and excerpts form the results; assistant prose is never promoted into source evidence. Unsafe URL schemes are refused. Duplicate URLs are removed; bounded results explicitly report truncation.

## Original ownership and accounting

- The loop captures its original model client and model/account generation. Search preparation and execution reject a changed generation. Original run control, configuration, selected-source authority, policy, native window where present, cancellation and final publication checks remain active.
- The existing governed egress path reviews the exact search request digest before dispatch. Once-grant consumption is bound to that invocation and retained only while its original owner/policy stays current. Vercel connections additionally use their existing exact account, team, token and native-source transport checks.
- `RunService.utilityClient` bills the original run. It reserves a shared family model call, funding and account budget; no separate agent or synthetic run/window is introduced.
- There is one SDK stream step, one admitted provider attempt, `maxRetries: 0`, and no SDK follow-up generation loop. At most eight returned executions and twenty sources are accepted; input/result byte bounds, stream idle timeout and cancellation apply.
- A conservative additional $1 reservation covers potentially separate search charges; it is an estimate, never an actual price claim. Actual token/cache counts preserve zero versus unknown. Completed receipts survive invalid projection, owner retirement and failure.
- Gateway-reported cost and Exa's reported search-cost component remain distinct. Their inclusion relationship is not verified by the current interface documentation. Aux does not add them together or report a missing search component as free. Aggregate invoice cost stays unknown unless search cost is explicitly zero; then ordinary model-cost accounting applies. Original reported components remain in the encrypted receipt/result. Actual billing reconciliation requires live provider evidence.

## Evidence

Focused fixtures use the actual installed SDK and synthetic provider streams for both search factories, including actual rewritten tool input, source identity, errors, bounds and zero/unknown receipts. They verify original Vercel admission, the original running control/ledger, stale account rejection, Stop, source retirement after completion, shared reservation margin and labelled/filtered fallback behavior. Existing agent tool, parallel read and account admission tests remain covered.

No configured credentials, live inference/search requests, third-party messages or native build were used. The public model catalogue and official documentation were read without credentials. Live provider and daily-use acceptance are separate evidence.
