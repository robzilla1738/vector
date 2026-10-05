import { staticFieldInputProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useState } from "react";
import { bridge } from "../bridge";
import { call, toast, useStore } from "../store";

/**
 * Non-modal "save this sign-in?" card — Chrome-style. The credential itself
 * never reaches the renderer: confirm/dismiss only names the pending offer,
 * and the browser resolves it against the matching pending offer. When a
 * legacy vault is locked the card collects the passphrase and unlocks first.
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
        if (!await bridge.vaultDismiss(offer.pageId, offer.origin, offer.offerId))
          throw new Error("This sign-in offer is no longer available.");
      } else {
        if (offer.locked) await call("vault.unlock", { passphrase });
        const result = await bridge.vaultSave(offer.pageId, offer.origin, offer.offerId);
        if (!result.ok) throw new Error("This sign-in offer is no longer available.");
        toast(result.updated ? "Sign-in updated in this browser." : "Sign-in saved in this browser.");
      }
      setOffer(null);
      setPassphrase("");
    } catch (reason) {
      const message = errorMessage(reason);
      if (offer.locked && /passphrase/i.test(message)) { setError("That passphrase did not match."); setBusy(false); return; }
      toast(message, "error");
      setOffer(null);
      setPassphrase("");
    } finally { setBusy(false); }
  };
  return <dialog className="vault-offer" open aria-label="Save sign-in">
    <div className="vault-offer-text">
      <strong>{offer.kind === "update" ? "Update sign-in?" : "Save sign-in?"}</strong>
      <span {...staticHintProps}>{offer.username ? `${offer.username} · ` : ""}{offer.origin}</span>
      {offer.locked && <>
        <input type="password" {...staticFieldInputProps} autoComplete="off" aria-label="Vault passphrase" placeholder="Vault passphrase" value={passphrase} disabled={busy}
          onChange={event => setPassphrase(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter") void act(true); }} />
        {error && <span {...staticFieldErrorProps} role="alert">{error}</span>}
      </>}
    </div>
    <div {...staticRowProps}>
      <button {...smallGhostButtonProps} disabled={busy} onClick={() => void act(false)}>Not now</button>
      <button className="btn sm primary" disabled={busy || (offer.locked && passphrase.length < 8)} onClick={() => void act(true)}>{offer.locked ? "Unlock & save" : offer.kind === "update" ? "Update" : "Save"}</button>
    </div>
  </dialog>;
}
