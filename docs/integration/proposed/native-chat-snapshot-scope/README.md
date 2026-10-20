# Actual snapshot reconciliation suppression

After dca1c8d92 API correction. Original463d8d0 applies incoming real Chat rows, saves region11e9, sets it true before actual metadata/tab reconciliation462c2c0 and restores the previous byte afterward. Its task-adoption paths464ec6c/464ee60 suppress automatic section expansion while11e9 is set. The task owner now owns this concrete scoped state during SetChats reconciliation; an assembler cannot accidentally adopt server snapshots as user selection and expand a collapsed section. The existing explicit classification suppression is retained until other original producers are fully mapped.

The previous nested value is restored only if the same weak owner survives real Reconcile/changed callbacks. No raw member AutoReset outlives destruction. Persistent section preference/animation refresh belongs to the actual section assembly and is unchanged here; no fake animation state or success.

Pinned original bytes and temporary two-file replay pass. No native writes/build/runtime, and components remain unmounted.
