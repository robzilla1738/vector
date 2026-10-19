# Supplied browser-import boundary proposal

Pinned source consumers are recorded with SHA256/offsets in provided-core-api-consumer-anchors.json. These are the original Agent1.26.1016.1852 flows, not new import UI.

The supplied importer chooses its Safari archive dialog from source.requiresFileImport. Its normal native start input omits dataKinds for a full import; the dedicated bookmarks action passes dataKinds:['bookmarks']. The supplied terminal listener checks progress.state and progress.errorMessage, filtering sourceId/jobId. Native currently advertises no requiresFileImport, requires categories even for the original full-import input, and emits status/error. This prevents the original flow from starting/completing.

The staged native-provided-import-results.patch adapts this boundary only:

- Public source rows derive requiresFileImport from the actual Safari export source.
- Accept the supplied dataKinds input, preserve explicit legacy categories for internal callers and reject ambiguous dual lists. Absent lists select only that actual discovered source's supported categories. Empty, oversized and unsupported lists still fail. Source/profile discovery and the real migrator stay authoritative.
- Public progress/start/event results add state/errorMessage from actual internal status/error; internal job state and work are unchanged. Polling and events use one serializer.
- Existing private-mode, exact caller job ownership, source/destination separation, archive limits, cancellation and underlying import failures remain enforced. Nothing reports success before the actual worker does.

The existing independent API user_gesture check is retained in this proposal. Its compatibility with the original stored-import/route-navigation flow is unresolved: matching old IDL does not prove a gesture requirement, and the original UI starts native import after asynchronous dialog/navigation state. This must be resolved from actual supplied native guard evidence or a reviewed explicit consent handoff, without fake success or weakening component/profile authority. Thus this patch alone is not complete browser-import acceptance.

Validation: exact source/output SHA256 and replacement counts are in native-provided-import-results.json; the patch applies to disposable native source copies and hashes match. C++ is uncompiled/unrun while the shared native build remains active. No browser profile, archive, Keychain, OS grant or import was accessed/executed.
