import { useEffect, useState } from "react";
import type { VaultAccessRecord, VaultGrant, VaultItem, VaultStatus } from "@vector/contracts";
import { call } from "../store";

export function VaultSettings() {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [grants, setGrants] = useState<VaultGrant[]>([]);
  const [expired, setExpired] = useState<VaultGrant[]>([]);
  const [history, setHistory] = useState<VaultAccessRecord[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [label, setLabel] = useState("");
  const [origin, setOrigin] = useState("");
  const [username, setUsername] = useState("");
  const [accountLabel, setAccountLabel] = useState("");
  const [secret, setSecret] = useState("");
  async function refresh() {
    const [nextStatus, nextItems, nextGrants, nextExpired, nextHistory] = await Promise.all([
      call<VaultStatus>("vault.status", {}),
      call<VaultItem[]>("vault.list", {}),
      call<VaultGrant[]>("vault.grants", {}),
      call<VaultGrant[]>("vault.expiredGrants", {}),
      call<VaultAccessRecord[]>("vault.history", { limit: 30 }),
    ]);
    setStatus(nextStatus); setItems(nextItems); setGrants(nextGrants); setExpired(nextExpired); setHistory(nextHistory);
  }
  useEffect(() => { void refresh().catch(reason => setError(reason instanceof Error ? reason.message : String(reason))); }, []);
  async function action(work: () => Promise<void>) {
    setBusy(true); setError("");
    try { await work(); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  }
  return <section className="field" aria-label="Agent vault">
    <div className="drawer-section">Agent vault</div>
    <p className="hint">Optional locked store for site credentials the agent may fill. Secrets stay in OS encryption. Models, logs, observations and saved results receive opaque references only.</p>
    {status && <p className="hint" role="status">{!status.available ? (status.error ?? "Vault requires the Aux desktop app.") : status.locked ? "Locked. Unlock to save or fill credentials." : status.configured ? `Unlocked · ${status.itemCount} saved ${status.itemCount === 1 ? "credential" : "credentials"}` : "No credentials saved."}</p>}
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="row">
      <input type="password" aria-label="Vault passphrase" autoComplete="off" value={passphrase} onChange={event => setPassphrase(event.target.value)} placeholder={status?.configured ? "Passphrase" : "Choose a passphrase (8+ characters)"} />
      <button className="btn sm" disabled={busy || passphrase.length < 8} onClick={() => void action(async () => { await call("vault.lock", { passphrase }); setPassphrase(""); })}>{status?.configured ? "Lock" : "Set passphrase"}</button>
      <button className="btn sm" disabled={busy || !passphrase} onClick={() => void action(async () => { await call("vault.unlock", { passphrase }); setPassphrase(""); })}>Unlock</button>
    </div>
    {status && status.available && !status.locked && status.configured && <form className="field" aria-label="Save credential" onSubmit={event => {
      event.preventDefault();
      void action(async () => {
        await call("vault.save", { label, origin, username: username || undefined, accountLabel: accountLabel || undefined, secret });
        setLabel(""); setOrigin(""); setUsername(""); setAccountLabel(""); setSecret("");
      });
    }}>
      <label>Label<input value={label} maxLength={120} required onChange={event => setLabel(event.target.value)} /></label>
      <label>Site origin<input value={origin} inputMode="url" placeholder="https://example.com" required onChange={event => setOrigin(event.target.value)} /></label>
      <label>Username<input value={username} maxLength={200} onChange={event => setUsername(event.target.value)} /></label>
      <label>Account<input value={accountLabel} maxLength={120} placeholder="Optional account label" onChange={event => setAccountLabel(event.target.value)} /></label>
      <label>Secret<input type="password" autoComplete="off" value={secret} required onChange={event => setSecret(event.target.value)} /></label>
      <button className="btn sm" disabled={busy || !label.trim() || !origin.trim() || !secret}>Save credential</button>
    </form>}
    {items.map(item => <div className="task-resource" key={item.itemId}>
      <strong>{item.label}</strong>
      <span className="hint">{item.origin}{item.accountLabel ? ` · ${item.accountLabel}` : ""}{item.username ? ` · ${item.username}` : ""}{item.revokedAt ? " · revoked" : ""}</span>
      <div className="row">
        <button className="btn sm" disabled={busy || status?.locked || !!item.revokedAt} onClick={() => void action(() => call("vault.grant", { itemId: item.itemId, origin: item.origin }).then(() => undefined))}>Grant this origin</button>
        <button className="btn sm" disabled={busy || !!item.revokedAt} onClick={() => void action(() => call("vault.revoke", { itemId: item.itemId }).then(() => undefined))}>Revoke</button>
      </div>
    </div>)}
    {grants.length > 0 && <details><summary>Active grants</summary>{grants.map(grant => <div className="hint" key={grant.grantId}>{grant.credentialRef} · {grant.origin} · expires {new Date(grant.expiresAt).toLocaleString()} · used {grant.useCount}<button className="btn sm" disabled={busy || status?.locked} onClick={() => void action(() => call("vault.renewGrant", { grantId: grant.grantId }).then(() => undefined))}>Renew</button><button className="btn sm" disabled={busy} onClick={() => void action(() => call("vault.revoke", { grantId: grant.grantId }).then(() => undefined))}>Revoke grant</button></div>)}</details>}
    {expired.length > 0 && <details open><summary>Expired grants</summary><p className="hint">Renew the same grant. Aux does not duplicate the secret or create a second credential.</p>{expired.map(grant => <div className="hint" key={grant.grantId}>{grant.credentialRef} · {grant.origin} · expired {new Date(grant.expiresAt).toLocaleString()}<button className="btn sm" disabled={busy || status?.locked} onClick={() => void action(() => call("vault.renewGrant", { grantId: grant.grantId }).then(() => undefined))}>Renew without duplicating</button><button className="btn sm" disabled={busy} onClick={() => void action(() => call("vault.revoke", { grantId: grant.grantId }).then(() => undefined))}>Revoke grant</button></div>)}</details>}
    {history.length > 0 && <details><summary>Access history</summary>{history.map(row => <span className="hint" key={row.seq}>{row.action} · {row.actor}{row.origin ? ` · ${row.origin}` : ""}{row.detail ? ` · ${row.detail}` : ""} · {new Date(row.recordedAt).toLocaleString()}</span>)}</details>}
  </section>;
}
