# Supplied Firefox password parser comparison

The supplied parser and its inlined password-form conversion match the retained Chromium155 implementation on the positively recovered branches below. No native patch is proposed. This conclusion comes from the actual original instructions and literal bytes, not shared function names.

Comparison baseline is the `nss_decryptor.cc` output of commit `15ad38d515918351ea4d2c5583ee712084ea42c8`, SHA256 `a901be12ee48f2db70111d2f81dd374d1c1c9a55ec01ad146ef92c6f0f7080e7`, copied under `source/`. That earlier proposal changes the Mac class/decrypt guards while retaining these common parser methods. The original complete parser begins `0x46bedf0` and ends before the distinct vector-append helper at `0x46bfd58`; exact original-image/range/listing hashes are in `source-evidence.json`.

| Supplied original instruction anchors | Retained155 behavior |
| --- | --- |
| `0x46bee38..0x46bee3c` | Read the entire named JSON file; do not separately reject the file-read return value. |
| `0x46bee6c..0x46bee88` | Parse with flags `0x34`, depth200; require an engaged dictionary value (type6). Invalid JSON or a non-dictionary root returns false. Current `JSON_PARSE_CHROMIUM_EXTENSIONS` is comments4 + X escapes16 + newlines32 =52 (`0x34`). |
| `0x46bef30..0x46bef44`, `0x46bf17c..0x46bf184` | Optional `disabledHosts` list, skip non-string entries (type4), preserve array order. |
| `0x46bf194..0x46bf1fc`, `0x46bf02c..0x46bf118` | Construct each blocked form from the supplied host, clear username/password/query/ref, derive origin realm, set blocked=true. There is no independent URL-validity filter for blocked hosts. |
| `0x46bef94..0x46befc0`, `0x46bf6e4..0x46bf6f0` | Optional `logins` list; skip non-dictionary rows, preserving order. |
| `0x46bf714..0x46bf8e8` | Exact string lookups: hostname, usernameField, passwordField, encryptedUsername, encryptedPassword, formSubmitURL, httpRealm. Missing/wrong-type fields leave default-empty members. The two element names use UTF8-to-UTF16 conversion (`0x46bf778`, `0x46bf7d0`). |
| `0x46bfa0c..0x46bfa58`, `0x46bfbe0..0x46bfc08` | With a nonempty realm, search for the exact `://` sequence in hostname. If absent, prefix `http://`; otherwise use hostname as given. Empty realm also uses hostname as given. |
| `0x46bf35c..0x46bf360`, `0x46bf5d0..0x46bf624` | Reject an invalid login URL before decrypting; append only when the original GURL validity byte is true. |
| `0x46bf964..0x46bf9d0`, `0x46bf364..0x46bf3bc` | Use the same cleared replacement fields for the login URL and derive its origin realm. The replacement sources at stack`440+10/+20/+60/+70` are empty nonnull strings: username/password/query/ref. Other source pointers remain null (unchanged), matching the current Replacements layout/clear semantics. |
| `0x46bf41c..0x46bf450` | Nonempty httpRealm is appended to the signon realm and sets Basic scheme1. Empty realm retains default HTML scheme0; no invented Basic/Digest distinction. |
| `0x46bf454..0x46bf4f8` | Copy username element, decrypt username via real `0x46beb2c`, copy password element, decrypt password via that same function. Empty decrypt outputs are retained; no extra row rejection. |
| `0x46bf4fc..0x46bf538` | Construct action GURL from formSubmitURL and apply the same replacements. No added action validity requirement. |
| `0x46bee78..0x46bee90`, `0x46beec8..0x46beeec`, list-empty branches | Return whether the parsed root is a dictionary, including a valid dictionary with absent/empty lists. There is no minimum imported-row requirement in this parser. Existing output rows are appended to, not cleared. |

The code preserves original defaults and the actual ImportPasswordForm payload; no timestamp, extra schema, normalization, trimming, account metadata, field filter or fallback is introduced. The independent utility-result and browser-store settlement work remains owned by its original lanes. Parser success alone does not prove a successful password destination write.

`evidence/parser-decompile.json` retains the bounded REA result for review. Its raw-image decompiler warns about bad instruction data and follows the variant exception branch into an adjacent append helper, producing misleading interleaved code after that path. It is not the source of the function boundary or a claim of compilable original source. The bounded original LLVM listing, exact literal bytes and direct branch/data flow are authoritative. The REA session was snapshotted and closed after analysis.

This is a static comparison only. No JSON/profile/credential data was read; no NSS/library load, decryption, database, password store, build, runtime launch or OS operation ran. Parser and complete import runtime acceptance remain unverified.
