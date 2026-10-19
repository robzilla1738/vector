# Action, restore-context and dialog public header dependencies

Expose the generated Aux browser build flags through the existing public targets
for BrowserActions, its internal preference listener, the tab-menu delegate, live
restore context, tab-group deletion and data-sharing controllers. Existing target
and source ownership remain unchanged. Remove an unused ActionId header from the
BrowserActions proposal; ActionId is used only in its implementation.

The patch pins actual applied v89 inputs and is included in v90. GN generation and
compilation are recorded separately; no runtime readiness is implied.
