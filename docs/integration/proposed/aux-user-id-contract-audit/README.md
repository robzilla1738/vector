# Serialized profile user identity audit

Read-only review, 2026-10-22. No field was renamed, no app was launched and no
owner state was read. `source-evidence.json` records complete file hashes and
every original occurrence with exact offsets. Source is frozen1852 daemon/CLI
and Agent; native evidence is the current Aux checkout and must be re-pinned
when implementation changes. This is a coordinated contract change, not a
private JavaScript variable rename.

## Actual contract and paired boundaries

The supplied daemon has14 occurrences, Agent has10 across three modules, and
CLI has zero. Intended successor field is `auxUserId`; underlying user ID values
must remain identical. `boundUserId` is a separate supported identity field,
not old branding and not a value to reset or blindly overwrite.

| Boundary | Actual producer and receiver | Coordinated implementation |
| --- | --- | --- |
| Native profile context → Agent | Current `AuxAccountFunction` getProfileContext returns `boundUserId` from `aux.account_user_id`; native getProfiles returns it from verified ProfileSecurityState. Agent background `Ov` and queries `Dr` read `asideUserId || boundUserId`, then check `boundAccountId` against daemon account.userId. | Rename only the optional legacy field read/schema; retain verified `boundUserId` and exact account/user equality checks. Native currently emits no `asideUserId` field. |
| Agent context → daemon profile/account routes | Agent background `zv` and queries `Ai` serialize the field into an in-memory context cache key; actual context objects go to `accounts.ensureProfileAccount`/resolve routes. Agent type module `U` and daemon `chromiumProfileContextSchema` define it as optional nonempty string. | Both schema copies, both cache-key serializers and both guards must change together. Keep profile IDs, account IDs, bindingVersion and localOnly semantics. |
| Agent sign-in continuity | queries `Ui` compares both pre/post sign-in contexts using `asideUserId ?? boundUserId`, plus profile ID, bindingVersion and localOnly. Type module `F=U.pick(...)` includes the field for auth context. | Rename both comparison sides and the pick key, without weakening stale-context rejection. Other Agent modules import these exported schemas/functions, rather than containing a second literal. |
| Daemon sign-in | `resolveFreshSignInAccount`, `assertChromiumSignInAccountAvailable`, `prepareChromiumSignIn`, `assertAccountOnlyCallbackAllowed`, `assertAttemptMatches`, token handling and `ensureProfileAccount` all read the same field/fallback. | Rename all reads in one pinned transform. Retain owner incarnation checks, cloud user mismatch rejection, explicit account binding, sign-in attempt ID/expiry and prepared-context equality. |
| Daemon → Browser CDP | `ensureProfileWindow` sends `Browser.ensureChromiumProfile` params `{chromiumProfileId,asideUserId:account.userId??'',url?,shouldFocus?}`. Only method-not-found -32601 falls back to `Browser.ensureProfile` after account/profileIndex checks. | Change the request field together with any implemented receiver. No handler for this custom Browser method or `asideUserId` field was found in the inspected native Browser/extension roots. Existing fallback must not be represented as a verified receiver for the new field. |
| Local HTTP sync-passphrase | `GET /auth/sync-passphrase` optionally reads query `asideUserId`, validates current authenticated user both before and after awaited fetch, returns `{accountId,passphrase,asideUserId}`. | Rename query and output together; retain localhost/auth checks and before/after user binding. No matching literal caller was found in the inspected Agent/CLI/current native sources or project cloud code. Pin/discover the actual intended consumer before claiming end-to-end sync. Do not print passphrases. |

Native `aux_chat_navigation.cc` already sends `boundUserId` to the daemon's
ensureProfileAccount route; native account-bootstrap state reads `boundUserId`
or persisted binding `userId`. Current extension API returns `any` for context,
so its JSON declaration has no separately typed old field. None of the four
hashed native files contains `asideUserId`. Searches also found no occurrence
in current `chrome/browser/ui`, `chrome/browser/aux`, `chrome/common`, or
`chrome/browser/extensions` C++/header/PDL/JSON inputs. This does not prove
the original proprietary native implementation had no such consumer.

## Persistence: what actually needs migration

The reviewed direct field references are transient context/sign-in state:

* Daemon `attempts` is a process-local Map with ten-minute expiry and at most100
  entries. `prepareChromiumSignIn` stores a shallow context copy. Auth callback
  exchange parses optional `profileContext` through the same schema. Stop the
  old process and explicitly expire/restart pending sign-in flows; do not adopt
  an old attempt under new semantics or mark an account authenticated.
* Agent context cache keys include the field through JSON.stringify. They are
  in-memory cache keys; invalidate caches/reload consumers during the stopped
  generation switch. Existing ownership epoch checks must remain.
* The actual persisted `lastResolvedProfileAccount` cache writes only accountId,
  boundAccountId, boundUserId, profileId and validatedAt. It does **not** store
  asideUserId. Reader checks these fields and a24-hour age. No field rename is
  needed in that cache; clearing or migrating it requires the existing bounded
  renderer transaction, not an invented daemon file operation.
* `<Aux home>/accounts.json` account registry v1 stores account.userId,
  profileBindings[*].userId, profileAccountBindings[*].accountId,
  localBootstraps[*].boundUserId and session tokens. Its declared schema has no
  asideUserId. Do not rename these keys, change their values, copy token data
  into evidence, or gratuitously rewrite accounts.json for this field.

There is no proven JSON/SQLite/localStorage persisted `asideUserId` member in
these actual schemas. This review is static, not an owner-store scan and not a
guarantee about arbitrary older/unknown pending payloads. A stopped disposable
migration should reject ambiguous documents containing both fields with
different values; never let unknown-field stripping silently select an account.
Previously recorded broad statements that stored sign-in/profile contexts need
file migration were provisional; this audit narrows the known direct boundary
to process memory and request payloads. Other state2 migrations still apply.

## Implementation order and lean acceptance

1. Pin current composed daemon and the three original Agent modules against the
   evidence. Resolve the custom Browser method and local sync consumer gap.
2. Add one explicit source-count transform for all14 daemon and10 Agent
   occurrences, including schema/pick/export consumers. Keep user values and
   fallback policy unchanged. Change the CDP request and HTTP query/output as
   part of that same versioned generation; do not independently ship them.
3. Extend generation/package gates so old/new schema fields cannot mix across
   daemon, Agent, native receiver and startup profile. Never use permissive
   dual-field precedence: reject conflicting old/new identity values in any
   separately reviewed transition reader. Such a transition reader is not yet
   implemented by this review.
4. Under actual stopped-writer ownership, invalidate transient Agent caches,
   reload contexts and restart incomplete sign-in explicitly. Do not migrate
   an in-flight auth attempt or reset credentials. Preserve persistent user IDs,
   account incarnations and current accepted app/UI until successor acceptance.
5. Focused schema/VM fixtures should cover valid boundUserId fallback,
   auxUserId+boundUserId mismatch, stale account/user/epoch, localOnly, optional
   field absence, prepared-attempt equality and HTTP identity changes across an
   awaited fetch. Then one disposable actual profile-switch/sign-in rejection
   observation and paired Browser/HTTP consumer check. Parsing alone is not
   runtime acceptance. No real account sign-in is authorized by this audit.

Vault static inputs also contain the old field but the password-manager product
is excluded; do not restore or ship it to make a count disappear. No crypto label,
credential envelope, provider catalog, UI CSS/image or legal notice is changed.
