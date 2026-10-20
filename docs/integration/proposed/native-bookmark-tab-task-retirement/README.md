# Genuine task binding retires bookmark representation

`BookmarkTabAssociations::RemoveForTab(tabs::TabInterface*)` implements original464eafc..464eb28: erase the matching real-handle f98 cache entry first, remove the actual WebContents representation, and persist the existing SessionService tombstones (`node_id` '0', empty host). No cached match means no mutation. The same existing `PersistClear` retains real positive SessionIDs and profile-owned SessionService behavior; it never substitutes a TabHandle integer for a SessionID.

L2's genuine task owner calls this method at its source-proven collision transition. This proposal does not mount the task owner or change source eligibility/URL classification. Baseline is the exact integrated cache owner from c65a6bf84 (root actual297 through309 unchanged).

Validation: original arm64 bytes/LLVM assembly and disposable two-file patch replay. No native compile, runtime acceptance, shared checkout write or OS interaction.
