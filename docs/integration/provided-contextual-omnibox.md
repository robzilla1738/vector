# Owned contextual omnibox port checkpoint

The supplied UI and event consumers remain unchanged. This is a staged Chromium155 platform adaptation, not a replacement image-search interface. The new source files under proposed/contextual-omnibox have not been applied, compiled or loaded. They are a backend checkpoint; the existing Aux extension API is not yet wired to this handler. Do not advertise working Lens from this commit.

## Original behavior, anchored rather than inferred from neighboring functions

`audit-native-contextual-session.py` checks the exact original arm64 framework slice hash, actual extension registration name→factory→vtable→Run relationships and native Lens call instruction. Reproduce with the static framework path as its only argument. It never loads or executes that artifact. Recorded output is provided-contextual-registration.json.

Original openLensSearch is Run0x4288500, resolved through registration0xead8220/factory0x46aef8c/vtable0xe26fee8. Session handler+0x88→delegate+0x68→edit model+0x28 dispatches native function0x7bb6630. This is the owned omnibox edit-model route. Run0x42869e0 is notifySessionAbandoned, not Lens. The original addFileContext Run0x4286c40 parses fileName/mimeType/bytesBase64/imageDataUrl/isDeletable/selectionTimeMs and supplies SelectedFileInfo + real BigBuffer to its native handler. Original onFileContextAdded/status converters are supplied decompiled0428cbec.c/0428c6cc.c. Local byte storage and a manufactured image-search URL do not reproduce that route.

## Concrete adapter authored

OwnedContextualSession constructs the current upstream ContextualSearchboxHandler using the same service/config/source/invocation flow as NewTabPageUI and client callback pattern as RealboxHandler. It owns an OmniboxController/edit model even under Chromium155's model-less experiment, without flipping a global feature or touching the visible URL bar. The client binds autocomplete/Lens to the actual owner WebContents; a profile-only provider would silently lose the native Lens controller.

The handler's real PageHandler pipe exposes native autocomplete snapshots, selection/action/navigation modifiers, file/tab upload, status/error events, context deletion, clearing, modes, submission and session metrics. These are existing upstream implementations, not success stubs. A paired typed Page event receiver must be supplied by the extension adapter. Lens dispatch checks actual provider/tab/profile eligibility and contextual provider availability before calling the real edit model; success is dispatch acknowledgement, never a claim of overlay display or server completion.

A lazy actual per-profile ContextualSearchSessionHandle supplies contextual inputs and upload observers. SearchContentSharingSettings is checked on each acquisition. Invalid profile/document identity, committed main-frame navigation, owner destruction and command/event pipe disconnection close the handler before releasing its context handle. Releasing the last native handle removes the service session and cancels its native controller's work. No independent upload client, search endpoint, URL construction or substitute Lens feature is introduced.

The staged BUILD.gn contains a new target to append to the existing file. It does not replace existing targets or register the backend with the extension API. Parent owns source composition/GN/build scheduling. Current upstream source hashes and bounded anchors are pinned in provided-contextual-upstream.json.

## Remaining before enablement

The supplied extension event adapter still needs to bind both pipes, translate original free-form JSON to current typed inputs, forward actual Page result/status/state events, and retain current extension/profile/frame ownership checks across asynchronous replies. Original tool/model string and action-state conversions require exact observed mappings. Unsupported newer Page fields must be accounted for rather than emitted as invented original events. Native focused compile and disposable loaded-stack image/context/action/cancel/navigation acceptance are outstanding. No network, owner profile/image/history, OS prompt, Lens request or browser action was performed by this checkpoint.
