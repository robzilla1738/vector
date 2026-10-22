# Aux runtime contracts and skill identity

Prepared successor-only changes. Current accepted app, native checkout, profiles,
provider data and signatures are untouched. This proposal changes no geometry,
CSS, images, fonts, glass, layout or browser interactions.

## Practical integration hook

`applyAuxRuntimeContractIdentity({component,path,text,original,branding:'aux'})`
authenticates the exact original1852 input with `inputs.json`, then applies
count-checked anchors to the composed Aux text. It supports supplied symbols for
fixtures and already Aux-capital-branded symbols for integration. Apply after
`applyAuxProviderIdentity` and before unrelated lower-case renames. Both existing
local and cloud-development daemon compositions replay14 runtime anchors after
provider migration. Pins cover16 source leaves and58 anchors in total, including the CLI MCP identity and user-facing command guidance. Mixed,
changed, twice-applied and unknown inputs containing covered contracts fail closed.
Unrelated files are untouched. Original/aux variants parse without running startup.

For Agent use its original relative JS path. For daemon use `entry.mjs`. For
static skills pass `component:'skill'` with path relative to
`Contents/Resources/static/skills/`, and consume the returned **path** as well as
text/anchors. In particular `builtin/aside/SKILL.md` becomes
`builtin/aux/SKILL.md`; its frontmatter and documented REPL calls migrate together.
The PDF skill's actual REPL calls migrate too. The app-staging output path mapping
must rename the whole `builtin/aside/` directory before writing leaves. Never
leave duplicate old/new catalog directories. The hook itself writes nothing.

Root must add the helper and pin inventory to adaptation inputs and apply it to
all generated daemon copies, including Node-development entry and SEA, plus Agent
and static skill staging/preservation replay. This proposal does not edit those
root-owned adapters, manifests, startup or packaging. A helper imported only in a
unit test does not activate migration.

## Coordinated flows

- Actual REPL object injection key becomes `aux`, retaining the original class,
  hardening, account binding, hooks and APIs. Both embedded tool instructions,
  sidechat transcript instructions, routine-tool callers and static skill docs
  use the same new namespace. Skill platform gates support `aux` and `aux-code`;
  daemon CLI skill allowlist and Agent skill activation/UI options agree.
- Native `aux_tabs_actions.cc` emits `aux.verticalTabsTidy`. Native
  `aux_notification_inbox.cc` emits `aux.inboxNotification` and
  `aux.notificationPermissionChanged`. All three actual Agent background
  receivers change together. Baseline/source/patch/manifest are prepared here,
  pinned to the inspected current native source; no native apply/build occurred.
- Daemon OAuth callback broker and the Agent callback/ack module use the same Aux
  message types. HTTP callback ports, origin/state/PKCE checks remain untouched.
- Task media/link producers and actual markdown parsers use `aux:task/`,
  `#aux-task/`, `#aux-task-file/`, `#aux-file:` and `#aux-routine:`. Four fixed
  slices (11,17,12,15) become new prefix literal `.length`; suffixes and encoded
  paths retain complete IDs. Existing traversal rejection is unchanged.
- Daemon embedded billing iframe and both Agent subscription/add-on checkout
  listeners use `aux:billing-embedded-checkout`.
- Google Docs selection request/response and set-selection request/response
  endpoints change on both the isolated-world content script and page bridge.
  No document read or write was performed.
- New Tab theme/sidebar preference readers and sidebar state/change producers
  agree on Aux event/storage names. State values are preserved by the explicit
  offline migration below; no new default visibility/geometry is introduced.

## Versioned persisted values

`migrateAuxRuntimeReference(value,{version:1})` changes only known leading task or
citation reference prefixes. It preserves encoded IDs and suffixes; unrelated
URLs and prose are untouched. Call it for known reference fields inside an
explicit authorized-state migration. Historical markdown transcript links need a
syntax-aware migration or explicit legacy reader before removing old support;
this helper deliberately does not globally rewrite user messages.

`migrateAuxRuntimeStorage({version:1,entries})` returns version2 and preserves the
exact existing sidebar preference value under `aux:web-sidebar-state`, retaining
unrelated entries. Old/new collisions refuse migration. It never loads or writes
localStorage itself. Root's authorized transaction must validate the actual
consumer schema, persist all values atomically, then advance the version marker.
`migrateAuxSkillMetadata(metadata,{version:1})` maps existing activation metadata
`agents:["aside"]`/`["aside-code"]` to the new names while preserving other fields
and refusing malformed agent lists. Apply in the same authorized versioned
transaction before the new gates are activated. It never scans or rewrites
user-installed skills or owner files itself.

Do not use a fresh default, duplicate directory, successful mock or deleted
credentials as a migration. Keep accepted app/state recoverable until the complete
successor's actual startup and profile/notification/task/skill behavior is checked.
No permission to access real owner state or sign is granted by this code.

## Focused evidence and boundaries

`node --experimental-vm-modules --test vendor/provided/aux-runtime-contract-identity.test.mjs`
checks actual pinned source replay, syntax and genuine HTML preservation; runs
real supplied account-bound REPL settings/project helpers through the renamed
global; executes actual task parsers and markdown conversion; replays native
patches only in a temporary tree and checks Agent receiver names; and verifies
provider-then-runtime ordering on both composed daemon modes. Synthetic fixtures
make no provider, network, Keychain, UI automation, native-build or OS calls.
This is not runtime notification/shortcut/OAuth/app acceptance.

Remaining separate contracts are explicit: `aside_dom` context-event enum and
persisted rows; native/browser URL scheme aliases; browser import source fields;
REPL/code product symbols outside these anchors; skill icon URLs and other public
asset domains; external MCP/client identifiers and source/tool marker names;
installation/native addon ABI and cryptographic legacy formats; historical user
transcript migration. Static legal/source records remain truthful and HTML
`aside` remains a valid tag. This scoped pass is not a no-trace claim.
