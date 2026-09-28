import { useEffect, useRef, useState, type RefObject, type PointerEvent } from "react";
import type { SpaceTheme } from "@aux/contracts/spaces";
import { bridge } from "../bridge";
import { isScrimOverlay } from "../chrome";
import { useStore } from "../store";
import { SPACE_COLORS, spaceThemeColor, type Space, type SpaceColor } from "../workspace";
import { Dialog } from "../ui";

const PRESET_HUE: Record<SpaceColor, number> = {
  blue: 250,
  violet: 295,
  pink: 350,
  orange: 55,
  green: 150,
  teal: 195,
  slate: 250,
};

export default function SpaceEditor({
  space,
  onSave,
  onClose,
  returnFocus,
}: {
  space: Space | null;
  onSave: (name: string, color: SpaceColor, grain: number, theme: SpaceTheme | null) => Promise<void>;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement | null>;
}) {
  const [name, setName] = useState(space?.name ?? "");
  const [color, setColor] = useState<SpaceColor>(space?.color ?? "violet");
  const [grain, setGrain] = useState(space?.grain ?? 0);
  const [custom, setCustom] = useState(!!space?.theme);
  const [theme, setTheme] = useState<SpaceTheme>(
    space?.theme ?? { hue: 295, lightness: 55, intensity: 65, inverted: false },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave(name.trim(), color, grain, custom ? theme : null);
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
  const changeTheme = (patch: Partial<SpaceTheme>) => {
    setCustom(true);
    setTheme((current) => ({ ...current, ...patch }));
  };
  const movePad = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    changeTheme({
      hue: Math.min(359, Math.max(0, Math.round(((event.clientX - rect.left) / rect.width) * 359))),
      lightness: Math.min(80, Math.max(20, Math.round(80 - ((event.clientY - rect.top) / rect.height) * 60))),
    });
  };
  const reset = () => {
    setColor("violet");
    setGrain(0);
    setTheme({ hue: 295, lightness: 55, intensity: 65, inverted: false });
    setCustom(false);
  };
  return (
    <Dialog
      label={space ? "Edit space" : "New space"}
      onClose={onClose}
      returnFocus={returnFocus ?? previous}
      className="aux-dialog-surface pop-in"
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
            aria-checked={!custom && color === c}
            aria-label={c}
            data-space={c}
            className={`swatch ${!custom && color === c ? "on" : ""}`}
            onClick={() => {
              setColor(c);
              setTheme((current) => ({ ...current, hue: PRESET_HUE[c], intensity: c === "slate" ? 8 : 65 }));
              setCustom(false);
            }}
          />
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          aria-label="Custom color"
          className={`swatch ${custom ? "on" : ""}`}
          style={{ "--space-color": spaceThemeColor(theme) } as React.CSSProperties}
          onClick={() => setCustom(true)}
        />
      </div>
      <div
        className="space-theme-controls"
        style={{ "--space-color": spaceThemeColor(theme) } as React.CSSProperties}
      >
        <button
          type="button"
          className="space-color-pad"
          aria-label="Color pad"
          title="Choose hue and lightness"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            movePad(event);
          }}
          onPointerMove={(event) => {
            if (event.buttons) movePad(event);
          }}
        >
          <span
            className="space-color-cursor"
            style={{ left: `${(theme.hue / 359) * 100}%`, top: `${((80 - theme.lightness) / 60) * 100}%` }}
          />
        </button>
        <label>
          Color dial{" "}
          <input
            aria-label="Color dial"
            type="range"
            min="0"
            max="359"
            value={theme.hue}
            onChange={(event) => changeTheme({ hue: Number(event.target.value) })}
          />
        </label>
        <label>
          Lightness{" "}
          <input
            aria-label="Lightness"
            type="range"
            min="20"
            max="80"
            value={theme.lightness}
            onChange={(event) => changeTheme({ lightness: Number(event.target.value) })}
          />
        </label>
        <label>
          Intensity{" "}
          <input
            aria-label="Intensity"
            type="range"
            min="0"
            max="100"
            value={theme.intensity}
            onChange={(event) => changeTheme({ intensity: Number(event.target.value) })}
          />
        </label>
        <label className="space-theme-invert">
          <input
            type="checkbox"
            checked={theme.inverted}
            onChange={(event) => changeTheme({ inverted: event.target.checked })}
          />{" "}
          Invert lightness
        </label>
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
        <div
          className="space-grain-preview"
          data-space={color}
          style={custom ? ({ "--space-color": spaceThemeColor(theme) } as React.CSSProperties) : undefined}
          aria-hidden="true"
        />
        <div className="space-theme-actions">
          <button
            type="button"
            className="btn"
            onClick={() => setGrain((value) => (value >= 100 ? 0 : Math.min(100, value + 25)))}
          >
            Cycle grain
          </button>
          <button type="button" className="btn" onClick={reset}>
            Reset theme
          </button>
        </div>
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
    </Dialog>
  );
}
