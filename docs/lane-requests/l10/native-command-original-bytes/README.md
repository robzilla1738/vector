# Preserve original command reply bytes

Narrow successor to immutable71180b9d. The shared mailbox now extracts the exact original nested record substring before decoding or returning it. A bounded structural parser checks every original wrapper and record key for duplicates; native scalar number bytes (including Chromium .0 doubles) are retained. Old operations keep their original behavior. Original READY/final scope and native hardware predicates remain unchanged.

44 Node controls pass: all41 predecessor controls plus actual transport duplicate-record, duplicate-wrapper and .0 preservation regressions. Exact three-leaf forward/reverse/forward replay passes. Source-only; no native execution, hardware timing, cardinality or cohort qualification.
