# Genuine notification permission snapshot and dispatch

Three-file incremental proposal atop `b886d3e02` pipeline outputs. Source-only, unapplied/uncompiled. No permission/notification/helper/Keychain or other OS operation. Root owns actual composition/GN/build. Do not alter the immutable parent patch.

This closes the separate observer component40f8df0 identified in the delivery proposal. It uses the **same actual profile-owned NotificationInbox** and the PlatformNotificationServiceImpl's already-existing real HostContentSettingsMap observation. It adds no duplicate keyed service, profile/account facade, independent permission state or successful fake callback.

Original constructor32f48ac..4cd0 registers the actual delivery-pref callback and silently seeds a snapshot. It collects origins from current NOTIFICATIONS primary patterns plus keys of persistent_notifications.ai_delivery_mode_by_origin. Full wildcard/invalid patterns are excluded; concrete patterns are converted to GURL, admitted only for valid HTTP(S), then canonicalized by actual url::Origin::Serialize (no trailing slash). Pref keys follow the same admission. This is not URL-based tab or profile ownership.

Effective permission is read from the actual HostContentSettingsMap for canonical origin as both primary/secondary: BLOCK→deny; ALLOW plus dictionary integer1→allow_for_ai; ordinary ALLOW→allow; everything else→default. Construction stores only non-default states and dispatches **no historical replay**.

- Pref callback40f881c recollects that actual origin union and diffs with source literal `api`.
- Native content-setting callback22ef2bc admits NOTIFICATIONS or all-types (current155 ContentSettingsTypeSet::Contains preserves both). Helper40f99c0 first admits primary and secondary pattern origins; if neither produces a concrete HTTP(S) origin it recollects the actual union. It diffs with literal `native_ui`.
-40f8df0 compares each effective state against snapshot default. Unchanged states do nothing. Changed default removes snapshot entry; other states replace it **before** pref updates, matching original reentrancy order.
- Changed deny/default clears the canonical origin URL's mode-pref entry only if effective native permission is not ALLOW. SetDict happens only after real removal; no fabricated permission operation/prompt.
- Dispatches actual `aside.notificationPermissionChanged` with origin, permission, source, timestamp (Unix milliseconds) through the existing real native Agent port. No encrypted inbox row is created for permission events, no fake acknowledgement, unchanged supplied listener remains the receiver.
- Original shutdown40f8878 removes pref observation before clearing profile. Followup does the same; weak replies/callbacks and matching snapshot state prevent use after shutdown/reentrant callback retirement.

Original +58 is a nullable auxiliary payload callback invoked only when nonempty; no original production producer for that hook is established. No fake or mandatory callback is introduced. The actual required external Agent dispatch40fa6cc is present. Original content-settings cleanup/deletion behavior remains after the new diff call.

No new source target is added. New includes require actual content_settings_factory and content_settings/core/browser + existing prefs; these already belong to notifications:impl. Header includes PrefChangeRegistrar from existing components/prefs public dependency. Root can rebase the narrow followup if its pipeline compiler adaptation alters surrounding source; all baselines here are immutable parent output hashes.

`verify.py` verifies bounded original bytes/literals/current155 API pins and independently replays only inside a temporary tree populated from the parent proposal. Static replay is not native compilation or permission/runtime acceptance.
