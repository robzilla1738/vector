# Original Reopen source admission before effects

Narrow successor to frozen28e. The existing exact retained run/observation/URL predicate now executes before reservation and the original newTab producer, in addition to unchanged post-ACK delivery checks. No producer arguments, disabled availability, disconnected behavior, tab side effects or cleanup policy changes.

Two mounted tests mutate the actual latest run or retained observation and synchronously dispatch through the original focused registry before React commit; both refuse without starting newTab. The frozen post-only predicate fails both bounded immediate-ACK controls. Initial held falsifier and current new-run hydration fixture failure are retained; the actual GET fixture now returns the real current store run. All original14 assertions remain. Final62 mounted controls/types/scopedlint/F-R-F pass. No native/Vite/budget claim.
