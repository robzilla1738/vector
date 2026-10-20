# Notification permission implementation dependencies

The supplied contract now calls the real existing `NotificationPermissionContext::UpdatePermission` and `PrefService` dictionary API. Add their actual155 `//chrome/browser/notifications` and `//components/prefs` targets to the existing private API target. No new service, permission operation or replacement backend is introduced. One count-pinned GN file, layered after the original notification contract proposal. Root verifies GN generation and the changed API/pref objects.
