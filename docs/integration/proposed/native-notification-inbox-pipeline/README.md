# Supplied notification inbox delivery port

Source-only proposal against actual native412/413 (the provider change has no overlapping files). Parent owns GN and application. **Not applied, compiled, permission-tested, Keychain-tested or notification-tested.** No notification, OS grant, helper or Keychain operation occurred. The supplied Agent listener remains unchanged.

This is the coherent save→reply→Agent dispatch path, including the source mode consumer. It depends on root's real default-denied `LoadAgentInboxMasterKey(home)` provider; this proposal supplies no substitute key or successful fake provider. Root's separately reviewed inbox family is distinct from installation signing authority. Key source/query proof is in `../native-notification-inbox-key-source/` (2b889f005).

## Corrected source ownership

The preceding bounded finding07342183b mislabeled40f9eb8 as persistent. Full constructor/vtable and explicit call operands resolve it: e1aaed0+16 points to40f9eb8 **DisplayNotification**, which passes false at40f9fc0/40fa024; e1aaed0+24 points to77daf18 **DisplayPersistentNotification**, which passes true at77db040/77db0a4. Both save, dispatch and then inspect the same original mode reader40fa608. The older filename is historical; the new ledger pins both complete actual paths.

Both Chromium155 display owners retain their genuine shutdown/profile guards and real notification/metadata construction. Immediately after construction, the original payload is queued for encrypted saving. Mode1 suppresses the subsequent native display/metrics path; other modes continue the existing real Chromium155 display path, including its current Safe Browsing machinery. A missing key or failed database save does **not** manufacture a row or turn mode1 into native permission: the original reply dispatches `inbox_save_failed:true` to the Agent. There is no model-proxy delivery, alternate service or fake delivery acknowledgement.

## Exact save and dispatch lifecycle

- Original ctor32f48ac sets save byte+a8=true; there is no newly invented feature/account switch.
- Build notification_id, canonical site_url, title, body, is_persistent, valid context_url, always-base64 structured-clone bytes, optional genuine JSON companion.
- UI posts an immutable payload/image/path/persistent copy to a MayBlock, USER_VISIBLE worker; reply holds only the profile-owned inbox's weak pointer. Shutdown invalidates replies before profile use. This adapts the original source weak service reply, not a second keyed service.
- Worker encodes the supplied image as PNG/base64 when possible and includes it in the encrypted payload and eventual Agent message.
- Open actual `Profile::GetPath()/AuxInbox` SQLite **file**. Source originally appends AsideInbox; the product-state filename is Aux-isolated. `PermissionAuditingLogs` is the original histogram tag, already registered in155, not a directory or new tag.
- Original inbox_entries schema and insert are preserved. JSON is sealed with the real provider's32-byte key, AES-256-GCM, fresh algorithm nonce, empty AAD. Envelope remains `ASIDEAI1` +nonce+ciphertext. No plaintext-payload SQL fallback.
- Failed save gets exactly one retry with a fresh DB object at the **same path**, as40f8478. Reply sets actual decimal inbox_entry_id only on success; otherwise inbox_save_failed=true. No successful zero/empty placeholder.
- The original BrowserGeneratedExtensionMessagePort is a plain native sendMessage opener with no response handler/timer. It checks enabled actual Agent identity, opens actual NativeApp(`aside.inboxNotification`)→Aux Agent, posts the real serialized message and immediately closes its native port. There is no Tidy15-second completion logic. Original dispatch77dbfe8/e1aafa8 source is distinct from the unrelated Tidy port.

## Genuine click JSON producer

Original Blink CreateNotificationData452a8f4 first performs the original structured clone and returns its original exceptions. Only then it enters a local V8 TryCatch and calls actual JSON::Stringify452afe8. A successful UTF8 result is accepted up to1MiB, except literal `undefined`; JSON failure does not invalidate a successful structured clone. The nullable field is carried through Mojo and copied into PlatformNotificationData. Native inbox payload40fa214 emits it as `click_payload_json` only when present; it never tries to parse structured-clone bytes as JSON.

The added internal155 field is named data_json and appended to Mojo to preserve all existing ordinals. Native deserialization enforces the same1MiB bound. Current immediate persistent delivery retains the original NotificationDatabaseData value through the write/display callback, so this companion reaches that path. No unproven protobuf storage field or guessed restore schema is added; scheduled/reloaded JSON persistence is not asserted. Original structured-clone persistence remains unchanged.

## Integration

Register aux_notification_inbox.{h,cc} in `chrome/browser/notifications:impl` under actual enable_aux_browser condition. The containing public notifications target needs `//chrome/browser:buildflags` because its service header now uses that flag. Impl requires `//chrome/browser/aux:platform`, `//crypto`, `//sql`, actual extension messaging (`//extensions/browser`, `//extensions/common`), `//ui/gfx/codec`; existing profile/prefs/base/Skia dependencies remain genuine. Root owns exact GN arrangement and checks for cycles. No new SQL tag is needed. Blink files remain in their existing targets; Mojo regeneration is required. Focus objects: notification_data Blink renderer, notification_mojom_traits, platform_notification_data, aux_notification_inbox, platform_notification_service_impl.

The permission change diff/sync observer40f8df0 is a separate remaining original component. This patch implements actual inbox delivery, not that permission-snapshot observer. No functional notification acceptance is claimed from source replay or eventual compilation; runtime key-family authority is separately unavailable by default, and no new authority is inherited.

`verify.py --native-root <actual source>` verifies pinned original bytes, source/literal identities and a disposable-only replay of all10 output files. It executes no modified target.
