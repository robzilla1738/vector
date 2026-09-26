import { useState } from "react";
import { bridge } from "../bridge";
import { call, toast, useStore } from "../store";

/**
 * Non-modal "save this sign-in?" card — Chrome-style. The credential itself
 * never reaches the renderer: confirm/dismiss only names the pending offer,
 * and main resolves it against the value captured at submit time. When the
 * vault is locked the card collects the passphrase and unlocks first.
 */
export function VaultOfferBanner() {
  const offer = useStore(state => state.vaultOffer);
  const setOffer = useStore(state => state.setVaultOffer);
  const [busy, setBusy] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  if (!offer || bridge.privateMode) return null;
  const act = async (save: boolean) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!save) {
        await bridge.vaultDismiss(offer.pageId, offer.origin);
      } else {
        if (offer.locked) await call("vault.unlock", { passphrase });
        const result = await bridge.vaultSave(offer.pageId, offer.origin);
        toast(result.updated ? "Sign-in updated in your vault." : "Sign-in saved to your vault.");
      }
      setOffer(null);
      setPassphrase("");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      if (offer.locked && /passphrase/i.test(message)) { setError("That passphrase did not match."); setBusy(false); return; }
      toast(message, "error");
      setOffer(null);
      setPassphrase("");
    } finally { setBusy(false); }
  };
  return <dialog className="vault-offer" open aria-label="Save sign-in">
    <div className="vault-offer-text">
      <strong>{offer.kind === "update" ? "Update sign-in?" : "Save sign-in?"}</strong>
      <span className="hint">{offer.username ? `${offer.username} · ` : ""}{offer.origin}</span>
      {offer.locked && <>
        <input type="password" className="field-input" autoComplete="off" aria-label="Vault passphrase" placeholder="Vault passphrase" value={passphrase} disabled={busy}
          onChange={event => setPassphrase(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter") void act(true); }} />
        {error && <span className="field-error" role="alert">{error}</span>}
      </>}
    </div>
    <div className="row">
      <button className="btn sm ghost" disabled={busy} onClick={() => void act(false)}>Not now</button>
      <button className="btn sm primary" disabled={busy || (offer.locked && passphrase.length < 8)} onClick={() => void act(true)}>{offer.locked ? "Unlock & save" : offer.kind === "update" ? "Update" : "Save"}</button>
    </div>
  </dialog>;
}
