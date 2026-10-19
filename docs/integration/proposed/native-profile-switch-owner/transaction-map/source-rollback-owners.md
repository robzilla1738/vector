# Real source rollback for three stable owners

This followup is pinned to the actual applied six source files containing the earlier extension-side-panel, toolbar-owned-actions and download-profile-owner adaptations. It addresses the core's real rollback order: restore the actual source TabStripModel collections first, then invoke provider abort, while Browser identity still names the source profile. There is no rollback after identity commits.

The previous target Rebind methods correctly required an empty model, but were unsuitable for that source rollback. This patch retains that target requirement and adds distinct source-only entrypoints:

* `ExtensionSidePanelManager::AbortForAuxProfileSwitch(Profile*)`
* `ToolbarView::AbortOwnedActionsForAuxProfileSwitch(Profile*)`
* `DownloadToolbarUIController::AbortForAuxProfileSwitch(Profile*)`

Prepare records the exact actual source Profile. Abort requires prepared state, non-null captured source identity, pointer equality of its argument and Browser's actual profile to that source, and every actual restored tab WebContents' BrowserContext equal to the source. It then uses a private shared rebuild body with all the original disposed-owner, registration, normal/profile, service and child guards preserved. Both successful paths consume the prepared generation by clearing the captured source pointer. Abort neither clears the model nor assumes an empty/restored fake collection. It cannot reconstruct target services on a source rollback.

## Required abort order

After core restores the genuine source collections, provider abort must restore the real source BrowserActions/pinned model before rebuilding toolbar-owned subtrees. Restore the toolbar/pinned containers before Download rebuild, whose actual icon/action registration uses them. Recreate extension side-panel entries only after its actual source action/pinning dependencies are available. The extension manager's existing stable registry and tab-scoped managers are retained; source entries register lazily and are not automatically opened.

The source rebuild invokes exactly the existing actual constructors: ExtensionsToolbarDesktop and PinnedToolbarActionsContainer with the same Browser, real source PrefMember initialization and current prefs; DownloadBubbleUIController and DownloadDisplayController querying source services; ExtensionSidePanelCoordinator against the genuine source ExtensionRegistry. The actual restored tabs are available to constructors that inspect the current model. It does not emit synthetic activation, hide data, return fabricated empty service state, close an active user flow, or bypass the initial cold boundaries.

## Evidence and checks

* Existing core contract supplied by transaction owner: failed pre-identity detach restores source collections before abort; committed identity is a nonrecoverable CHECK path. No target profile settings should be constructed before that point.
* `toolbar_view.cc`: child construction reads actual Browser profile/models; outer toolbar and permanent LocationBar, Omnibox and controls are preserved.
* `extension_side_panel_manager.cc`: profile remains source throughout Prepare; registration uses actual enabled ExtensionRegistry and constructs real coordinators. Deregistration was already explicit rather than relying on the default destructor.
* `download_display_controller.cc`: actual constructor binds bubble controller, reads current display state, and registers PowerMonitor; destructor removes that observation. `download_toolbar_ui_controller.cc` retains its existing callback guards and paired private-controller recreation, action and profile-collection binding.
* All six exact baseline/output hashes are pinned in the manifest. Patch replay in a temporary source tree and byte equality for every output passed; shared inputs were rechecked unchanged. No native build/runtime, owner profiles, credentials or OS grants were accessed. Compiled and functional full-transaction acceptance remain pending.
