# ChatGPT login lifetime successor — inactive source only

This proposal preserves the supplied ChatGPT connection protocol, provider URLs, registration/token formats, callback HTML, dialog behavior and lock inode format. It fixes physical cleanup ownership; it does not add a subscription API, launch a login, access credentials, or run a provider/client/native process.

## Changes

The daemon adapter (`source/transform.mjs`, `transformAuxChatGPTLogin`) applies seven count-one replacements to the actual 166-anchor ordinary and dormant pair. The pinned original manager callback factory uses a separate ChatGPT owner. Custom/replaced callback factories still take the original unknown path. Accepted callback servers retain their listener, response and socket callbacks through actual server close, including an in-progress listen. The existing broker probe and manual fallback now use the retained refresh transport. Flow expiry/cancel aborts the private pending client attempt; completion releases only the flow registration. Client operations and broker sockets have independent retained lifetimes.

The existing shim is configured once by the private daemon loader. `complete`, `auth`, `modelIds` and `signOut` retain their whole reviewed bodies, including the credential lock transaction. All shim client HTTP requests use the existing retained transport implementation, which drains response bodies, DNS callbacks, sockets, clients and dispatcher destruction. The native producer stop closes admission, aborts outstanding requests and waits for real callback settlement. Expected authorization errors are propagated after that settlement; transport/callback uncertainty still marks native work unknown.

The four shim replacements change `LocalChatGPTStore.diskLocked` to wait for the actual child `close` event before its `finally` can close the inherited lock descriptor. An `error`, timeout, kill request or abort does not settle the child. The direct child retains its existing `/usr/bin/lockf -s -t 0 3` invocation, environment, descriptor and locking behavior.

**Unresolved native boundary:** this inherited-FD spawn is outside the current native Exec/PTY protocol. The shim explicitly marks native descendant work unknown before spawning it. Its actual direct `close` is not a cohort receipt and never clears that unknown. A future authenticated native FD-lock operation or native descriptor-inheritance/cohort seam is needed before successful credential operations can be called fully drainable. No JS PID, proof flag, child-exit inference or native unknown reset is introduced. Inference Responses streaming remains the existing separate agent/transport boundary and is not claimed as covered by this login patch.

## Exact inputs and package handoff

- Daemon base: `/private/tmp/aux-standard-daemon-projection-20261024-a3/index.mjs` and its actual `projected-entry/aux-native-entry.mjs`; hashes are in `overlay.json`.
- Added daemon stage: `chatgpt-login`, seven edits; exported text transform returns `{text, changes}`. It is disjoint from Claude and Meta provider patches. A successor producer must independently replay on both cumulative leaves and invoke the original dormant projector; this lane has not done that final projection.
- Shim baseline: `vendor/aside/shims/aux-chatgpt.cjs`, SHA-256 `5fa0b56141c9fb515c6b5ff979340c0958bf3b9dd79fb60a7636357605e73ede`.
- Shim successor: `source/aux-chatgpt.cjs`, SHA-256 `43f8ce1e95d34c3deeca3f6c0a2cecd8b55dcce2342a09f490fbfc06d496e3ef`.
- Shim exact replay: `source/shim-anchors.json` (four count-one edits), exported `transformAuxChatGPTShim(input) -> {text, changes}`. The transform requires byte equality with the reviewed full shim output.
- The only added non-entry package delta is `apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-chatgpt.cjs` relative to the existing provided-resource root. This is an existing file replacement, never an absence/new-file rule. Preserve its existing mode. `scripts/lib/provided-apps.mjs` currently sources this leaf directly from the repository shim; no stager/root shim has been modified here.
- Root must pin the exact original package leaf independently, replay four edits, require equality with the new projected shim and preserve all other package gates. This is separate from the unchanged bootstrap/seed publisher helpers and runtime metadata. No native objects, imports, ABI, UI assets, browser sources, signing or runtime authority flags change.

`overlay.json` fixes the text module and its five dependencies plus individual daemon input/output/change digests and the shim's input/output/replay digests. `source-check.json` records actual isolated paired text replay and syntax results. It is not a new source/native binding or package acceptance record.

## Focused evidence

`node check.mjs` uses only inert fake callback sources: shutdown waits for both broker close and transport drain; lock acquisition error/abort waits for the actual fake child close; descendant unknown is retained. No socket, filesystem credential, subprocess or product is created by that check. Paired ordinary/dormant and shim replay/syntax passed. Full original-projector equality, final cumulative provider composition, packaging and app testing remain the integration lane's work.
