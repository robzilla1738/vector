# Original cached-workspace session eligibility recovered

The earlier statement that a real cached Browser would automatically participate in155's rebuild was incomplete. Current155 ShouldTrackBrowser excludes all omit_from_session_restore windows. The supplied implementation has an explicit narrower exception for its positively marked cached workspace; the source-pinned one-file patch ports that original condition rather than inventing a new omit override.

## Complete call and predicate proof

Original delayed callback0455d6bc reaches SessionService::ScheduleResetCommands021836b8, which invokes BuildCommandsFromBrowsers callback023bf6c0. That callback calls023bf730, then independently requires real tabs and a real BrowserWindow before building the browser's session commands at023bf8dc.

Original023bf730 begins by comparing candidate BWI.profile(+0x40) with the service's profile(+0x30), returningfalse if different. It obtains BrowserInitState from userdata key0xead4ad0. At023bf7f4 it reads InitState+0xf0. If unset, normal checks continue. If set,023bf7fc reads candidate BWI+0xc8 and023bf800 returnsfalse only if that byte is unset. BWI is the Browser+0x28 subobject, so BWI+0xc8 equals the proven creation-time cached-role Browser+0xf0. This is NOT the independent owner/workspace ID atBrowser+0xf8 and NOT SessionID atBrowser+0x110.

The field identification is direct, not a naming guess: original BrowserInitState constructor02e85080 first moves CreateParams into the object, copies the omit/trigger pair from+0x44 to+0xf0 at02e8509c/a0, and registers the same userdata key0xead4ad0 at02e85158..168. Cache creation455cfec sets omit=true while separately setting the cached-role=true; ordinary omitted windows remain excluded.

After this condition, the original predicate continues ordinary app/app-popup trusted-source/type eligibility. The155 patch preserves profile equality FIRST and all ordinary trusted/type/platform checks AFTER. Only Mac+Aux builds obtain the original cache-role exception. Other builds retain existing omission behavior.

## Concrete integration

Apply session-cache-policy.patch using session-cache-policy-manifest.json. The source baseline is actual appliedv32 session_service_base.cc; the patch requires the real BrowserInitState::is_aux_profile_switch_cache accessor from the separately pinned creation-time role proposal d3d42bb34. Root owns any buildflags dependency declaration; no GN/shared file changed here.

This permits the original500ms touched-profile reset to rebuild the real source cached workspace's actual registered tabs instead of erasing the source profile's only workspace. It does not force a window visible, bypass locked-profile/cache creation guards, serialize an arbitrary detached map, change session IDs, or treat an ordinary omitted window as eligible. The owner must still complete the real tab/collection/session/controller migration before scheduling reset.

## Related identity-map correction

Original Browser constructor031cd788..7bc allocates0x168, moves CreateParams and calls02e85080 with the actual userdata host, then stores the result at Browser+0x198. That object is BrowserInitState, not BrowserWindowFeatures as previously inferred. Therefore original SwitchProfileInPlaceForAside writing object+8 updates CreateParams.profile. The155 owner needs a narrow internal BrowserInitState profile-update seam, while keeping other supplied creation metadata and the independent workspace owner identity. Parent owns this overlapping identity/role source; no speculative field write is included in this one-file policy patch.

## Evidence and limits

original-session-track-cache.txt, original-init-state-constructor.txt and original-browser-init-state-owner.txt retain bounded static arm64 instructions; existing session-reset proof anchors the caller chain. Original artifact hash and current source hash are pinned in source-evidence.json. One-source disposable patch replay matches the final output hash. No native build/execution, shared write, profile, Keychain, OS grant or network access. Actual persistence/runtime acceptance remains pending.
