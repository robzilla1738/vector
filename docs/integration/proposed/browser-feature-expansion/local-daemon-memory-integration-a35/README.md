# Memory-enabled daemon integration

Root composed the final A41/A42 native/Swift leaves into a single private build
source directory. This preserves quoted-include precedence: an older adjacent
inline/header cannot override the selected launch-fence successor via `-I`.
The actual retained Node/SDK command and source/object closure are pinned.

A61 compiled the replacement WorkerHost object. Its helper compile failed two
C++ `catch` clauses. A36 acknowledges both as `catch(...)`, preserving the failed
bytes and reusing the successful Worker object. A62 compiled that helper and all
50 Swift owners, then failed one C-linkage declaration placed after the header's
`extern "C"` block. A37 moves that declaration into the existing C block. A63
recompiles only the affected Worker object, reuses the helper (actual depfile
excludes that header), and fully links the paired daemon successfully.

The final receipt is `../local-daemon-memory-integration-a37/actual-build.json`.
Its plan pins all retained and selected inputs; actual Mach-O inspection finds
no signature load command. No host fixture executable, helper or product was
executed or signed. Compilation/linkage is not sandbox, indexing, account-switch,
shutdown or restart acceptance.

Packaging must pair the two actual supplied JS source/entry leaves, the fixed
separate memory executable and signed launch resource, plus the startup lifetime
consumer. Missing/unsigned/mismatched helper policy continues to refuse. Ordinary
mode's general task/exec/native-host restrictions remain intact. The accepted UI
and running A25 candidate remain unchanged.
