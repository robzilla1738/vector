import { Button, Segmented } from "../../ui";
import { smallGhostButtonProps } from "../../ui/button-props";
import { useState } from "react";
import type { ShortcutOverrides } from "@aux/contracts";
import { LayoutChoice } from "../../components/LayoutChoice";
import { ShortcutsSetting } from "../../components/ShortcutsSetting";
import { WebsiteSizes } from "../../components/WebsiteSizes";
import { UI_FONT_SIZES, readUiFontSize, writeUiFontSize, type UiFontSize } from "../../ui-font-size";
import { SettingsField, SettingsSection } from "../primitives";
import { DefaultPageZoomSetting } from "./DefaultPageZoom";
import { SidebarOptions } from "./SidebarOptions";

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
        <Segmented
          label="Theme"
          value={theme}
          onChange={(theme) => void set({ theme })}
          items={[
            { value: "system", label: "System" },
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
        />
      </SettingsField>

      <SettingsField
        compact
        label="Interface text"
        hint="Shell type size only. Does not change website zoom or the html root font size."
      >
        <Segmented
          label="Interface text"
          value={uiFont}
          items={UI_FONT_SIZES.map((value) => ({ value, label: value }))}
          onChange={(size) => {
            writeUiFontSize(size);
            setUiFont(size);
          }}
        />
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
        <Button
          size={28}
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
        </Button>
      </SettingsField>
      <SettingsField
        compact
        label="Tab layout"
        hint="Both layouts use the same tabs, folders, and current selection."
      >
        <LayoutChoice
          value={String(settings.tabLayout ?? "vertical")}
          onChange={(tabLayout) => void set({ tabLayout })}
        />
      </SettingsField>
      <SidebarOptions />
      <SettingsField
        compact
        label="Tab switcher order"
        hint="Control-Tab follows the sidebar or recently used tabs in this space."
      >
        <select
          aria-label="Tab switcher order"
          value={String(settings.tabSwitcherOrder ?? "sidebar")}
          onChange={(event) => void set({ tabSwitcherOrder: event.target.value })}
        >
          <option value="sidebar">Sidebar order</option>
          <option value="recently-used">Recently used</option>
        </select>
      </SettingsField>
      <SettingsField label="Website sizes">
        <WebsiteSizes />
      </SettingsField>
      <SettingsField
        label="Default page zoom"
        hint="Page size for websites without a saved site-specific zoom. Existing site sizes stay as chosen."
      >
        <DefaultPageZoomSetting active={active} />
      </SettingsField>
      <SettingsField
        label="Keyboard shortcuts"
        hint="Change browser and app shortcuts. Collisions are explained before saving."
      >
        <button
          {...smallGhostButtonProps}
          aria-expanded={showShortcuts}
          onClick={() => setShowShortcuts((value) => !value)}
        >
          {showShortcuts ? "Hide shortcuts" : "Manage shortcuts"}
        </button>
        {showShortcuts && (
          <ShortcutsSetting
            active={active}
            value={(settings.shortcutOverrides as ShortcutOverrides | undefined) ?? {}}
            onSave={(shortcutOverrides) => onSave({ shortcutOverrides })}
          />
        )}
      </SettingsField>
    </SettingsSection>
  );
}
