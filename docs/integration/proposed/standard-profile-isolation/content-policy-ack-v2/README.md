# Content policy ACK v2: narrow source correction

Apply after the exact v1 outputs; v1 is unchanged. Two files, three counted anchors:

- Remove the rogue leading quote before `released = true;`. This was a source-generation defect missed by exact replay, which checked reproducibility rather than C++ syntax.
- Recheck the same held/named executable device/inode immediately after static signature/hash reads, and again after live process signature/hash validation. A substituted nonregular named object refuses. Retained descriptor and original birth/reaper checks remain.

The existing static signature check already uses both `kSecCSCheckAllArchitectures` and `kSecCSStrictValidate`; unchanged. The selected SDK defines `SecCodeRef` as `__SecCode*` and `SecStaticCodeRef` as `const __SecCode*`, so the live-code argument to `SecCodeCopySigningInformation` is a valid qualification conversion. The selected `UNSAFE_BUFFERS(...)` macro expands to begin pragma, the supplied block and end pragma; the block plus following semicolon is valid syntax. Neither requires a speculative adaptation.

Exact count-one replay passed. No native compilation, executable invocation, signing, source-tree activation or lifecycle action was performed. Root owns actual compile/integration. This patch changes no writer coverage or late/missing-receipt behavior.
