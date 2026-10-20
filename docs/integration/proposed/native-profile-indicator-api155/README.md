# Actual255 profile indicator compiler adaptations

Observed `v255-focused-build.log` diagnostics require only two source files to change:

* Restore `RAW_PTR_EXCLUSION` with its explicit header on the newly public descriptor's icon pointer. This points exclusively to the immutable process-lifetime vector catalog, the same reason the previous internal descriptor was excluded; no owned pointer/lifetime policy changes.
* Add normal155 Views metadata declarations/definitions for the icon Button and grid View. The actual `AddChildView<T>` enforces this contract.
* Iterate155's real `children()` raw_ptr collection by reference rather than invalid `auto*` deduction.
* Use the constructor's actual `BrowserWindowInterface*` directly for its eligibility query; the separate weak-pointer callback paths still use `.get()`.

The seven exact anchors and complete baseline/output hashes are recorded in `manifest.json`; native255 baselines are copied without alteration. No glyph, palette, dimensions, eligibility, action, teardown, dialog or profile operation changes. Focused profile_attributes_entry compilation already passed in root's actual255 run; this patch does not touch it. Root owns application/rebuild and all other failing translation units.

`python3 docs/integration/proposed/native-profile-indicator-api155/verify.py` checks that the full output equals only those counted replacements and replays the two-file patch in a disposable directory. No native build or shared checkout write occurred in this lane; passing static checks do not claim compiled or UI/runtime acceptance.
