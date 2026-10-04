import { useState } from "react";
import type { ShortcutOverrides } from "@aux/contracts";
import { LayoutChoice } from "../../components/LayoutChoice";
import { ShortcutsSetting } from "../../components/ShortcutsSetting";
import { WebsiteSizes } from "../../components/WebsiteSizes";
import { UI_FONT_SIZES, readUiFontSize, writeUiFontSize, type UiFontSize } from "../../ui-font-size";
import { SettingsField, SettingsSection } from "../primitives";
import { DefaultPageZoomSetting } from "./DefaultPageZoom";
import { SidebarOptions } from "./SidebarOptions";

function activateRadioOnArrow(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  const radios = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')].filter(
    (radio) => !radio.disabled,
  );
  const index = radios.indexOf(event.target as HTMLButtonElement);
  if (index < 0 || !radios.length) return;
  event.preventDefault();
  const backwards = event.key === "ArrowLeft" || event.key === "ArrowUp";
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? radios.length - 1
        : (index + (backwards ? -1 : 1) + radios.length) % radios.length;
  radios[next]?.focus();
  radios[next]?.click();
}

export function AppearanceSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const [uiFont, setUiFont] = useState<UiFontSize>(readUiFontSize);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const theme = (settings.theme as string) ?? "dark";
  const set = onSave;
  return (
    <SettingsSection name="Appearance" className="appearance-preferences" hidden={!active}>
      <SettingsField compact label="Theme" description="Use light, dark or the system appearance.">
        <div className="seg" role="radiogroup" aria-label="Theme" onKeyDown={activateRadioOnArrow}>
          {(["system", "dark", "light"] as const).map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={theme === t}
              tabIndex={theme === t ? 0 : -1}
              className={theme === t ? "on" : ""}
              onClick={() => void set({ theme: t })}
            >
              {t === "system" ? "System" : t === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>
      </SettingsField>

      <SettingsField
        compact
        label="Interface text"
        hint="Shell type size only. Does not change website zoom or the html root font size."
      >
        <div className="seg" role="radiogroup" aria-label="Interface text" onKeyDown={activateRadioOnArrow}>
          {UI_FONT_SIZES.map((size) => (
            <button
              key={size}
              role="radio"
              aria-checked={uiFont === size}
              tabIndex={uiFont === size ? 0 : -1}
              className={uiFont === size ? "on" : ""}
              onClick={() => {
                writeUiFontSize(size);
                setUiFont(size);
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </SettingsField>

      <SettingsField
        compact
        label="Sidebar appearance"
        hint="Translucent lets your desktop show through the sidebar. Reduce Transparency uses solid surfaces."
      >
        <select
          aria-label="Sidebar appearance"
          value={String(settings.sidebarAppearance ?? "translucent")}
          onChange={(e) => void set({ sidebarAppearance: e.target.value })}
        >
          <option value="translucent">Translucent</option>
          <option value="solid">Solid</option>
        </select>
      </SettingsField>
      <SettingsField
        compact
        label="Native material"
        hint="Liquid Glass uses macOS Tahoe’s native material, with a title-bar fallback on older macOS. Browser previews cannot show native blur."
      >
        <select
          aria-label="Native material"
          disabled={settings.sidebarAppearance === "solid"}
          value={String(settings.sidebarMaterial ?? "liquid-glass")}
          onChange={(e) => void set({ sidebarMaterial: e.target.value })}
        >
          <option value="liquid-glass">Liquid Glass</option>
          <option value="titlebar">Title bar</option>
          <option value="sidebar">Sidebar</option>
          <option value="under-window">Under window</option>
        </select>
      </SettingsField>
      <SettingsField
        compact
        label="Sidebar tint"
        hint="Adds theme-colored opacity over the native blur without fading text or weakening the blur."
      >
        <select
          aria-label="Sidebar tint"
          disabled={settings.sidebarAppearance === "solid"}
          value={Number(settings.sidebarTint ?? 0)}
          onChange={(e) => void set({ sidebarTint: Number(e.target.value) })}
        >
          {[0, 10, 20, 30, 40, 50, 60].map((value) => (
            <option key={value} value={value}>
              {value}%
            </option>
          ))}
        </select>
      </SettingsField>
      <SettingsField
        compact
        label="Content opacity"
        hint="Keeps chats and the new-tab surface separate from the glass sidebar. Websites remain opaque."
      >
        <select
          aria-label="Content opacity"
          disabled={settings.sidebarAppearance === "solid"}
          value={Number(settings.contentOpacity ?? 95)}
          onChange={(e) => void set({ contentOpacity: Number(e.target.value) })}
        >
          {[80, 85, 90, 95, 100].map((value) => (
            <option key={value} value={value}>
              {value}%
            </option>
          ))}
        </select>
      </SettingsField>
      <SettingsField
        compact
        label="Glass defaults"
        hint="Restore the native glass material, clear sidebar tint and 95% content opacity."
      >
        <button
          className="btn sm"
          onClick={() =>
            void set({
              sidebarAppearance: "translucent",
              sidebarMaterial: "liquid-glass",
              sidebarTint: 0,
              contentOpacity: 95,
            })
          }
        >
          Reset glass appearance
        </button>
      </SettingsField>
      <SettingsField
        compact
        label="Tab layout"
        hint="Both layouts use the same tabs, folders, and current selection."
      >
        <LayoutChoice
          value={String(settings.tabLayout ?? "horizontal")}
          onChange={(tabLayout) => void set({ tabLayout })}
        />
      </SettingsField>
      <SidebarOptions />
      <SettingsField compact label="Tab switcher order" hint="Control-Tab follows the sidebar or recently used tabs in this space.">
        <select aria-label="Tab switcher order" value={String(settings.tabSwitcherOrder ?? "sidebar")}
          onChange={event => void set({ tabSwitcherOrder: event.target.value })}>
          <option value="sidebar">Sidebar order</option>
          <option value="recently-used">Recently used</option>
        </select>
      </SettingsField>
      <SettingsField label="Website sizes">
        <WebsiteSizes />
      </SettingsField>
      <SettingsField label="Default page zoom" hint="Page size for websites without a saved site-specific zoom. Existing site sizes stay as chosen.">
        <DefaultPageZoomSetting active={active} />
      </SettingsField>
      <SettingsField label="Keyboard shortcuts" hint="Change browser and app shortcuts. Collisions are explained before saving.">
        <button className="btn sm ghost" aria-expanded={showShortcuts} onClick={() => setShowShortcuts(value => !value)}>
          {showShortcuts ? "Hide shortcuts" : "Manage shortcuts"}
        </button>
        {showShortcuts && <ShortcutsSetting
          active={active}
          value={(settings.shortcutOverrides as ShortcutOverrides | undefined) ?? {}}
          onSave={(shortcutOverrides) => onSave({ shortcutOverrides })}
        />}
      </SettingsField>
    </SettingsSection>
  );
}
