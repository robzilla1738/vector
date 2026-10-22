# Agent worker revisions must track final packaged assets

Actual 614 service-worker source from Debugger.getScriptSource was the old
notification implementation (SHA256
3ab0d7201b105212b3e30e3480de552c121a2676ecc6e9a657ba58a0f85d6262), while the
packaged background.js had the reviewed fix. Restart alone retained it.

Native evidence: extensions/browser/service_worker/service_worker_task_queue.cc
ActivateExtension compares persisted registered version with extension->version()
(lines 410–430). Equality only verifies existence; inequality calls the existing
RegisterServiceWorker path. chrome/browser/aux/component_bootstrap.cc loads the
packaged manifest through the component installer. ExtensionRegistrar::AddExtension
rejects version downgrades for non-unpacked locations. Therefore an unordered hash
as version is inappropriate here.

## Narrow staging integration (integrator owns production pipeline)

Use revision.mjs after all Agent file transforms in scripts/lib/provided-ui.mjs,
before report.components.agent is finalized. Supply final manifest bytes and final
output inventory; the helper returns one count-checked manifest edit. Append its
anchor to that manifest record, integration change kind, and replace outputSha256
and on-disk manifest bytes. Include helper and reviewed policy in adaptation input
inventory. Do not run it twice or after assembly/provenance hashes are frozen.

Maintain a checked-in review {revision, fingerprint}: a monotonically increasing
integer (initial revision 1) and SHA256 over sorted final pre-revision
[path, outputSha256] pairs. A changed asset requires a new reviewed revision;
unchanged assets reuse it. The helper fails closed on a different inventory.
Versions use 1.26.1016.(1852 + N), initially 1.26.1016.1853 (N 1–63683);
source version remains exactly 1.26.1016.1852 in version_name and source inventory.
When N exhausts, explicitly advance the version epoch rather than wrap.
Do not ship a lower version into an existing profile; rollback assets must receive
a newer revision. Keep full fingerprint, not a truncated hash version.

Preserves manifest key/extension ID, permissions, storage origin, profile data,
credentials, public protocols and UI. Uses Chromium's existing registration update;
no manual worker/profile cache deletion or forced broad extension reset. Root must
verify actual loaded source after next normal restart before notification acceptance.
This proposal does not claim that source observation has passed yet.
