# Chromium extension compatibility probes

These probes use Chromium's `chrome.*` extension APIs with a disposable profile, a localhost fixture, and a synthetic native-messaging host. They never use a personal browser profile or external account. The API matrix is independent of the Aux shell: a pass qualifies the compiled browser candidate's extension API behavior, not the Aux Settings UI or shipped signed build.

## Repeatable matrix

```sh
# Chrome for Testing control (reference only)
node tests/smoke/chromium-extension-compat.mjs

# Compiled Aux candidate; point to the executable within an isolated out/AuxProof or out/AuxDev build.
AUX_CANDIDATE_BIN='/absolute/path/to/out/AuxProof/Aux Host Proof.app/Contents/MacOS/Aux Host Proof' \
  node tests/smoke/chromium-extension-compat.mjs
```

The runner writes `release/test-artifacts/chrome-reference-extension-compat.json` or `release/test-artifacts/aux-candidate-extension-compat.json`. Each capability has its own result, so a timeout in one probe does not hide the rest. A failure sets a nonzero process status. The probe uses a fresh temporary `HOME`, user-data directory and downloads directory, and removes them after completion.

| Capability | Synthetic check | AuxProof 156 candidate, Sept. 25 | Limit |
| --- | --- | --- | --- |
| `tabs` | Create, get, query, remove a localhost tab | Pass | Aux shell placement remains separate. |
| `downloads` | Start and complete a localhost download | Pass | Aux download UI remains separate. |
| `contextMenus` | Create and remove an extension menu item | Pass | Native menu presentation needs a UI check. |
| `cookies` | Set, get, remove a localhost cookie with host permission | Pass | Profile isolation remains a separate gate. |
| `declarativeNetRequest` | Install a dynamic block rule, observe one blocked fetch and one allowed fetch, remove rule | Pass | Real subscribed rule lists and native Aux content-blocking apply remain separate. |
| `nativeMessaging` | Send a framed JSON message to a host manifest under the disposable user-data directory | Pass | Signed 1Password host discovery and vendor authorization remain separate. |
| DevTools extension APIs | Auto-open page DevTools; verify `chrome.devtools.panels` and `inspectedWindow` in `devtools_page` | Pass | Actual panel UI and Aux broker isolation remain separate. |
| Action popup | Verify configured popup and resolve `chrome.action.openPopup()` from a user click | Partial | Playwright does not expose the browser-owned popup surface; inspect its visible contents and placement in the candidate UI. |
| Store lifecycle | Browser-owned Store install, permission prompt, restart, update, removal | Manual gate | Use the interactive harness below. An unpacked extension cannot prove Store behavior. |

The Chrome for Testing control passed the same seven API checks and returned the same action-popup partial result. The old `chromium-extension-baseline.mjs` stops on a five-second tab-load timeout in AuxProof; this matrix avoids coupling a `tabs` API result to local-page load timing.

## Store lifecycle UI gate

Use a safe, publicly available test extension ID. This harness opens the Chrome Web Store listing in a disposable candidate profile, pauses for browser-owned install and permission prompts, then verifies install, disable/enable, restart retention, removal, and removal after restart through the official `chrome.management` API. It records the operator confirmation separately from machine-observed extension state.

```sh
AUX_CANDIDATE_BIN='/absolute/path/to/out/AuxDev/Aux.app/Contents/MacOS/Aux' \
AUX_STORE_EXTENSION_ID='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' \
  node tests/smoke/chromium-store-lifecycle.mjs
```

The ID above is a placeholder; use the actual Store listing ID. The script requires a terminal and writes `release/test-artifacts/aux-candidate-store-lifecycle.json` only after all observed lifecycle steps pass. A Store update needs a publisher to release a new version; the harness records update as unqualified until a real version transition is observed. Separately inspect the extension action popup, permission prompt text, and native context-menu placement in the candidate UI. Capture evidence from the actual candidate, with no personal account or credential in the artifact.

## Scope and next candidate

The probe ran against the already compiled isolated `AuxProof` executable at Chromium 156. The stable `AuxDev` build and signed distribution are separate candidates; rerun the same matrix against their exact binaries. Do not transfer an AuxProof pass to the stable-tag or signed candidate. The Store harness has not been run in this slice, because no test Store extension ID or operator UI session was supplied; the prior manual Store/restart proof remains a distinct, bounded artifact in the host comparison record.
