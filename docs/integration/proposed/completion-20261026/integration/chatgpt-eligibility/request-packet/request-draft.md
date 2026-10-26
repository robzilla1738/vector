# Draft request: Aux eligibility for ChatGPT plan usage

**Draft only — remaining distribution and submission facts below are unconfirmed; not submitted.**

Hello OpenAI team,

We are preparing **Aux**, a macOS browser with local profiles and an integrated AI assistant, and would like guidance on eligibility for users to authorize **ChatGPT plan usage for AI requests** in Aux. This is a request for the appropriate selected-private/commercial partner path, not a claim of an existing approval.

App name: **Aux**. Intended product domains: **getaux.co** and **app.getaux.co** (API/share host configuration is separate). Legal operator: **Courson Digital LLC**. Public support/privacy contact: **hello@getaux.co**. Authorized vendor-request representative/reply contact: **[OWNER TO CONFIRM]**. Current public/private distribution and commercial status: **UNCONFIRMED — [OWNER TO CONFIRM]**. Intended audience, rollout size and distribution channel: **[OWNER TO CONFIRM]**. Open-source publication/licensing status and rights: **UNCONFIRMED**; we are not representing the reused supplied implementation as publicly licensed or authorized for publication.

The current independent provider path is user-configured BYOK; Aux-hosted AI/payments are disabled in the launch configuration. Internal funded verification is separately restricted to Muse Contributor via Vercel AI Gateway with an aggregate $1 ceiling, not an OpenAI/ChatGPT-plan entitlement or a general authorization to call models. No Aux ChatGPT connection or inference result is being offered as approval evidence in this request.

Our prepared local client uses app display hint **Aux** (`agent_name_hint`), Authorization Code with S256 PKCE, fresh state/nonce and a stable per-host identifier. The prepared flow starts with dynamic_agent_client for the documented open-source registration, retains the actually issued client ID per account for later authorization, validates issuer/audience/subject and granted scopes, and uses the HTTP loopback callback **http://127.0.0.1:<selected-port>/auth/callback**. It requests **openid profile email offline_access resource.invoke chatgpt.tokens.use.direct** for resource **https://api.openai.com/v1**, with credentials retained in protected account-bound local Aux storage. We understand that this source implementation does not establish that an unpublished/private Aux distribution is eligible to use the open-source entrypoint.

Please advise:

1. Can Aux be considered for **selected-private ChatGPT plan usage**, and is this interest form the right route for that request as distinct from identity-only Sign in with ChatGPT?
2. Which application/distribution details and privacy/security materials are needed for your evaluation? If another partner contact or program is required, please identify the appropriate route.
3. If approved, what client-registration, callback, host-identification and scope/entitlement contract should this native local client use? In particular, should it use the documented dynamic flow or an issued application-specific registration? We are not requesting or supplying a client secret in this draft.
4. What permitted rollout, eligible plan/model/account restrictions and user-facing consent/usage disclosures should Aux follow before acceptance testing and launch?

Intended privacy/terms locations are **https://app.getaux.co/policy/privacy** and **https://app.getaux.co/policy/terms**. These currently exist as source review drafts; their hosted activation, retention and final approval remain pending. **[OWNER TO CONFIRM approved public supporting URLs or an appropriate private review document]**. The prepared design sends user-selected AI context to the chosen provider and stores provider credentials through the local account-scoped boundary; optional cloud features and private feedback/recovery need their own truthful disclosures. We are not claiming all data is operator-inaccessible or that vendor approval is already complete.

Thank you,

**[AUTHORIZED REPRESENTATIVE / VENDOR REPLY CONTACT TO CONFIRM]

Courson Digital LLC — Aux
Public support/privacy: hello@getaux.co**
