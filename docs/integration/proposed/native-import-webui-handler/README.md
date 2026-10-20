# Supplied importer WebUI native messages

This five-file counted proposal replaces the retired `auxImport` promise/category handler with the three actual supplied `app.js` messages and genuine native import owners. It leaves supplied HTML/JS/CSS/resources unchanged. Root owns GN, the standalone creator, prerequisite owner composition and compilation. The proposal remains unmounted until the real Safari coordinator and every listed prerequisite are present.

The source image, exact `app.js`, native wrapper/selection/event ranges, literal bytes and concrete dependency headers are pinned in `source-evidence.json`. The actual native bridge emits `cr.webUIListenerCallback`, matching the original listener map in supplied app.js; the port uses genuine `FireWebUIListener` rather than inventing an RPC protocol.

| Supplied native source | Preserved contract |
| --- | --- |
| Constructor424e0c0, wrappers424e820/424edc8/424eea4 | Exactly showProfilePicker, selectSafariExportZipFile and importFirefoxData. The latter two require zero arguments. |
| 424e820..424e99c | Chromium source IDs actually accepted: arc, brave, atlas, chrome, comet, dia, helium. The shipped wrapper does not admit Edge despite the JS definition; Edge also is not in the installed registry. No new source admission is added. |
| 424e99c..424ea4c,424ecc8..424ed14 | showProfilePicker requires exactly five arguments: source string and four int/double numbers. Convert numeric CSS rectangle to the original integer gfx::Rect, clamping negative dimensions. No path/profile data comes from JavaScript. |
| 424ed78,424ee70,424ef34 | Real target chooser precedes source discovery/profile picker, Safari file selection or Firefox Start. New0/current1/cancel-none choice is captured with weak native ownership. Cancel starts nothing. |
| 424f554..424f7d4 | After actual Chromium target choice, post selected-browser profile discovery; capture mode, original button rectangle and source in native source-profile picker callback. Keep the entire actual selected metadata row native. |
| 80cc4d8..80cc6d8 | Emit started(sourceID, sourceProfilePath), then pass captured0/1 mode and selected row to real migration. Mode0 uses ChromiumNewTargetImport; mode1 uses the existing staged current-profile snapshot/destination owner. |
| Firefox42526c0/4252790 | Emit started('firefox') with one argument, then invoke real Firefox target-mode owner using the captured current Profile; do not fabricate/select a source profile. |
| Safari42518c0 | Emit started('safari') with one argument on the actual first running Update, after initialized destination/setup immediately before PrepareImport. Do not emit it at file selection/Start. Never return archive bytes/path to the page; the genuine coordinator consumes the selected native path through StartFilePath. |
| 4250f44..4250fac | Invalid archive event is safari-import-invalid-file with the exact text `This is not a valid Safari data ZIP file.` Native file cancellation emits neither invalid nor failed. |
| Original terminal callbacks/4251f2c | Terminal listeners receive only the source ID. Success requires actual owner completion; page events do not infer profile creation/store completion. |

The strictly captured standalone app-popup owner is required before native UX operations. `IsStandaloneImportOwner` comes from the source-proven creator/lifecycle lane, not a URL-only check. No ordinary browser-tab close, CloseNow call or empty lifecycle fallback is introduced. Controls/retirement/open callbacks capture the initiating native context; real target load/bootstrap is `OpenImportedProfile`, only after explicit Open Profile acceptance. For Chromium, a successful terminal callback posts retirement followed by the original current/new completion choice. Failure re-enables its actual controls. Firefox and Safari own their corresponding lifecycle; Safari has no inferred Firefox control-toggle behavior.

The Handler owns its genuine new-target, Firefox, Safari and native file-picker objects. The current-profile service adds a native-only once completion callback, consumed only by its actual succeeded/failed Emit boundary. It returns immediately afterward so it does not dereference a potentially retired owner. Handler destruction invalidates weak callbacks and cancels its native job, dropping completion without a synthesized failed event. There is no polling, timer, extension event masquerade or successful no-op. Public extension admission, JSON serialization, events and existing category path remain unchanged.

`StartChromiumWebUIImport` reuses the actual existing current-profile full snapshot/destination sequence: bookmarks/history/passwords/cookies plus actual extension import. It does not select the retired `native-import-webui` alias, which bypasses original bookmark/extension behavior. The native source discovery export wraps the existing SourceHome/kFamilies/DiscoverChromiumProfiles for only the chosen Chromium browser, preserving actual row order, path/name/subtitle and fixture boundary. It does not discover/read unrelated browser profiles.

The full-current autofill question remains distinct from this wiring. Original mode1 is the live worker4253e58, dispatched by42534e8 with the current target path; mode0 uses4255868 and generic recursive copy425d438. The descriptor's advertised autofill category is not positive proof of a mode1 reader/destination. The existing source-pinned ledger `native-import-autofill-owner` proves generic Web Data copy only for mode0 and explicitly leaves mode1 unproven. This proposal adds neither a guessed autofill parser nor a new failure/category policy based on that declaration. Root should investigate any positive mode1 producer/destination before calling it an implementation gap or expanding behavior. This proposal does not claim complete mode1 parity.

Safari prerequisite API agreed with its actual owner lane:

```cpp
SafariWebUIImport(Profile* captured_current, SafariImport::Update);
Start(TargetMode, const base::FilePath&, WebUILifecycle);
// TargetMode new0/current1; lifecycle contains retire_owner/open_profile only.
```

Mode0 must reserve/create/initialize the real target before selected-path import. Mode1 must retain captured current Profile. There is no unresolved empty implementation or new-to-current fallback in this proposal; mounting requires the concrete L2 owner and StartFilePath adaptation. Source Safari order/owner for that port is42522c0 chooser reply→4252324 file picker→4250a14 reserve/create/prepare, initialized callback4251694. Its actual4way Safari importer barrier is preserved by its owner.

`verification.json` records all counted anchors, exact outputs and disposable apply-check/replay. No shared native/GN write, build, runtime import, source-profile/credential read, Keychain or OS operation ran. Actual compilation, original event timing, callback retirement, complete current/new-profile import and observed UI/behavior acceptance remain pending root's coherent integration.

Final event correction: this is a whole replacement against the same five captured native baselines, superseding the initial proposal contents. Original Chromium completion `424fb60` returns on true and emits only failure on false. Only Safari emits `browser-import-succeeded` (`4251f2c`); Firefox has no success listener xref. Safari precommit total failure `4250e40` tail-returns after a real native warning, or emits the invalid-file event only when the captured native window is absent. The Handler binds the real captured warning and presence callbacks at initiation; warning completion clears its own busy state without inventing an event. Fallback invalid-file delivery uses the existing weak Handler lifetime and does not require the absent native window to reappear.
