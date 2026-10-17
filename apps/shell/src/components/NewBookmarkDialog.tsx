import { useRef, useState } from "react";
import { Dialog } from "../ui/dialog";
import { bookmarkWebUrl } from "../bookmark-files";
import { hostOf } from "../workspace";

export function NewBookmarkDialog({
  folderName,
  busy,
  error,
  onClose,
  onSave,
}: {
  folderName: string;
  busy: boolean;
  error: string;
  onClose(): void;
  onSave(draft: { title: string; url: string }): void;
}) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const name = useRef<HTMLInputElement>(null);
  const url = bookmarkWebUrl(address.trim());
  return (
    <Dialog
      className="aux-dialog-surface library-form-dialog"
      label="Add new bookmark"
      initialFocusRef={name}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="library-new-bookmark"
        onSubmit={(event) => {
          event.preventDefault();
          if (url && !busy) onSave({ title: title.trim() || hostOf(url), url });
        }}
      >
        <h2>Add new bookmark</h2>
        <p className="hint">Save in {folderName}</p>
        <label>
          Name
          <input
            ref={name}
            className="field-input"
            value={title}
            disabled={busy}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          Address
          <input
            className="field-input"
            type="url"
            placeholder="https://example.com"
            required
            value={address}
            disabled={busy}
            onChange={(event) => setAddress(event.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="row">
          <button type="button" className="btn ghost" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={busy || !url}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
