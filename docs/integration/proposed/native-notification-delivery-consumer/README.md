# Bounded supplied notification-delivery consumer finding

Related followup to `native-notification-permission-contract`, against read-only native v411. This is a source finding, **not an applied implementation or a patch**. No native, build, profile, daemon, permission, notification or OS operation was performed. Root can link the verified producer/pref change without adding incomplete delivery suppression.

## Positive consumer and effect chain

The supplied native owner is `chrome/browser/notifications/platform_notification_service_impl.cc`, positively named by the embedded source path at `0xda8f021`. Original diagnostic function string `SaveAsideInboxPayloadAndDispatch` at `0xda8f0e2` identifies the additional delivery pipeline; it is absent from the current155 owner.

The original persistent-notification entrypoint `0x40f9eb8` preserves shutdown/profile guards, constructs the real notification and persistent metadata, then:

1. Calls payload builder `0x40fa214` at `0x40f9fc4`.
2. Calls `SaveAsideInboxPayloadAndDispatch` (`0x40f88d0`) at `0x40fa028` **before** testing delivery mode. Its source-owned byte at service offset`+0xa8` selects between an asynchronous save/callback path and a direct Agent-message path. The byte's actual initialization/producer and full callback semantics remain unrecovered in this bounded pass; it is not assigned an invented name or constant.
3. Calls the canonical-origin dictionary reader `0x40fa608` at `0x40fa05c`. It reads `persistent_notifications.ai_delivery_mode_by_origin` and tests a present integer1.
4. If AI-only mode is present, branches at `0x40fa060` directly to cleanup at `0x40fa10c`; native desktop `Display` is skipped. Otherwise it proceeds to the genuine notification display service at `0x40fa09c`, then the original permission/engagement/notification metrics. This is a routing decision, not a delivery-success result.

The original native string formatter `0x40f9dcc..0x40f9e80` distinguishes the actual preference state as `allow_for_ai` versus `allow`, independently corroborating the dictionary mode meaning.

## Actual message and existing consumer

The original payload builder emits these literal keys (all address-pinned):

- `notification_id`, `site_url` (canonical origin), `title`, `body`, `is_persistent`;
- `context_url` only for a valid context URL;
- `click_payload_base64` from developer data and optional `click_payload_json` from an additional source field.

The direct path at `0x40f8b7c..0x40f8bf4` sets `type` to the actual original lowercase wire literal `aside.inboxNotification`, then calls dispatcher `0x40fa6cc`. That dispatcher requires the actual enabled Agent extension from the current profile registry and an actual MessageService, serializes JSON, and opens/posts/closes the real browser-generated extension channel. This is **not** a custom CDP domain, model call, independent Aux inbox, or OS default-browser action.

The unchanged supplied Agent `background.js` has a matching `runtime.onMessageExternal` listener. It resolves its real native account and calls the supplied daemon `inbox.ingest`, using `source: "web-push-notification"`, title/body, origin/context URL, notification ID and optional inbox-entry ID; notification+entry IDs form its dedup key. It also separately consumes `aside.notificationPermissionChanged`. The current staged consumer hash is pinned; its original lowercase wire fields remain intact.

## Current155 corresponding owner and exact gap

`PlatformNotificationServiceImpl::DisplayPersistentNotification` is the correct current155 native owner. It has the actual profile/shutdown guard, real notification construction, safe-browsing content checks, native display, and notification/engagement metrics. It has **no** AI-delivery dictionary reader, original payload save/dispatch pipeline or matching Agent inbox delivery. `PersistentNotificationHandler` is the subsequent click/close-event owner; changing it alone would not intercept delivery.

Adding only `if (mode == 1) return;` would suppress desktop notifications while leaving the supplied inbox path unproduced. This pass deliberately makes no such source change. A faithful followup must port the complete original save/dispatch/callback/fallback owner before activating that suppression, including:

- actual service `+0xa8` producer, save operation, returned entry-ID incorporation and source callback lifetime/shutdown behavior;
- real profile-scoped Agent message endpoint and original channel lifecycle (not a fabricated acknowledgement or unrelated15-second Tidy callback);
- payload developer-data serialization and the original optional JSON producer. Current155 `blink::PlatformNotificationData` exposes serialized `data` but no corresponding optional JSON field, so that additional producer must be traced/adapted rather than silently omitted;
- original preference/permission-change observer invalidation and `aside.notificationPermissionChanged` event path if carried by the same native owner;
- insertion order relative to existing current155 safe-browsing and native metrics, preserving genuine policy and existing display when the original mode does not suppress it.

This is a concrete remaining native/runtime behavior gap, independent of the known normal-account authentication availability boundary. Source/compile checks on the permission API cannot establish inbox routing, delivery, OS authorization, Vault/CLI behavior or20-task Muse acceptance.

## Evidence and lean verification

`source-evidence.json` pins the supplied native thin-binary hash, five bounded LLVM ranges, exact source/payload/wire strings and current155/supplied-Agent reference hashes. `verify.py` independently verifies those pins and the original call/conditional-branch chain. It does not execute target code or create mutable profile state.

```sh
python3 docs/integration/proposed/native-notification-delivery-consumer/verify.py
```

No source apply, GN registration or native compile is required for this finding. The original producer/pref implementation remains the separately reviewed three-file proposal.
