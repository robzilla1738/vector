# Native B4 browser action parity

The authenticated Chromium runtime host now covers the browser action calls in
`NativeMethods`: `listPages`, `tabCommand`, `movePage`, `focusPage`, `stopPage`,
`recoverPage`, `findInPage`, `stopFind`, `setZoom`, `acquireStage`, and
`releaseStage`. Selected page readable capture and password fill have their own
reviewed native paths. Observation and click/type/scroll use the page-scoped
CDP broker; `Input.*` dispatch requires a current native input stage.

`findInPage` uses Chromium's `FindTabHelper` final result and rejects a stale
page, document, or request. Stage acquisition succeeds only for a regular
Profile page with a showing, laid-out HTTP(S) renderer view. A hidden tab has
no safe native input stage yet, so interactive programs on it fail before
input dispatch. Chromium owns tab visibility; this bridge does not force-show
a hidden tab outside the tab strip's lifecycle.

The remaining `NativeMethods` without Chromium handlers are local project and
cloud development methods (`developmentProjects` through
`approveCloudCommand`). They are B10 host integration work, not browser action
methods. The native host must implement them before exposing the corresponding
runtime features in the Chromium build.
