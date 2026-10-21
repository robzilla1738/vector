# Identify actual Ask command validation owner

The v566 external-page View menu shows Ask Aux disabled although its toolbar callback works. BrowserNativeWidgetMac's native validation has no command-specific rejection: it delegates directly to BrowserCommandController SupportsCommand/IsCommandEnabled. Legacy InitCommandState registers Ask true. AppController fallback intentionally lacks current-window Ask support. A separate concrete latent omission exists in CommandActionUpdater's declarative action map, but both feature selectors default disabled and the current launch supplies no enabling flag; that omission is not yet evidence of the observed failure.

This two-file diagnostic logs once per process at each actual Cocoa validation route, only for IDC_AUX_ASK. Payload is static route text and boolean browser-presence/support/enabled/action-owner values. No profile identity, paths, content, tokens or pointer values. No command enablement, dispatch, feature state or UI behavior changes.

Read the `Aux Ask validation` lines after one menu opening in the approved disposable launch. `route=app` alone identifies responder fallback; `route=window` identifies browser dispatch and records whether its command table supports the command. `actions=1` positively establishes the declarative map omission; `actions=0` with unsupported Ask requires checking actual compiled registration rather than enabling it blindly.

Pinned current v566 file hashes. Isolated apply/output-hash verification and whitespace checks only. Root owns native compile and runtime observation. No shared native modifications or launch by this lane.
