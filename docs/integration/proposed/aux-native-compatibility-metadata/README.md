# Actual native compatibility metadata — bounded static audit

The inspected current candidate does **not** substantiate full macOS13.5 support. Across its actual Mach-O files plus the supplied critical inputs/retained own-runtime proposal, the highest arm64 `LC_BUILD_VERSION.minos` is **27.0**. The new native-main plan's13.5 compiler target is only a planned target for that future executable; it neither changes existing binaries nor proves runtime/API support.

`evidence.json` retains SHA256/byte count, architecture, file type, minimum OS, SDK and direct dependency names for127 Mach-O files (125 have an arm64 slice). It reads only the actual `out/provided-candidate-aux-recovery-enrollment/Aux.app`, seven exact frozen source artifacts and one retained own-runtime build. Candidate symlink aliases are omitted; no application state, profile or credentials were read. The collector decodes public headers/load commands directly and never executes an artifact. Two representative higher minimums were independently confirmed with `xcrun otool -l` in `otool-crosscheck.json`.

| Actual artifact cohort | Declared arm64 minimum | SDK | Consequence |
| --- | --- | --- | --- |
| Supplied Node26.5.0, daemon SEA, CLI SEA |13.5|15.5|Required baseline runtime is above13.0. |
| Supplied arm64 PTY module and spawn-helper |11.0|15.5|Not the compatibility bottleneck; their current original signatures still fail the future Aux identity policy. |
| Supplied common addon and computer-use helper |13.0|26.5|Metadata only; common-addon retirement remains separate. |
| Pinned own PDF/macOS utility and retained own-runtime `.node` |13.0|27.0|An SDK27 build can declare13.0; SDK and deployment minimum are different fields. |
| Packaged browser executable/framework and owned headless helper |13.0|27.0|Does not lower dependencies' minima. |
| Packaged CLI wrapper, both native guards, native carrier, boundary dylib (five files) |**27.0**|27.0|Current candidate's whole-feature metadata maximum. |
| Agent-runtime `pdfinfo`, `pdftoppm`, `pdftotext` and31 dependencies |**26.0**|26.5|Still limits these document-processing commands even if future native-main work retires legacy27.0 artifacts. |

The five27.0 paths are:

* `Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli`
* `Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/Resources/native/aux-native-guard.node`
* `Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-native-guard.node`
* `Contents/Resources/aux/native/aux-native-carrier`
* `Contents/Resources/aux/native/libaux-native-boundary.dylib`

SDK metadata is not a requirement by itself. Conversely, a low `minos` is not proof that a binary's API calls, weak imports, architecture, code-signing/entitlements, runtime data files, Node registration or services work on that OS. This audit has not exercised any supported OS and makes no successful-launch claim. Universal/x86_64 resources are recorded separately and do not imply an x86_64 product build; the intended new embedded graph is arm64-only.

For an eventual13.5 support goal, rebuild each still-required27.0 wrapper/guard/helper from its actual source with an explicit reviewed deployment target and preserve its behavior; never patch Mach-O version bytes to pretend compatibility. The future embedded graph may legitimately retire some of those exact legacy artifacts only once their paired routes are replaced. Independently address the26.0 document-toolchain: rebuild the actual pinned tools and transitive dependencies against the supported target, or explicitly keep their feature unavailable on older OS versions. The own PDF addon does not automatically replace those command-line paths. If retaining current artifacts unchanged, the product must not claim full-feature13.5 compatibility. After actual artifacts are selected/built, record a new metadata inventory and focused runtime acceptance on the genuine oldest supported OS; marketing/minimum-OS declarations remain unchanged by this task.

No compiler, signing, protected native call, module/helper execution, application launch, OS grant or UI change occurred. The future v3 PTY policy still requires separate real Aux-signed output review. No existing evidence or active build recipe was rewritten.
