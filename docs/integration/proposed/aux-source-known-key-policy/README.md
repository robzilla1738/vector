# Source-known native credential policy v2

The previous immutable exact-key policy is too narrow for normal new accounts, MCP servers or channel connections: signing a fixed resource containing every future logical key would require repeated updates. The new native-only source-known v2 producer admits only labels constructed by actual supplied callers. The reviewed exact v1 initializer and matching behavior are unchanged; callers must deliberately select the new version.

Implemented families:

| Caller | Exact accepted label |
| --- | --- |
| Chrome sync/bootstrap | `aux.csk_<account>` |
| MCP index | `mcp:index:<account>` |
| MCP OAuth credential | `mcp:<account>:<server>` |
| Channel token | `aux.channel.v1.u<account>.<connection-UUID>.<platform>.bot` |
| Slack app token | `aux.channel.v1.u<account>.<connection-UUID>.slack.app` |

Account IDs use canonical nonnegative decimal in JavaScript's safe integer range0..9007199254740991. This corresponds to the supplied nonnegative integer account schema and stable numeric-string label interpolation; zero is valid, leading-zero/exponent/negative/unsafe representations are refused. MCP names exactly follow the source regex `[A-Za-z0-9_-]`, length1..32. Channels are source platforms slack/telegram/discord with canonical lowercase UUID connection identifiers; actual creation uses crypto.randomUUID(). Bot/app combinations match actual source calls. Unknown prefixes, malformed segments, non-ASCII data, embedded NULs, unsupported channel credentials and names exceeding the existing512-byte logical-key bound fail before any boundary query.

No native service/account/group selector is accepted from JS. Every allowed logical label is still SHA256-hashed over its exact UTF8 into `aux.<scope>.secure.v2.<hash>`, used as both service/account under the exact installation-paired Aux access group and existing Data Protection query. The scoped producer checks that protected installation/reserved selectors do not occupy that secure hash namespace, preserving separation without pretending it can enumerate an infinite family. Existing exact policies still reject family labels not explicitly listed.

`ImmutableAuxLogicalKeyPolicy.sourceKnownV2()` is the immutable native policy producer. `ScopedAuxCommandContext.runtimeSourceKnownFamiliesV2(terminal:boundary:)` composes it directly with the actual validated terminal/selection, reusing the same four-row scope/group and installation core. It creates no authority, policy receipt or admission Boolean. It is a practical host composition hook, not a JS factory or configurable regex/prefix grant. Current development-host files remain untouched and still choose their existing exact policy; the integrator must explicitly version that sealed policy selection before activating this producer. Once selected, legitimate future accounts/connections use the same source grammar and do not require per-account signatures.

Caller classification is grounded in the frozen source and actual composed daemon hash655ff1d4…: the generic secure-store callers resolve to MCP index/credentials, channel tokens, Chrome sync key/bootstrap, removed PWM/Vault storage/session functions and historical legacy DK/META installation functions. Removed PWM/Vault labels are not reintroduced. Legacy installation authority is handled by the reviewed installation core, not granted as generic credentials. Provider credentials use a separate FileJsonStoreBackend at credentials.json; this audit does not claim that file is encrypted or add arbitrary provider-label families. Frozen CLI has no saveSecureStorageItem/readSecureStorageItem/clearSecureStorageItem callers. No owner credential/registry file was read.

Verification:21 labels were generated from exact pinned caller function bodies in an isolated VM using only synthetic inputs.149 focused Swift checks exercised family acceptance/refusal, exact physical hash/group selection, unchanged v1 denial and actual secure-save/read/clear routing through a captured dictionary boundary, including zero boundary calls for denied keys. The current separate-file native production graph typechecked with the new scoped producer under the shared build lock. No module/host factory, Security adapter, owner state, OS effect, provider/cloud call, signing or UI was executed. Noncanonical existing imported channel IDs remain an explicit unsupported migration case; no broad fallback or destructive reset is provided.

Run the finite checks with `python3 scripts/native-build.py python3 docs/integration/proposed/aux-source-known-key-policy/check.py`. Existing historical proposal pins must be refreshed by the integrator only for these two changed source files; their older runtime receipts remain historical.
