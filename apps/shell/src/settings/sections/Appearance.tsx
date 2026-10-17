import { Button, SettingsGroup } from "../../ui";
import { smallGhostButtonProps } from "../../ui/button-props";
import { useState } from "react";
import type { ShortcutOverrides } from "@aux/contracts";
import { ShortcutsSetting } from "../../components/ShortcutsSetting";
import { WebsiteSizes } from "../../components/WebsiteSizes";
import { UI_FONT_SIZES, readUiFontSize, writeUiFontSize, type UiFontSize } from "../../ui-font-size";
import { SettingsField, SettingsSection } from "../primitives";
import { DefaultPageZoomSetting } from "./DefaultPageZoom";
import { SidebarOptions } from "./SidebarOptions";
import { SettingsDialogControl } from "../SettingsDialogControl";
import { TidyTabsSetting } from "./TidyTabs";
import { bridge } from "../../bridge";
import { AppearanceChoice } from "./AppearanceChoice";

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
      <div className="settings-card">
        <SettingsField compact label="Theme" description="Choose how Aux looks.">
          <select
            aria-label="Theme"
            value={theme}
            onChange={(event) => void set({ theme: event.target.value })}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </SettingsField>
        <SettingsField
          compact
          label="Default page zoom"
          hint="Page size for websites without a saved site-specific zoom."
        >
          <DefaultPageZoomSetting active={active} />
        </SettingsField>
        <SettingsField compact label="Tab layout">
          <AppearanceChoice
            label="Tab layout"
            value={String(settings.tabLayout ?? "vertical")}
            onChange={(tabLayout) => void set({ tabLayout })}
            choices={[
              {
                value: "horizontal",
                label: "Horizontal",
                image: "/appearance/horizontal-tabs.png",
                description: "Show tabs in the top bar",
              },
              {
                value: "vertical",
                label: "Vertical",
                image: "/appearance/vertical-tabs.png",
                description: "Show tabs in the left sidebar",
              },
            ]}
          />
        </SettingsField>
        <SettingsField
          compact
          label="Sidebar appearance"
          searchTerms={["transparency", "glass", "translucent", "solid"]}
        >
          <AppearanceChoice
            label="Sidebar appearance"
            value={String(settings.sidebarAppearance ?? "translucent")}
            onChange={(sidebarAppearance) => void set({ sidebarAppearance })}
            choices={[
              {
                value: "solid",
                label: "Solid",
                image: "/appearance/solid-window.png",
                description: "Use a solid window background",
              },
              {
                value: "translucent",
                label: "Translucent",
                image: "/appearance/transparent-window.png",
                description: "Use the native glass effect. Reduce Transparency uses solid surfaces.",
              },
            ]}
          />
        </SettingsField>
      </div>

      <SettingsGroup title="Tabs & sidebar">
        <SidebarOptions active={active} settings={settings} onSave={onSave} />
        <SettingsField compact label="Tab switcher order" hint="Choose how Control-Tab moves between tabs.">
          <select
            aria-label="Tab switcher order"
            value={String(settings.tabSwitcherOrder ?? "sidebar")}
            onChange={(event) => void set({ tabSwitcherOrder: event.target.value })}
          >
            <option value="sidebar">Sidebar order</option>
            <option value="recently-used">Recently used</option>
          </select>
        </SettingsField>
        <SettingsField
          compact
          label="Customize Tidy Tabs"
          hint="Choose how AI Tidy groups and names your tabs."
        >
          <SettingsDialogControl
            active={active && !bridge.privateMode}
            label="Customize Tidy Tabs"
            action="Configure"
            showClose
          >
            {(close) => (
              <TidyTabsSetting
                active={active}
                value={String(settings.tidyPrompt ?? "")}
                onSave={(tidyPrompt) => onSave({ tidyPrompt })}
                onClose={close}
              />
            )}
          </SettingsDialogControl>
        </SettingsField>
      </SettingsGroup>

      <SettingsGroup title="Window details">
        <SettingsField compact label="Interface text" hint="Adjust the text size in Aux.">
          <select
            aria-label="Interface text"
            value={uiFont}
            onChange={(event) => {
              const size = Number(event.target.value) as UiFontSize;
              writeUiFontSize(size);
              setUiFont(size);
            }}
          >
            {UI_FONT_SIZES.map((value) => (
              <option key={value} value={value}>
                {value} px
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField
          compact
          label="Native material"
          hint="Liquid Glass uses the native macOS material, with a fallback on older versions."
        >
          <select
            aria-label="Native material"
            disabled={settings.sidebarAppearance === "solid"}
            value={String(settings.sidebarMaterial ?? "liquid-glass")}
            onChange={(event) => void set({ sidebarMaterial: event.target.value })}
          >
            <option value="liquid-glass">Liquid Glass</option>
            <option value="titlebar">Title bar</option>
            <option value="sidebar">Sidebar</option>
            <option value="under-window">Under window</option>
          </select>
        </SettingsField>
        <SettingsField compact label="Sidebar tint" hint="Add a light or dark tint over the glass.">
          <select
            aria-label="Sidebar tint"
            disabled={settings.sidebarAppearance === "solid"}
            value={Number(settings.sidebarTint ?? 0)}
            onChange={(event) => void set({ sidebarTint: Number(event.target.value) })}
          >
            {[0, 10, 20, 30, 40, 50, 60].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField compact label="Content opacity" hint="Control the opacity of chats and new tabs.">
          <select
            aria-label="Content opacity"
            disabled={settings.sidebarAppearance === "solid"}
            value={Number(settings.contentOpacity ?? 95)}
            onChange={(event) => void set({ contentOpacity: Number(event.target.value) })}
          >
            {[80, 85, 90, 95, 100].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
        </SettingsField>
        <SettingsField compact label="Glass defaults" hint="Restore clear glass and 95% content opacity.">
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
            Reset appearance
          </Button>
        </SettingsField>
      </SettingsGroup>
      <SettingsGroup title="Websites & shortcuts">
        <SettingsField label="Website sizes">
          <WebsiteSizes />
        </SettingsField>
        <SettingsField label="Keyboard shortcuts" hint="Change browser and app shortcuts.">
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
      </SettingsGroup>
    </SettingsSection>
  );
}
