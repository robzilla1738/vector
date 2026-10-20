# Supplied profile display-name preference

Original registration at `0x34e4014..0x34e406c` constructs an empty string value: the temporary string is zeroed, `0xbddb80` receives length zero, and its Value discriminator is string (4). The call at `0x34e4048` registers the exact 26-byte key `aside.account_display_name` with both flag arguments zero. Equivalent current registration is:

```cpp
registry->RegisterStringPref("aside.account_display_name", "", 0);
```

The original registration helper retains the supplied registry flags and tests the sync flag bits; this call supplies none. This is an internal profile preference in the isolated Aux profile, not a branding key. The shared display-label helper uses this registered value only for an already-loaded non-OTR profile and multiple visible profiles. Empty defaults retain the supplied GAIA/username/local-name fallback.

This proof reads only the pinned supplied binary. Registration is root-owned; no shared native files or owner preferences were accessed or modified.
