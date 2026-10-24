# Seatbelt receipt FD parser correction — v3

One counted source replacement against the exact current a5 seatbelt_exec.cc. Earlier v1/v2 remain immutable.

The actual compile rejected `strtol` under Chromium's unsafe-buffer libc policy. The replacement copies the already prefix-matched, in-range, NUL-terminated argv string into owning storage using the same existing narrow argv-index annotation as the neighboring client switch parser. After that boundary, a range-for digit loop operates only on the bounded string. It rejects empty input, signs, whitespace, nondecimal bytes and values above INT_MAX before multiplication. Generated receipt arguments are already decimal nonnegative descriptor numbers. Duplicate detection and all native receipt behavior remain unchanged.

No warning suppression or global unsafe-buffer bypass is added. The original annotated argv access is narrowed from index plus pointer arithmetic to index only. No extra include or link dependency is needed: this file already uses std::string and INT_MAX. In particular, the low-level seatbelt component does not gain a //base dependency solely for StringToInt.

`anchors.json`, `source.patch` and `manifest.json` pin the single edit and exact before/after bytes. Literal replay was checked once. No native compiler, process or app was run; root owns the actual failed-object compilation and remaining build.
