import { useState } from "react";
import type { AutofillProfile } from "@aux/contracts";
const FIELDS: { key: keyof AutofillProfile; label: string; auto?: string }[] = [
  { key: "name", label: "Name", auto: "name" },
  { key: "email", label: "Email", auto: "email" },
  { key: "phone", label: "Phone", auto: "tel" },
  { key: "organization", label: "Organization", auto: "organization" },
  { key: "street", label: "Street address", auto: "street-address" },
  { key: "city", label: "City", auto: "address-level2" },
  { key: "region", label: "State or region", auto: "address-level1" },
  { key: "postal", label: "ZIP or postal code", auto: "postal-code" },
  { key: "country", label: "Country", auto: "country-name" },
];

/**
 * One personal-info card offered to page forms on explicit request (context
 * menu or command palette). Passwords and payment are intentionally absent —
 * credentials are the vault's job, not form data.
 */
export function AutofillSetting({ value, onSave }: { value: AutofillProfile | undefined; onSave: (next: AutofillProfile) => Promise<unknown> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AutofillProfile>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const profile = value ?? {};
  const filled = FIELDS.filter(field => profile[field.key]?.trim());
  const start = () => { setDraft({ ...profile }); setError(""); setEditing(true); };
  const save = async () => {
    setBusy(true); setError("");
    try {
      const clean = {} as AutofillProfile;
      for (const field of FIELDS) { const value = draft[field.key]?.trim(); if (value) clean[field.key] = value; }
      await onSave(clean);
      setEditing(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  };
  return <div className="autofill-setting">
    {!editing && <div className="row">
      {filled.length
        ? <span className="hint">{filled.length} detail{filled.length === 1 ? "" : "s"} saved — {filled.slice(0, 3).map(field => field.label.toLowerCase()).join(", ")}{filled.length > 3 ? "…" : ""}</span>
        : <span className="hint">No personal info saved. Forms fill only when you choose Fill personal info.</span>}
      <button className="btn sm" onClick={start}>{filled.length ? "Edit" : "Add personal info"}</button>
    </div>}
    {editing && <form className="autofill-editor" onSubmit={event => { event.preventDefault(); void save(); }}>
      {FIELDS.map(field => <label className="autofill-field" key={field.key}><span>{field.label}</span>
        <input className="field-input" autoComplete={field.auto} disabled={busy} value={draft[field.key] ?? ""} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} />
      </label>)}
      <div className="row">
        <button className="btn sm" type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        <button className="btn sm ghost" type="button" disabled={busy} onClick={() => setEditing(false)}>Cancel</button>
      </div>
      {error && <p className="hint err">{error}</p>}
    </form>}
  </div>;
}
