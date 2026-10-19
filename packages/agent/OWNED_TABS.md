# Agent-created target ledger

Implements `docs/spec/daemon/services.md` tracked tabs and
`docs/spec/native/surfaces.md` agent-tabs bubble using original ownership receipts.
Primary upstream contracts: Chrome extensions debugger/getTargets and storage/session
at https://developer.chrome.com/docs/extensions/reference/api/debugger and
https://developer.chrome.com/docs/extensions/reference/api/storage; Page.getFrameTree,
Page.navigate and Page.close at https://chromedevtools.github.io/devtools-protocol/tot/Page/
(accessed 2026-10-19).

`AgentEngine.tabs` owns an account SQLite `ownedTabs` ledger with session, profile,
normal/incognito binding, stable debugger target ID, numeric Chrome extension tab ID,
main-frame/loader document ID and committed URL. A random private creation receipt is
stored in both the daemon and extension's mode-scoped session storage only when a tab
is actually created. Lists and mutations revalidate the receipt against current native
account/profile context, debugger targets and committed document. Reused tab numbers,
matching URLs, changed documents and disappeared targets never establish ownership.
Creation receipts and document proof values are omitted from public API/model results. Extension session storage
survives worker suspension; stale records fail closed after browser restart.

Tools: `browser_open({url,active?,autoClosePolicy?})`, `browser_owned_tabs({})`,
`browser_close({targetId,tabId?})`. The existing browser_navigate advances a still-owned
receipt only through the ownership-verified navigate command. A navigation through an
untracked mechanism, including a user navigation or a click-triggered new document,
conservatively releases cleanup ownership. It is never reclaimed by observing a URL.
Direct custom-script/extension-created tabs outside this path are not adopted.
Root REPL open/close must map to these same tools rather than raw tabs.create/remove.

Regular router: `tabs.list({...sessionScope})`,
`tabs.resolveByTarget({accountId,targetId,profileId?,browserMode?})`,
`tabs.remove({...sessionScope,sessionTabId})`, `tabs.cleanup({...sessionScope})`,
`tabs.setPolicy({...sessionScope,autoClosePolicy})`.
Default policy `keep` preserves created tabs; `on-completion` authorizes positively owned
tabs to close after a successful idle/aborted run when no queued continuation exists.
Policy is retained per session for future created tabs. Cleanup explicitly requested by
the owner closes all currently verified owned targets. Session archive/delete and
account deletion finish runs, apply configured auto-close and release remaining receipts;
kept tabs become ordinary tabs. A changed binding releases metadata without closing a
target in the old profile. Transport unavailability never counts as successful closure.
A close uses Page.close addressed by exact debugger target and verifies disappearance;
beforeunload refusal/unknown outcomes retain the receipt rather than report closure.
No user tab receives a generic numeric-tab-ID close from these tools.

Native projection: export `installOwnedTabsHttp(app,services,engine,vault)` from
`apps/daemon/src/sessions/owned-tabs-http.ts`; mount BEFORE installSessionHttp because
its generic session POST route would match agent-tabs/close. Requests carry accountId,
profileId and browserMode in query (GET) or body (POST). Modes explicitly accept
normal/default/incognito; normal maps to default and unknown values fail. Conflicting
query/body scopes fail. The profile must currently belong to the account. The required fourth argument is the
actual live VaultService status provider; every request rejects an unconfigured, locked
or unonboarded account. Closure rechecks current security after async ownership reads.
Engine lifecycle cleanup does not use this interactive HTTP gate.

- GET `/session/for-chrome/agent-tabs` returns `{groups,available,unavailableSessionIds}`;
  groups contain sessionId/title/autoClosePolicy/tabs. Verified partial groups return
  available=true plus unavailableSessionIds; all unavailable observations return false. Tabs include targetId, tabId,
  title, url, createdByAgent=true and keep/on-completion autoClosePolicy.
- POST `.../agent-tabs/close`: scope plus sessionId/targetId/tabId; exact owned closure.
- POST `.../agent-tabs/cleanup`: scope plus sessionId; verified owned cleanup only.
- POST `.../agent-tabs/policy`: scope plus sessionId/autoClosePolicy.

Native activation should resolve the live debugger target to WebContents; Chrome
extension tab IDs are not native SessionID values.

Focused disposable fake-bridge tests cover exact-identity refusal, changed documents,
user-tab preservation, agent navigation, completion policy, termination and changed
profiles. Agent/daemon/extension TypeScript checks and browser bundle compile pass.
Live debugger target creation/close and worker restart remain to be verified in the
integrator's disposable native browser. No owner profile was opened or mutated.
