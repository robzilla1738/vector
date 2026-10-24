# Descendant snapshot race correction

Successor to browser-descendant-uncertainty-a1. Two header changes, two count-one anchors. The original proposal and running native inputs remain untouched.

## Confirmed interleaving

1. Admission is closed; an earlier reservation is still unbound.
2. Inspect copies that entry and cohort count zero under the registry mutex.
3. BindLaunch publishes a successful child and increments the cohort count.
4. The original reaper observes direct exit and releases/removes the entry.
5. Inspect takes the entry mutex, sees released, and skips it.
6. The earlier version returned zero unresolved and zero cohorts: a false-clean snapshot.

Both Inspect methods now re-read the monotonic unobserved cohort count and sticky accounting-unknown flag under the registry mutex after every entry has been scanned. If a successful binding happened before the scan skipped a released entry, its cohort increment is necessarily visible to this final read. If binding happens after the scan, the scanned unbound/unresolved entry already prevents clean status. Cohorts are never decremented. This closes the identified interleaving without acquiring registry and entry locks in the opposite order.

The original admission_closed observation is deliberately retained. Updating it from false to true at the final read could wrongly certify a copy taken before an intervening reservation was admitted. Other conservative pending/uncertainty observations are not cleared.

Exact ordered source replay, unified patch replay and whitespace validation passed. This is source/interleaving reasoning, not native compilation or runtime acceptance. No process, native build, signing or package invocation occurred. Browser descendant coverage remains intentionally unknown; this patch cannot establish new coverage.
