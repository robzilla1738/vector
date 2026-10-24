# Browser observer a8 compiler correction

One selected source file, four exact anchors against actual a7 engine input. Apply after the independent native-host constructor fix; no file overlap. No tree, GN or compiler configuration change.

The successful native es_subscriptions allocation is converted to a bounded std::span only after non-null and exact four-entry validation. A single documented UNSAFE_BUFFERS boundary covers the SDK pointer/count construction; searches use span iterators, and the view ends before native free. No broad warning suppression is introduced.

The opaque es_client_t is allocated by Endpoint Security and retained for the entire native observer lifetime, including uncertainty; it is never a PartitionAlloc-managed object. Its one field uses the same clang annotation as RAW_PTR_EXCLUSION directly, avoiding a PA runtime/build dependency in the main executable before framework load. The added base/compiler_specific.h supplies only compiler/build macros.

Exact source replay passed. The compiler errors are recorded in the parent's actual a8 focused compile log; this proposal has not itself been compiled or executed. Parent owns the narrow recompile and integration. Runtime acceptance remains false.
