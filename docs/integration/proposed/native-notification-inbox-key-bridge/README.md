# Supplied Agent inbox master-key bridge

The original notification inbox uses a separate 32-byte master key, stored as UTF-8 base64 in a legacy generic-password item. It does not use installation signing keys or Data Protection storage. The pinned original helper and its exact read/add attributes are recorded in [source evidence](../native-notification-inbox-key-source/README.md).

This two-file bridge invokes the fixed `agent-inbox-key` carrier command on the existing bounded private pipe. It requires both the existing native runtime gate and the separate external `AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN=1` gate. Only the fixed new command receives the new flag in its otherwise cleared child environment. Existing app/layout/immutable binding checks remain in place. The response must contain only a canonical base64 key of exactly32 bytes. No key or response is logged.

The carrier helper reproduces the supplied noninteractive read, not-found generation/add and duplicate re-read. The query interposer confines both service and account to the fixed Aux home scope. Updates and deletions are not enabled for this family. There is no alternate storage or installation-key fallback.

No new acceptance flag is enabled by staging, packaging or launching. Historical disposable installation-key approval does not cover this distinct family. Compilation and pure dictionary fixtures do not operate on Keychain data; live key creation/reading and notification behavior remain unverified.
