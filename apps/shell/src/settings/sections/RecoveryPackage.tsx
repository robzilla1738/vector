import { useState } from "react";
import { bridge, inNativeHost } from "../../bridge";
import { call } from "../../store";

type Review = Awaited<ReturnType<typeof call<"installation.inspectRecovery">>>;

/** Offline copy is a separate, explicitly reviewed recovery path from Aux-managed backups. */
export function RecoveryPackage({ pending, onStaged }: { pending: boolean; onStaged: () => void }) {
  const [phrase, setPhrase] = useState("");
  const [path, setPath] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const error = (value: unknown) => setMessage(value instanceof Error ? value.message : String(value));
  async function run(work: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await work(); } catch (cause) { error(cause); }
    finally { setBusy(false); }
  }
  return <section aria-label="Protected recovery package">
    <h3>Protected recovery package</h3>
    <p className="hint">Create a phrase-encrypted offline copy of this Profile's task data, saved evidence,
      remembered pages, and current Space memory. It excludes browser cookies, passwords, Keychain credentials,
      connector tokens, and deleted memory. The reviewed package is limited to 64 MB; larger Profiles fail without
      a partial export. Settle active work before exporting. Imported grants are revoked and routines pause for review.
      Copies and phrases kept outside Aux cannot be revoked after Forget.</p>
    <label>Recovery phrase
      <input type="password" autoComplete="new-password" minLength={16} maxLength={200}
        value={phrase} disabled={busy} onChange={event => { setPhrase(event.target.value); setReview(null); }} />
    </label>
    <div className="row">
      <button className="btn sm" disabled={!inNativeHost || busy || pending || phrase.length < 16}
        onClick={() => void run(async () => {
          const result = await call("installation.exportRecovery", { phrase });
          setPath(result.path); setPhrase(""); setReview(null);
          setMessage(`Encrypted package created at ${result.path}. Copy it to a place you control and keep the phrase separately.`);
          await bridge.revealPath(result.path);
        })}>Create encrypted package…</button>
      <button className="btn sm ghost" disabled={!inNativeHost || busy || pending}
        onClick={() => void run(async () => {
          const selected = await bridge.openFile();
          if (selected) { setPath(selected); setReview(null); }
        })}>Choose package…</button>
    </div>
    <label>Package path
      <input type="text" value={path} disabled={busy || pending} onChange={event => { setPath(event.target.value); setReview(null); }} />
    </label>
    <button className="btn sm" disabled={!inNativeHost || busy || pending || !path || !phrase}
      onClick={() => void run(async () => { setReview(await call("installation.inspectRecovery", { path, phrase }));
        setMessage("Package authenticated. Review its contents before staging recovery."); })}>Review package</button>
    {review && <div className="hint" aria-label="Recovery package review">
      <p>Created {new Date(review.manifest.createdAt).toLocaleString()} · {review.manifest.artifactIds.length} artifacts ·
        {" "}{review.manifest.pageMemoryCount} remembered pages · {review.manifest.spaceMemory.length} Spaces with memory.
        SQLite tables: {review.manifest.sqliteTables.length} protected plans.</p>
      <p>Excluded: {review.manifest.excluded.join("; ")}.</p>
      <p>Recovery replaces data in a new, empty disposable Profile on restart. It uses that Profile's own OS keys.
        Existing Profiles and their credentials are not merged.</p>
      <button className="btn sm danger" disabled={busy || pending}
        onClick={() => void run(async () => {
          const result = await call("installation.stageRecovery", { path, phrase,
            expectedSha256: review.sha256, reviewToken: review.reviewToken });
          setPhrase(""); setReview(null); onStaged();
          setMessage(`Recovery staged: ${result.artifactFiles} artifacts, ${result.spaceCount} Space memories,
            ${result.pageMemoryCount} remembered pages. Quit Aux normally and reopen to apply.`);
        })}>Stage reviewed recovery…</button>
    </div>}
    {message && <output className="hint">{message}</output>}
  </section>;
}
