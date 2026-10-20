# Non-Vault profile navigation and Agent extension lifecycle

Follow-up to native-local-browser, based on v500. `auxAccount.getProfiles` already uses native profile attributes and does not call Vault; current native Chats transport similarly does not depend on Vault. Legacy `aux_native_task_feed` is not the mounted supplied sidebar owner.

Remove Vault unlock from `openProfileRoute`. Preserve trusted extension admission, exact registered native profile path/ID, allowed HTTP(S)/Agent destinations, loaded-profile requirement and incognito cross-profile rejection. Reject routes to the removed Vault extension. Agent pages retain their real account resolution and daemon authorization. The shared Vault security primitive and private passkey operations are unchanged.

Mini-popup no longer requests then discards Vault status before opening. Its supplied page continues resolving its real account.

The NTP service now observes Agent load/unload, maintains the actual extension-availability metadata preference formerly owned by ProfileGate, and invalidates/reschedules preloading. Existing browser Show/ShowInactive and activation events schedule preloading; no preference is falsely marked as onboarding/unlocked.

Verification: reviewed exact supported API control flow and patch hashes. Integrator owns combined compilation and disposable runtime observation.
