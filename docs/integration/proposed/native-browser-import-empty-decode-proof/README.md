# Successful empty plaintext is retained by the supplied password reader

Bounded review followup to `native-browser-import-blocked-partial` and `native-browser-import-optional-key`. **No native correction is required.** The implemented `plaintext.has_value()` success condition matches the original. Earlier conversational wording “successful nonempty decryptions” referred imprecisely to the original condition; nonempty applies to the **input blob**, not output plaintext.

Original data flow:

- 425b324..425b338 initializes/reads encrypted SQL column5 into the string at `sp+0x178`. Its short/long size fields are `sp+0x18f` / `sp+0x180`.
- 425b33c..425b340 separately initializes the output string at `sp+0x160` (size metadata `sp+0x177` / `sp+0x168`).
- 425b348..425b364 increments attempts if the **input** length is nonzero.
- 425b368 sets x0 to **input** `sp+0x178`; 425b36c sets x2 to **output** `sp+0x160`; the call425b370 returns the decoder's boolean.
- False at425b374 falls through425b378..425b3a8, destroys temporaries and returns to the row loop. This is the failed-row skip.
- True branches to425b800. That block reloads the same **input** size fields `sp+0x18f` / `sp+0x180`, then increments successes when that input is nonempty. It does **not** inspect output length.
- It falls through directly to real form construction425b820. A successfully decoded empty plaintext therefore counts when its input was nonempty, and the row is retained. The aggregate success condition remains `attempts == 0 || successes != 0`.

The current native reader's `if (plaintext && !cookies) ++decrypted_passwords;` inside the nonempty-input branch and its `if (!plaintext) continue;` distinguish success-with-empty-output from a failed decode exactly. Adding an output `empty()` condition or dropping an empty successful row would diverge from the supplied implementation.

`source-evidence.json` pins the full original thin image and two bounded raw ranges. Verification only hashes static inputs/outputs; no source profile, runtime, credential, Keychain, build, shared native mutation or OS operation was performed. No patch/GN/dependency changes.
