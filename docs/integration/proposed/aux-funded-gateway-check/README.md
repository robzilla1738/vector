# Actual funded GPT-6 Luna boundary check

On 2026-10-23 one real Gateway Chat Completions request succeeded with the exact owner-authorized `openai/gpt-6-luna` model. It used the maintained Aux `safeTextRequest`, `inferenceCost` and `tokenUsage` implementation, strict Zero Data Retention and disallow-training flags, `store:false`, 64 output tokens, no reasoning, no tools and no fallback models. The synthetic response matched `AUX_OK`. No retry or other inference request was sent.

The live catalog priced this request at approximately $0.0000047 from 12 input and 7 output tokens, before the Aux accounting margin. Aux's rounded estimate with its margin is 6 microdollars ($0.000006). The preflight conservative byte/token reservation was 79 microdollars, below an independent $0.001 request ceiling and far below the owner's $5 total authorization. These are catalog/accounting estimates, not a verified Gateway billing ledger. Generation ID is in the sanitized evidence for dashboard lookup.

The existing local Development OIDC token was expired. A fresh Development environment was pulled privately from the already-linked, explicitly selected personal `aux-cloud` project into a new 0600 file inside a 0700 temporary directory. It was consumed only inside the process, never printed or committed, then deleted. Existing environment files and provider credentials were not changed. No account, key, budget, database record, deployment or desktop artifact was created or changed.

This establishes funded Gateway connectivity and the actual Aux request-normalization/privacy boundary. It does **not** establish hosted sign-in, wallet debit/settlement, desktop inference, production activation or independent provider-routing audit. The response did not expose a provider name; actual provider/routing log inspection remains separate.

The current exact GPT-6 Luna catalog accepts text/image/PDF and emits text. It has no audio input or speech output, so no transcription or speech request was sent under the Luna-only task scope. Hosted speech requires a separately selected authorized ZDR transcription/speech model and actual flow acceptance.

`check.mts` records the one-off check source. Its original execution imported the maintained workspace implementation and wrote only a sanitized temporary result; it is evidence, not a repeatable production runner. Do not run it again without counting any new spend against the authorized total. `evidence.json` preserves actual timestamps, sanitized request/response metadata, source hash and cleanup.

Current primary references: [Gateway Chat Completions](https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions), [live exact model catalog](https://ai-gateway.vercel.sh/v1/models/openai/gpt-6-luna/endpoints).
