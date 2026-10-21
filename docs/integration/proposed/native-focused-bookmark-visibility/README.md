# Keep the genuine bookmark action during omnibox focus

Minimal one-file Aux Mac integration against actual557. Root's controlled supplied-browser focused-address screenshot positively shows the bookmark control. This is an observed-reference Chromium155 adaptation; it does not claim recovered original153 C++ ownership.

The concrete155 cause is PageActionModel::GetVisible: `hidden_by_omnibox = is_suppressed_by_omnibox_ && !is_exempt_from_omnibox_suppression_`. Actual BookmarkThisTab properties declare non-ephemeral but retain the default false exemption. LocationBarView already restores the genuine bookmark decoration at focus, yet this independent model guard still suppresses it.

Use the existing PageActionControllerImpl::Register initialization path to set its existing exemption for **only** kActionBookmarkThisTab, gated ENABLE_AUX_BROWSER && IS_MAC. The genuine action item and PageAction model remain the owner. GetVisible still requires actual tab active, enabled action, visible action item, requested visibility and no pinned duplicate. No duplicate button, forced SetVisible, fabricated bookmark state, disabled popup, changed action dispatch or broadened permission is introduced. Other actions/platforms retain their original properties.

The existing LocationBarView resting-presentation suppression remains intact, and genuine model registration is naturally per-tab. There is no new observer or lifetime. Actual bookmark activation, focused screenshot parity and focused→resting transition remain the integrator's packaged checks.

`python3 verify.py` validates two counted anchors, exact baseline/output hashes and disposable patch replay. Relevant current155 eligibility/default source files are pinned under evidence with source-evidence.json. No shared/native edits, build, runtime, owner profile access, signing or Keychain operations occurred.
