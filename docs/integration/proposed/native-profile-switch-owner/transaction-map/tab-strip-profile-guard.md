# Tab-strip service profile provenance

The real window-scoped adapters do not cache a Profile: TabStripModelInjector retains adapters for the stable TabStripModel, the same BrowserWindowInterface, and physical SessionID. BrowserAdapterImpl resolves `browser_->GetProfile()` at each actual profile-wide lookup and AddTab uses the same actual Browser. TabStripModelAdapterImpl retains model/window ID; its color lookup uses the actual current model delegate. BrowserEventBridge subscribes to the stable BrowserWindowThemeObserver; the existing theme rebind preserves that observer. UI injector's TabContextMenuAdapterImpl retains only Browser/model and resolves the real TabMenuModelDelegate for each newly opened menu.

Therefore rebuilding the services/injectors is unnecessary and would break real native observers/receivers. Leaving all bound clients unchanged is also unsafe: TabSearchPageHandler captures its WebUI Profile and creates BrowserTabStripServiceTracker for that Profile. Tracker registers service pointers in TabStripServiceAggregator, which retains its observation until a real BrowserClosed callback. The intentional BrowserManager ownership transfer does not emit fabricated BrowserClosed/Created events. Existing old-profile native aggregation and Mojo streams must not silently become target-profile streams.

## Bounded cold migration query

This six-file proposal adds introspection only. It never disconnects, removes, rebinds, or suppresses a client and never returns fabricated snapshots/events:

* `TabStripServiceFeature::HasExternalBindingsOrActiveInvocation()` delegates to its actually constructed TabStripServiceImpl. The private owning pointer is made concrete, preserving the public base interface getter and every existing receiver/observer.
* The service checks both real ReceiverSets, associated TabsObserver streams, its actual observer list excluding its own forwarding observer, and the actual SessionController invocation flag. This detects native profile-scoped aggregators as well as Mojo clients. SessionController's existing in-progress interval covers recording, invocation, and recorded-event replay.
* `TabStripUIControllerImpl::HasClientsOrActiveCommand()` checks its actual receivers and a scoped depth through ShowTabContextMenu, including the genuine menu runner/delegate callback stack. Existing cold menu guards still apply; no menu is canceled.

Provider must refuse these real attached states before any cache/security/source effects. It must recheck at Begin and immediately before irreversible identity transfer if nested calls can create a binding during cache construction/detach. If that phase can pump tasks or run callbacks, the transaction needs an explicit recoverable revalidation point before commit; a late CHECK is not a substitute for refusing safely. This proposal does not claim an exclusive binding lock or implement active aggregation migration. No trigger is enabled by it.

With this cold boundary, actual stable services can remain alive through actual model detach/insertion and retain their real events. The final renderer/model state is derived by stock code. No empty model success, custom Mojo facade, whole Features initialization, or synthetic Browser lifecycle is introduced.

Modified source baselines/output SHAs are pinned. Isolated six-file patch replay and shared-input byte checks passed. Compilation and actual full profile-switch behavior remain unverified. No shared source writes/build, profile access, network, or OS authority occurred.
