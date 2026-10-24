# A7b — two generated native compile corrections

Root's actual native compiler found an undeclared placeholder in Local Storage. The A7 materializer replaced the generic `OWNER` substring before the longer live-owner marker, producing `LIVE_LocalStorageImplS`; the Session sibling has the same issue.

This separate, two-anchor delta preserves the reviewed A7 manifest/history. It replaces only the two literal placeholders with the intended existing native owner inventory checks: Local refuses nonempty `areas_`; Session refuses nonempty `data_maps_` or `namespaces_`. No guard, wire method, target, backend behavior, UI, startup or authorization policy changes.

Inputs are the exact committed A7 output bytes. Root owns application to its projected native tree and actual compilation. One exact replay/reverse/hash/whitespace check passed in this lane; no native build or runtime claim is made here. Future A8 live-owner integration consumes these corrected outputs rather than the historical A7 generator.
