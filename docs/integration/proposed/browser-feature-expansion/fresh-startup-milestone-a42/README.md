# Fresh disposable browser milestone A42

The owner authorized the smallest correction to ordinary startup. This milestone does not add features or replace the accepted preview. The package is assembled, **unsigned, unexecuted and not yet testable**.

Candidate: `/Users/rcourson/Documents/Vibe/web/out/provided-candidate-fresh-browser-20261024-a42/Aux.app`.

## Implemented and assembled

- The development launcher selects only the explicit `ordinary-fresh-v1` candidate and its fixed private data/cache/control roots. It refuses legacy profiles, startup overrides and inherited provider/Node/DYLD configuration. Its preflight passed against the actual assembled candidate without executing product code.
- Native primary startup no longer requires Endpoint Security for ordinary browsing. The real signed parent/daemon, installation authentication, root bindings and generation checks remain required before ordinary Chromium writes. No shell Node fallback or fabricated admission is used.
- The native Profile initialization hook runs after real preference initialization and before keyed services, rechecking the genuine Profile lifetime. Profile identities still come from the existing native factory.
- The paired daemon uses the actual embedded main-only entry. Aux-launched supervised tasks, workers, exec/PTY, Computer Use and native-addon loading are refused in this mode. Standard Chromium child processes retain their usual browser lifecycle; their absence is not reported as privileged supervision or CLEAN recovery.
- The full unsigned native browser build passed on 419 pinned inputs. The complete daemon linked from three changed C++ owners and 48 Swift sources. The first full browser build failure was stale generated Mojo output; regeneration changed only source timestamps, and the complete second build passed. Earlier failed receipts remain historical.
- One complete package contains that browser, paired daemon executable/source/entry, existing UI revision33 and dormant CLI. All unrelated leaves, supplied UI, CSS, artwork, fonts and modes are preserved from A40. Inventory:11,188 leaves, `ebaaa36d9aac755d13840b0faba5b94b6a178c2859e7b05291196ed74ca75dbe`.
- A distinct ordinary-root lease supports same-scope reopening through actual dead-browser identity and retained native locks. It rejects supervised/legacy records and never labels them CLEAN. This is compiled implementation, not proven restart behavior.

## Next gate: narrow local signing

The earlier A40 process received SIGKILL; macOS assessment found no usable signature, but no independent matching crash/kernel record was available. This does not prove all startup defects are fixed. A42 must first receive valid local signatures to test its actual startup/authentication.

The concrete [review](signing-review.json) contains exactly17 objects:16 native browser objects (outer app, framework, eight helper apps, three tools and three libraries) plus the paired daemon. Use only the existing `Apple Development: Robert Courson (68DV3N28DS)` identity, SHA1 `47ACA5D1CFADD21CFEDC589B4DEED6E2B7A96D90`, team `9F2JXY8TCK`. Reuse the already-existing non-ES wildcard profile for the daemon. No capability application or new provisioning is needed for this ordinary mode.

The proposed operation is confined to this inactive candidate and `/private/tmp/aux-fresh-browser-4qtjms51`, including new disposable installation/authentication entries in `9F2JXY8TCK.dev.aux.local`. Chromium still uses mock Keychain. No owner profile, credential or unrelated Keychain item is included. The accepted app stays intact. The review does not authorize execution; wait for the owner's explicit exception before running `sign-reviewed.py` or opening the app.

JIT is the only browser entitlement. The daemon additionally receives its fixed application/team identifiers and exact local access group. Endpoint Security, debugger access, disabled library validation and new OS grants are excluded. CLI, Computer Use, memory, PDF, macOS utilities and PTY/native addons are not signed or activated by this action. No notarization, distribution or release work is included.

## Finite actual-app checklist

Every row remains **untested on A42** until local signing and real product execution. Source checks, successful compilation and resource equality are not runtime passes.

| Check | Focused acceptance |
| --- | --- |
| Startup | Actual candidate opens, paired daemon authenticates, fresh native Profile initializes, no owner/legacy state is read. |
| Navigation | Loopback fixture loads; URL entry and back/forward work; page updates after navigation. |
| Two profiles | Personal/work get distinct native identities; fixture cookies and localStorage remain separate through switching. Extension data isolation still requires the separate extension check below. |
| Multiple windows | Same-profile shared tab list and independent selected tab/view; second profile remains isolated. |
| Drafts/attachments | Synthetic unsent draft and local attachment survive view/window changes and an owned-candidate close/reopen. No real account or inference required. |
| Sidebar/chat/settings | Inspect actual pinned/collapsed/hover/sidebar transitions, right chat and settings. Compare the real candidate to supplied reference captures/accepted appearance, preserving all accepted UI. |
| Restart | Close only this owned candidate, reopen the same fixed scope, confirm persisted fixture state and drafts without false clean-recovery claims. |

Fix only demonstrated failures and repeat affected checks. If an unexpected dependency needs a larger architecture, report the specific problem and smallest viable correction first. Do not begin another feature batch.

## Explicit follow-ups and limitations

- Account-dependent BYOK and eligible ChatGPT/Codex connection/model response: **untested**, not silently accepted or removed from the roadmap. No owner/provider credential or paid inference is used here.
- Chrome extension install/profile isolation, 1Password autofill and optional native messaging/desktop companion: **untested**, separate follow-ups. Chromium compatibility alone is not acceptance.
- Supervised AI tools, agent automation, Computer Use, PTY/exec, PDF/OS utilities/native addons: **disabled in this ordinary candidate**. Opening the browser does not complete those features.
- CLI URL routing: packaged but inactive/unexecuted; follows browser startup and does not hold up this first browser milestone.
- Legacy migration, advanced crash/interrupted-write recovery and the new task-capability architecture: **deferred**. Existing profiles remain refused; this candidate is for the fixed fresh disposable scope and cannot be distributed for ordinary user installation.
- Local development signing and actual focused checks remain pending. Production signing, notarization, distribution, account-dependent acceptance and broader feature acceptance remain release blockers.

Evidence: `actual-browser-compile-a1/a2.json`, `actual-daemon-build-a4.json`, `full-build-command-a2.json`, the linked full-build receipt/inventory, `actual-package-a1.json`, `actual-launcher-preflight-a1.json`, and `signing-review.json`. No product signing, app execution, owner-state operation, provisioning or release has occurred in this milestone.
