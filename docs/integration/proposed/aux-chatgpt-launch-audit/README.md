# Aux launch provider audit — 2026-10-23

The owner chose BYOK for the initial launch, with an official ChatGPT subscription connection as a separate pending integration and Aux payment plans deferred. This static audit identifies reusable supplied implementation; it does not establish real connection, credential protection or inference acceptance. The accepted desktop app and UI were not changed.

## Available supplied path

The accepted extension's `connect-dialog-CacgpFap.js` contains the existing OpenAI API-key form and calls account-scoped `models.setCredential` with an `api_key` credential. The daemon's setter writes through `CredentialStorage` and rewrites routing to available models. `openaiProvider()` uses `https://api.openai.com/v1` with `openAIResponsesApi()`. Preserve these supplied dialogs and rendering when integrating the launch policy.

The supplied ChatGPT dialog is also present, but its available code is the legacy Codex flow. `createOpenAICodexAuthorization` and `exchangeOpenAICodexAuthorizationCode` use fixed shared client `app_EMoamEEZ73f0CkXaXp7hrann`, `originator: aside`, redirect `http://localhost:1455/auth/callback`, and scopes `openid profile email offline_access`. `openaiCodexProvider` and `resolveCodexUrl` use `https://chatgpt.com/backend-api/codex/responses`; catalog and usage use private ChatGPT paths. This is not the new official Aux registration flow merely because the UI says ChatGPT.

## Existing protections and remaining custody verification

The daemon flow generates a 32-byte random PKCE verifier with S256 and random 16-byte state, retains flow context with a ten-minute TTL, and binds callback servers to loopback. Its manual callback path accepts a code without state; supplied state is compared when present. The token exchange stores access/refresh tokens, expiry and extracted account ID, without the new returned-scope grant check or issued-client persistence.

`CredentialStorage.create` selects `FileJsonStoreBackend` at `<account-root>/credentials.json`. The writer serializes raw JSON through a mode0600 temporary file, fsync/rename and locking. Agent-file sync watchers and credential merge code include this filename. Static inclusion is not proof that any particular existing key was uploaded, leaked or exposed. Protected, local-only handling for new ChatGPT tokens remains unverified and must be explicitly integrated rather than assumed from file permissions. Existing credentials must not be deleted or silently reinterpreted.

## Official-flow migration required

Use the current [Sign in with ChatGPT documentation](https://developers.openai.com/siwc/token-sharing-open-source/sign-in) and [integration cookbook](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt). The parent integration task reviewed these references; this lane made no network requests.

1. Register Aux through `dynamic_agent_client` on first registration, with the actual application name Aux and a stable locally held `ext_agent_host_id`.
2. Persist the issued client ID returned by the registration callback and use it for subsequent authorization and refresh.
3. Request resource `https://api.openai.com/v1` and scopes `openid profile email offline_access resource.invoke chatgpt.tokens.use.direct`; validate the returned grant before enabling inference.
4. Route the resulting authorized tokens through the public Responses API rather than the legacy private Codex transport. Review catalog/usage features against documented endpoints rather than carrying private-path assumptions forward.
5. Keep subscription credentials protected and local, explicitly excluded from credential sync. Reuse existing UI and preserve existing account/key state through any versioned migration.
6. After implementation and applicable authorization, perform focused real connect, refresh, disconnect and bounded inference checks. No such acceptance was performed by this audit.

Exact static file paths, byte sizes, hashes and absent-term counts are in `evidence.json`. No source edits, broad tests, signing, account operations or runtime authentication were performed.
