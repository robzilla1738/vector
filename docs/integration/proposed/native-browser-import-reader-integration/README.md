# Discovery and password-reader integration

The original proposals remain immutable. Discovery modifies source naming/root selection and public metadata; the three reader proposals modify two-store reads, blocked/partial-decrypt handling and the private optional-key forwarding. They share two files but change separate code.

Each original reader baseline and output is first verified in its original order against actual419. The identical original patch bytes are then applied after discovery. New metadata pins those composed input/output bytes. Finally, applying discovery after all original reader patches produces byte-identical results for both files. rebase-proof.json records that equality and every original input/patch hash.

This is a source merge only. No profile, credential, Keychain or OS operation is performed. Compile/runtime evidence is recorded separately.
