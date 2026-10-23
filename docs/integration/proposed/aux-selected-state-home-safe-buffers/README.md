# Selected-home safe-buffer successor

A single-file count-pinned source successor against the actual applied Chromium source in `inputs.json`. No native checkout or GN mutation, compiler flags or runtime behavior activation.

Changes target the three actual browser-rollout diagnostics: (1) `PhysicalPath` uses zero-initialized `std::array` buffers, bounded terminator searches and iterator-range comparison instead of `strcmp`, retains realpath/canonical equality and retained/reopened inode checks; unterminated buffers now explicitly refuse before C string consumption. (2) payload wiping iterates actual vector elements, assigning through a volatile byte reference before clear; every original owned byte still receives a volatile zero store. (3) challenge prefix comparison uses the exact original array iterator range excluding only its implicit terminator, preserving its explicit protocol NUL and exact 32-byte challenge length. The actual decoded vector supplies its own span instead of pointer/count construction.

No blanket warning suppression, unsafe annotations, approximate comparison, identity weakening or wipe omission is introduced. No compile is claimed: root owns composition and the actual in-tree Ninja object check, because documentation-path compilation did not exercise the same rollout policy.

`baseline/` is the actual native input snapshot; `source/` is its successor; `safe-buffers.patch` changes only these spans and required standard includes. `verify.py` checks hashes and patch applicability in temporary storage only.
