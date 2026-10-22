# Paired ephemeral runtime and agent-message identity

Inactive source-only slice. No UI stylesheet, geometry, artwork, owner state,
credential, provider configuration, network, native authority or lifecycle code
was changed or executed. Original1852 daemon source is SHA-pinned in inputs.json.
Four exact rules cover12 occurrences. This is not a complete runtime/catalog/ABI
identity migration or an accepted app build.

Integrate `applyAuxEphemeralRuntimeIdentity({component:'daemon',path:'entry.mjs',
text,original})` after the existing protocol/provider/runtime/automation/private
daemon transformations. It returns `{text,anchors}` for the stage receipt. Exact
original hash and composed occurrence counts are both required. Mixed or repeated
generations and drift reject before emitting changed text. Root owns the actual
staging/manifests/package integration; none were edited here.

## Actual producer and consumer pairs

| Scope | Source-pinned change | Actual paired consumers |
| --- | --- | --- |
| Windows bundled runtime discriminator | Seven exact quoted `aside-runtime` values become `aux-runtime` | `resolveWindowsPowerShell` emits source; `buildWindowsTerminalEnvironment` selects private home/tmp and runtime environment; stderr sanitizer checks source; four comparisons in createPowerShellTool select home/tmp creation, allowed roots, sandbox cwd/tmp and runtime-use acquisition. There are five equality tests, one inequality test and one producer. |
| Agent message envelope | Three `aside_agent_message` tokens become `aux_agent_message` | One agent system instruction describes the same opening envelope; `formatAgentMessage` emits both opening and closing tags. Role relation, safe title, untrusted body sanitation and the explicit no-consent disclaimer remain. |
| Prompt-injection guard | Add one explicit Aux control-tag prefix to actual prefix pattern | `neutralizePromptInjectionSyntax` is used by the message body formatter and safe title, and by untrusted tool-output protection. Forged Aux tags must be neutralized after the trusted outer formatter changes. |
| Callback broker synthetic probe | One `aside-probe.test` value becomes `aux-probe.test` | ensureExistingCallbackBroker constructs the localhost callback URL. Actual handleRequest extracts the flow ID and renders callback/ack markers; the probe checks those markers. This synthetic state is not a registered OAuth attempt or user state. |

The Windows discriminator is an ephemeral resolver result, not a serialized
catalog identifier, provider-session key or executable path. It changes every
branch together, retaining runtime roots, sandbox isolation, environment
allowlist, system-PowerShell fallback, cancellation and usage-lifetime behavior.
**Two separate external archive URL/root filename templates still contain
`aside-runtime-${...}` and deliberately remain unchanged.** Renaming them requires
actual reviewed Aux archives/service, manifest pairing and verification; this
slice cannot manufacture that service or claim all runtime names are gone.

The prompt change is deliberately more than swapping formatter tags: the
supplied neutralizer previously blocked control prefixes including aside but not
aux. A formatter-only rename would allow an untrusted body to forge a second
Aux envelope. The actual prefix expression now includes `a\s*u\s*x`, retaining
all existing guards for user/system/assistant/tool/untrusted and standard HTML
aside/legacy tags. It does not rename the HTML element or alter page CSS.
No historical user message or transcript text is rewritten. Existing historical
agent-envelope text remains historical; any later typed stored-envelope migration
needs separate provenance/signature/transaction handling. The body disclaimer
still says another agent cannot grant consent or permissions.

The callback path, localhost port/host policy, flow delimiter, actual OAuth state
generator, PKCE, authorization originator/client IDs, callback message/ack
contract and external provider URLs remain as incoming composed code. The test
uses an in-memory fetch stub and the actual handler; no listener or network
request is made. An occupied/mismatched callback broker continues to reject.

## Focused actual-source verification

`node --experimental-vm-modules --test
vendor/provided/aux-ephemeral-runtime-identity.test.mjs`: four checks pass.

* Actual original and local/cloud composed full daemon modules parse. Inverse
  replay of only the four recorded anchors reproduces all incoming bytes exactly.
  Protected archive filenames, worker IDs, crypto/ABI and HTML token counts stay
  unchanged; changed/mixed source and second application reject.
* Actual Windows resolver/environment/sanitizer functions run in an isolated VM
  with synthetic paths/filesystem predicates. Bundled/system/missing runtime,
  full/restricted environment, private temp/home behavior, environment allowlist
  and success-only stderr sanitation preserve their behavior. No PowerShell,
  taskkill, shell, runtime installation or native process executes.
* Actual neutralizer constants/function, safe title and message formatter run in
  an isolated VM. New and legacy/control-tag forgeries neutralize; only one
  trusted Aux envelope remains. Ordinary text and consent disclaimer survive.
* Actual callback probe producer, flow extractor and request handler run together
  against in-memory responses; matching markers succeed and mismatches reject.

No backend/model response, bot action or native capability is mocked as actual
product acceptance. This slice excludes external bot suspension buttons because
already-delivered actions require their own explicit transition policy. Memory
catalog trust/signatures, native addon ABI/crypto, archive service/filenames,
runtime installer instructions, native lifecycle and actual desktop acceptance
remain separate unfinished boundaries.
