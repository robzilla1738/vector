import { useEffect, useRef, useState, type RefObject } from "react";
import { bridge } from "../bridge";
import { isScrimOverlay } from "../chrome";
import { useStore } from "../store";
import { SPACE_COLORS, type Space, type SpaceColor } from "../workspace";
import { NativeDialog } from "./NativeDialog";

export default function SpaceEditor({
  space,
  onSave,
  onClose,
  returnFocus,
}: {
  space: Space | null;
  onSave: (name: string, color: SpaceColor, grain: number) => Promise<void>;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement | null>;
}) {
  const [name, setName] = useState(space?.name ?? "");
  const [color, setColor] = useState<SpaceColor>(space?.color ?? "violet");
  const [grain, setGrain] = useState(space?.grain ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave(name.trim(), color, grain);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };
  const previous = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => {
    void bridge.overlay(true);
    return () => {
      void bridge.overlay(isScrimOverlay(useStore.getState().overlay));
    };
  }, []);
  return (
    <NativeDialog
      label={space ? "Edit space" : "New space"}
      onClose={onClose}
      returnFocus={returnFocus ?? previous}
      className="sheet pop-in"
    >
      <h3>{space ? "Edit space" : "New space"}</h3>
      <input
        autoFocus
        className="field-input"
        value={name}
        maxLength={100}
        disabled={saving}
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void save();
        }}
      />
      <div className="swatches" role="radiogroup" aria-label="Colour">
        {SPACE_COLORS.map((c) => (
          <button
            key={c}
            role="radio"
            aria-checked={color === c}
            aria-label={c}
            data-space={c}
            className={`swatch ${color === c ? "on" : ""}`}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="space-grain-control" style={{ "--space-grain": grain } as React.CSSProperties}>
        <div className="space-grain-label">
          <label htmlFor="space-grain">Grain</label>
          <output htmlFor="space-grain">{grain}%</output>
        </div>
        <input
          id="space-grain"
          type="range"
          min="0"
          max="100"
          step="1"
          value={grain}
          disabled={saving}
          onChange={(event) => setGrain(Number(event.target.value))}
          aria-valuetext={`${grain}% grain`}
        />
        <div className="space-grain-preview" data-space={color} aria-hidden="true" />
      </div>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <div className="sheet-acts">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary" disabled={!name.trim() || saving} onClick={() => void save()}>
          {saving ? "Saving…" : space ? "Save" : "Create"}
        </button>
      </div>
    </NativeDialog>
  );
}
