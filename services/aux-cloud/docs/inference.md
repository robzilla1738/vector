# Hosted inference and speech boundary

The existing supplied desktop UI calls the local daemon, which forwards hosted requests with the signed-in account's cloud access token. Mount `inferenceRoutes` at `/` after root authentication for POST routes. Catalog GET `/ai/catalog/v1`, `/ai/models/v2` and `/ai/model-catalog/v1/providers/:providerId` must remain public because the supplied catalog consumer does not attach cloud authorization. They contain no private data.

Server configuration:

| Environment | Default |
| --- | --- |
| AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN | Server-only authentication, never sent to desktop |
| AUX_AI_MODEL | openai/gpt-6-luna |
| AUX_AI_FAST_MODEL | openai/gpt-6-luna |
| AUX_STT_MODEL | spacexai/grok-stt |
| AUX_TTS_MODEL | microsoft/mai-voice-2.1-flash |
| AUX_IMAGE_MODEL | meta/muse-image-1.0 |

Defaults were verified in the public live Gateway catalog on 2026-10-21, including modality and `zdr:all`. Runtime revalidates configured models against the live catalog, caches metadata for ten minutes and fails closed on unavailable/non-ZDR models. All requests force `providerOptions.gateway.zeroDataRetention:true` and disallow prompt training; clients cannot override routing, providers, credentials, retention, fallback models or remote origins. Image/speech/transcription REST calls use the same privacy fields. Gateway remains the authority on available ZDR provider routes; a catalog label alone does not establish execution success.

Production model choice deliberately excludes `meta/muse-spark-1.3-contributor`: its current live catalog says `zdr:none` and `no_training:none`. At initial implementation the workspace's paid acceptance-test allowance named only that contributor model, so this lane made no paid inference calls. The owner has since explicitly authorized GPT-6 Luna under a $5 total test ceiling, coordinated by root. Actual ZDR execution still needs provider evidence; synthetic focused tests verify code boundaries only.

Text routes preserve OpenAI Responses, Chat Completions and Anthropic Messages protocols with cancellation, forwarding streaming output without recording body contents. Only client-executed function tools are accepted; provider-hosted tools, background conversations and stored response references are rejected. Provider error bodies are discarded because they can echo request data. Model IDs exposed to the existing UI are stable `grok-aux-balanced` and `gpt-aux-fast` aliases; the `aside` provider wire identifier remains intact.

`POST /stt/transcribe` accepts multipart `file` and optional BCP47-like `language`; returns `{text:string}`. File size is capped at 3 MiB and total request at 4 MiB, below Vercel's 4.5 MB request limit. WebM/MP4 from the existing MediaRecorder UI is why Grok STT is the default: official Microsoft transcription docs exclude both formats. The local UI limits recording to 90 seconds; actual provider duration is settled server-side rather than trusting client duration. Reservation/settlement must tolerate an actual duration above the initial 90-second reservation and debit it atomically.

`POST /tts/synthesize` accepts `{text,voice?}`, returns MP3 bytes. No new desktop TTS UI is introduced. `/speech/config` reports realtime disabled; the supplied product has no realtime consumer and this lane has not established a ZDR-locked delegated realtime-token contract. Returning a generic client token without that guarantee would permit weaker privacy than normal inference.

`POST /ai/images/generations` preserves supplied `{model:'aux-image',prompt,inputImages?}` and response `{model,images:[{type:'image',data,mimeType}]}` shapes. PNG/JPEG/WebP MIME comes from actual returned signatures. Reference images are sent as data URLs, never arbitrary remote URLs. Total upload is limited by the 4 MiB function boundary; preserving the supplied 20 MiB reference-image maximum requires the separate authorized private-upload flow, not increasing an unenforceable serverless body setting.

Usage reservations are atomic through `reserveUsage`: `inference_micros` reserves the live model's input/output price applied to conservative UTF-8 input bytes plus output budget, with a 20% operating margin, `transcription` seconds, `speech` characters, `images` count. Successful completed text can settle actual token metadata; aborted/dispatched requests settle conservatively so cancellation cannot bypass quotas. No prompt, audio, image, response body or API key is logged.

Sources:

- https://vercel.com/docs/ai-gateway/security-and-compliance/zdr
- https://vercel.com/docs/ai-gateway/modalities/speech-to-text
- https://vercel.com/docs/ai-gateway/modalities/text-to-speech
- https://vercel.com/docs/ai-gateway/modalities/image-generation/openai
- https://vercel.com/docs/ai-gateway/modalities/realtime
- https://ai-gateway.vercel.sh/v1/models

Model-price reservations reject catalogs whose price varies by provider, since an advertised minimum does not bound the cost of the ZDR route. Cache-read/write tokens are conservatively priced at the full input rate. Grok STT container compatibility is additionally documented at https://docs.x.ai/developers/model-capabilities/audio/speech-to-text.

Owner subsequently selected GPT-6 Luna for live bounded verification (maximum $5 total, coordinated by root). Both server aliases now default to its exact catalog ID `openai/gpt-6-luna`, whose catalog reports `zdr:some`; strict per-request ZDR remains mandatory. Input/output tiers use the input-context threshold, including the 272001-token long-context price increase. Input accounting conservatively includes the cache-write rate when higher than ordinary input. No test invocation was made by this lane.
