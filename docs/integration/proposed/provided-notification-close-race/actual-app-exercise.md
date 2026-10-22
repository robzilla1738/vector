# Bounded actual-app routing acceptance (root executes)

Use only the already approved disposable Aux profiles/windows and the current
candidate's actual Agent extension page. No OS notification permission, provider
request, helper, network endpoint or new diagnostic API is needed.

The supplied background.js already handles the runtime message
`extension-notification:clicked`, validates clickPath, invokes the SAME `ic`
helper as chrome.notifications.onClicked, and returns `{success:true}` or
`{success:false,error}`. Exercise that existing route, not a rewritten helper:

```js
await chrome.runtime.sendMessage({
  type: 'extension-notification:clicked',
  clickPath: EXISTING_DISPOSABLE_AGENT_ROUTE_HASH,
  windowId: KNOWN_DISPOSABLE_SOURCE_WINDOW_ID
});
```

Use a route copied from an actually open local Agent page (the hash without #),
not a guessed account/session identifier. Record the initiating extension's
browser-context/profile association and exact target window identity first.
Keep that extension document alive in a different disposable source-profile
window while closing or switching the target window; do not accidentally execute
the request from the target profile's replacement extension document.

1. Valid target: dispatch the real message with its existing source-profile
   window ID. Observe actual Agent tab reuse/navigation and focus in that window.
2. Closed target: close only the recorded fixture target, invoke the same route
   from the still-live original-profile Agent page. Observe one new normal window
   in that original profile; inspect the other profile's windows for invariance.
3. Transferred target: switch the recorded fixture target to another disposable
   profile. Dispatch from the original-profile page using the old real window ID.
   Observe a new original-profile window, not navigation/focus of the new profile
   or activation of a hidden workspace cache.
4. Close/switch during dispatch: start that same runtime request and promptly
   perform the permitted target-window action. Timing may select either the
   initial-stale or conditional-recovery branch; record actual results honestly.
   Do not claim deterministic asynchronous-race coverage from a single manual
   trial. The source fixture supplies bounded branch coverage.

Only close windows created by this exercise and clear only its disposable route
state afterward. A successful runtime reply alone is insufficient: verify the
actual window/profile and route. This establishes local click-handler routing;
it does NOT establish OS notification creation, delivery, sound, click callback
or push transport acceptance. Those remain separately labeled.
