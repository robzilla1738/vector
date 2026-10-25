# Ordinary profile windows — A19

The existing sidebar dispatch routes the fixed compiled ordinary mode through Chromium's real profiles::SwitchToProfile(path, false). Existing profile menu, profile dots and fresh-profile creation share this dispatcher. The target profile's most recent eligible native window is activated, or Chromium opens/restores its native window. The source window and its tabs, unsent drafts, selections and profile-owned services remain intact. This deliberately provides standard isolated browser windows rather than in-place profile retargeting. No UI/style bytes or runtime permissions change.

The branch includes the existing fixed ordinary_startup_build.h and retains source WeakPtr/epoch/cookie restore/regular-profile/window/unload/shutdown checks through IsCurrentProfileMenuSource, plus normal-type/internal-cache checks. Supervised Dispatch and non-product behavior remain unchanged. Pending private-service guards are not removed or bypassed inside the advanced transaction; ordinary mode does not enter that transaction. No success callback is fabricated from a loaded profile.

## Known boundary

Chromium's FindTabbedBrowser does not explicitly exclude Aux internal switch caches. This mode never creates those caches; verify using a complete restart into the new ordinary build. Old in-process advanced caches are outside this bounded path and must not be activated as a user window. Existing caches omit session restore. Runtime verification must confirm actual target window activation/creation, source unsent draft preservation, independent cookies and return selection. Root owns compilation, single composed native build, approved signing and disposable app verification. No app execution/build/signing occurred in this lane.
