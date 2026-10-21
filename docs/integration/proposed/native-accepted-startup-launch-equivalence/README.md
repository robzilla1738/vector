# Preserve accepted launcher startup flags

Actual scripts/aux.mjs:147 always passes --no-first-run and --no-default-browser-check alongside the isolated user-data-dir and mock Keychain switch. The accepted Finder record path should preserve those same two Chromium startup flags after every record/signature/scope check succeeds. Missing or rejected acceptance receives no new flags; inherited AUX_HOME launches remain unchanged.

Chromium first_run.cc:329-333 determines first run from force_first_run or missing sentinel without no_first_run. IsChromeFirstRun caches that result at lines352-361. CreateSentinelIfNeeded only writes a sentinel when IsChromeFirstRun is true (lines370-375); consequently the already approved no-first-run launcher may leave its existing profile without that sentinel. Omitting the switch on Finder launch can reintroduce first-run flow despite reuse of exactly the same profile. The Mac suppression helper also directly reads this switch at365-367. infobar_utils.cc:308 gates the default-browser check on no-default-browser-check.

This preserves the existing disposable launch behavior, not an Aux account/login/onboarding bypass. It neither creates nor edits a First Run marker, changes default-browser registration, nor relaxes installation authentication. Existing main-delegate logic still applies use-mock-keychain. No new state home/profile or runtime operation.

One count-checked anchor against actual v574 header; isolated patch replay and output hash passed. No shared native edit or build. Integrate only after current packaging finishes, with the next native batch.
