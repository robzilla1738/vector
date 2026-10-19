# NTP port focused compiler fixes

Pinned two-file follow-up against actual appliedv26. Temporary patch replay verifies both output hashes; shared checkout unchanged. These fixes have not been compiled here.

- Remove `pref_observer_.RemoveAll()` from the old ProfileGate teardown: that observer/member moved into the actual profile-owned NtpPrerenderService, which already removes its preferences on profile destruction.
- Replace the deleted PageTransition equality operator with `ui::PageTransitionCoreTypeIs`. This preserves the supplied low-byte comparison, rather than accidentally rejecting ordinary typed transitions carrying high-bit qualifiers.

The pinned original navigator disassembly in ../native-ntp-preloader/navigator-recovery-arm64.txt shows `036c6024: ldrb w8,[x19,#0x284]`, `036c6028: cmp w8,#1`, followed by equality branch into Take. The same field is a32-bit transition elsewhere in supplied036c4d40.c (including uint load and navigation calls). Chromium155 ui/base/page_transition_types.h defines CORE_MASK=0xff and typed1, with qualifiers in the higher bits; its documented CoreTypeIs ignores those qualifiers. No other condition or normal navigation path changes.
