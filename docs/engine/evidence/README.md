# Vector Engine evidence (VEC-001–025)

Each package lists the acceptance target, current-tree evidence, and remaining
gaps. Identity is the native Vector Engine (`vector-engine`), not Chromium.

**Labels follow Vector_Current_Review_60b2d41 Finding 6.** The supported testharness subset is adapted-harness coverage, not unmodified upstream. Official `html/dom/partial-updates` on pin 7c204383: 28 PASS / 2 FAIL of 30 (`sanitize-template-element`, `template-for-empty` — HTML5 contradictions; do not weaken empty-for-streaming). Official `html/dom/idlharness.https.html` fetches IDL over TLS and still FAILs (`document.all` [[IsHTMLDDA]] only; 10 residual subtests, down from 20). That is not an official PASS. Official `html/dom` tree numbers in `wpt-tree-latest.json` are not a claim that the entire web passes. ve-vm remains research (V8 is production).

| Ticket | Evidence file | Status |
|---|---|---|
| VEC-001 | [VEC-001.md](VEC-001.md) | implemented |
| VEC-002 | [VEC-002.md](VEC-002.md) | implemented |
| VEC-003 | [VEC-003.md](VEC-003.md) | implemented |
| VEC-004 | [VEC-004.md](VEC-004.md) | implemented |
| VEC-005 | [VEC-005.md](VEC-005.md) | implemented |
| VEC-006 | [VEC-006.md](VEC-006.md) | implemented |
| VEC-007 | [VEC-007.md](VEC-007.md) | implemented |
| VEC-008 | [VEC-008.md](VEC-008.md) | implemented |
| VEC-009 | [VEC-009.md](VEC-009.md) | implemented |
| VEC-010 | [VEC-010.md](VEC-010.md) | implemented |
| VEC-011 | [VEC-011.md](VEC-011.md) | implemented |
| VEC-012 | [VEC-012.md](VEC-012.md) | implemented |
| VEC-013 | [VEC-013.md](VEC-013.md) | implemented |
| VEC-014 | [VEC-014.md](VEC-014.md) | implemented |
| VEC-015 | [VEC-015.md](VEC-015.md) | implemented |
| VEC-016 | [VEC-016.md](VEC-016.md) | implemented |
| VEC-017 | [VEC-017.md](VEC-017.md) | implemented |
| VEC-018 | [VEC-018.md](VEC-018.md) | implemented |
| VEC-019 | [VEC-019.md](VEC-019.md) | implemented |
| VEC-020 | [VEC-020.md](VEC-020.md) | implemented |
| VEC-021 | [VEC-021.md](VEC-021.md) | implemented |
| VEC-022 | [VEC-022.md](VEC-022.md) | implemented |
| VEC-023 | [VEC-023.md](VEC-023.md) | implemented |
| VEC-024 | [VEC-024.md](VEC-024.md) | implemented |
| VEC-025 | [VEC-025.md](VEC-025.md) | research track (V8 remains production) |

