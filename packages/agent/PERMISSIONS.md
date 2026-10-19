# Routine access and final confirmations

Implements the policy precedence in `docs/spec/daemon/agent.md` using the shared
`approveOperation` function. Deny rules win over allow/approved rules, read-only rejects
mutations, explicit ask rules always prompt, and full-access permits routine operations
without an extra approval. Guard prompts for shell/browser/native mutation and external
filesystem access unless explicitly permitted. Files within the task/configured working
roots remain permitted under guard. OS authorization checks remain in native adapters.

Session permissionOverrides arrays retain absolute filesystem-root rules and also accept
`tool:bash`, `tool:browser_click`, trailing-prefix rules such as `tool:browser_*`, or `*`.
Account rules use the same shape at account namespace `permissions`, key `rules`.
An optional `approved` array is supported for account records. Always-approved routine
operations store only an exact tool/operation SHA256 fingerprint under the session's
approval record; they cannot override explicit ask/deny rules. Permission state is
rechecked after a human decision in case the policy became stricter while waiting.

Final-action confirmation is a separate decision kind and remains required even in
full-access. Browser click and shell tools expose finalAction for consequential actions;
native click/key/AppleScript likewise expose it. Model instructions require marking
send/submit/purchase/delete/publish operations. Dedicated iMessage/channel send tools
always require exact final confirmation. Full-access shell/native automation is broad
owner-authorized execution; arbitrary scripts cannot be exhaustively classified by a
shell parser, so unmarked custom-script consequences also depend on the model following
this instruction. This is not an OS sandbox.

File tools resolve real paths before policy checks and deny both model/channel credential
files, daemon installation-private.pem, session-secret and legacy private key/token
filenames, including symlink aliases. The public installation key is not secret.
Focused disposable tests verify routine shell/browser full-access, explicit ask, account
deny precedence, distinct final confirmation, and auth-file alias denial. Native input,
owner files and actual external communications are not exercised by these tests.
