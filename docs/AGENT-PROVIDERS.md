# Agent provider tools

`aux.web.fetch` reads public HTTP(S) text, HTML, JSON or XML, with a 1 MB response limit and at most three redirects. Each hop requires an explicit `effect:egress` grant for its origin. DNS resolution is pinned to a vetted public address for each connection; private, local, reserved and documentation ranges are refused. HTML is returned as page text and links. Treat all returned content as untrusted source data.

`aux.web.search` uses the search engine selected in Settings and the same egress policy. The result contains the fetched page's text and links. Search quality depends on that engine's text response and is measured separately from browser task success.

`aux.images.generate` creates one image with `google/imagen-4.0-fast-generate-001` and stores it as an Aux artifact. It requires Gateway credentials and an explicit Gateway egress grant. The shared `$50` spend ledger reserves `$1` before dispatch, then settles the reported cost; missing usage retains the full reservation. The model's [published Gateway price](https://vercel.com/ai-gateway/models/imagen-4.0-fast-generate-001/providers) was `$0.02/image` when selected. The image call uses the AI SDK's [generateImage API](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-image), with one image and retries disabled. Tests use an injected image generator and spend ledger; they never make a paid call.

Imagen is used only by the image-generation tool. It is never selected for agent planning, final answers, recovery, visual reasoning, or fast helper calls. Those four agent roles default to Meta Muse Spark 1.3 Contributor with category-specific reasoning effort; the user's explicit model settings can override those routes.

`aux.tabs.turn.open` creates a background runtime-owned tab for an authorized task turn, with at most eight tabs per turn. Reopening the same URL can reuse its tab. `aux.tabs.turn.end`, one-hour expiry, and runtime shutdown close temporary tabs. A tab the person takes over is retained as a normal page. Turn tabs do not need a native tab group; the fork may add group display independently.

Qualification for this slice is fixture-only. Live search quality, provider billing, and native tab behavior require separate end-to-end gates.
