# Local session attachments

Implements the attachment trust boundary in `docs/spec/daemon/agent.md` and
composer uploads in `docs/spec/ui/{chat,newtab}.md` with an independently designed API.

Create an idle session, then call authenticated
`sessions.uploadAttachment({accountId,sessionId,fileName,mediaType,base64})`.
The result is `{id,sessionId,fileName,mediaType,size,sha256,createdAt}`; list with
`sessions.attachments`, retrieve with `sessions.readAttachment({...scope,attachmentId})`,
and remove an unsubmitted file with `sessions.removeAttachment`.
Files stay local until `sessions.prompt`, `queue`, or `steer` receives explicit
`attachmentIds:string[]`. The accepted transcript row records those IDs.
Branching copies referenced attachments to the new session; editing accepted user text
retains that row's attachments. Submitted files are removed by clearing the transcript
or deleting the session. Removing a draft does not claim to retract a submitted file
from a remote model.

Supported inputs: UTF-8 text/plain, text/markdown, text/csv, application/json,
application/pdf, image/png, image/jpeg, image/gif, image/webp. Binary input currently
requires the publicly verified Muse model. Files require canonical base64, plausible
media signatures, <=2 MiB each, <=8 MiB per session, and <=10 distinct files per message.
These are independent local limits, not reference measurements. Upload does not decode
images or execute active documents. The account SQLite database stores attachment bytes
and accepted model context, protected by its owner-only filesystem permissions.
Attachments are explicitly labeled untrusted data; known configured credentials are
redacted from attached text before model submission. Upload metadata/list never includes
file bodies. Binary input is sent using AI SDK image/file parts; text is sent as text.
