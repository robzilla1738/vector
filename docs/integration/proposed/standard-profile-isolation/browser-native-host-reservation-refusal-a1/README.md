# Publish definite pre-spawn refusal after reservation

Narrow successor to `browser-native-host-custody-a1`. Three original call sites could reserve a native cohort successfully, then observe admission closure in `MaySpawn` and return without ever publishing the real pre-spawn failure. That retained `publication_pending` forever even though these branches cannot have launched a child.

The content, native-messaging and owned daemon-child entry points now distinguish a missing ticket from a reserved ticket whose `MaySpawn` check refused. Only the latter calls `DidFailBeforeChild` for that exact native ticket before returning. Existing engine uncertainty remains sticky; this does not turn a missing callback, unknown PID or actual child exit into failure-before-child. Original reap, descendant lineage and physical fence requirements remain unchanged.

`manifest.json` pins the immutable a1 output bytes; `replacements.json` contains three count-one changes and `change.patch` the same literal edits. The content source is deliberately the a1 predecessor; the content-policy/rebase owner must compose this branch with the separate authenticated renderer qualification successor. This proposal does not overwrite that newer source or claim an integrated build.

Crashpad's a1 SpawnSubprocess path has no post-reservation MaySpawn-refusal branch, so no unrelated launch semantics are added there. Its separate exact-client shutdown work remains with its source owner.

Verification: all three exact baseline hashes matched a1's manifest and all three literal replacements occurred once. Source only; no native compilation, process/client execution, signing, grant, application or broad test suite.
