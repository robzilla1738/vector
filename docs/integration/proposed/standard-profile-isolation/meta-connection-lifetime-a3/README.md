# Async generation and post-destruction reentrancy correction

Three count-one adaptations across two files, after Meta a2. The ProfileImpl baseline is byte-identical to a2's frozen output and the selected native a6 input.

The content Target protocol generator now lists `disposeAuxBrowserContextAndObserve` as asynchronous. This generates its required callback type without changing the PDL method, parameters or return fields. The separate Chrome generator explicitly includes only `setRemoteLocations` and `createTarget` in Target and its TargetHandler does not implement the new method, so no Chrome async entry is needed or added; that exact configuration is pinned as evidence.

`ProfileImpl::DestroyOffTheRecordProfile` still destroys the child by erasing its owning entry before notification. Its original extensions cleanup now finishes before the external completion callback. The callback is the final operation, so reentrant parent destruction cannot be followed by parent accesses from this method. Qualification and callback-registration semantics remain unchanged.

Only literal replay, JSON structural equality except the single async entry, and immutable hash checks were run. Root owns actual generated binding regeneration and focused compile. No native tree, frozen predecessor, daemon14 stage, UI, package, app or provider state changed. No runtime acceptance claim.
