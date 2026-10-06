// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { searchSettings } from "../settings-search";
import { SettingsField } from "./primitives";
import { collectSettingsFields, searchSettingsIndex } from "./search";

it("normalizes accents, requires every token, and ranks field names above description matches", () => {
  const items = [
    { category: "General", label: "Other", description: "Café calendar preferences" },
    { category: "Connections", label: "Café Calendar", description: "Connect an account" },
    { category: "Connections", label: "Calendar", description: "No matching accent" },
  ];
  expect(searchSettingsIndex(items, "cafe calendar")).toEqual([items[1], items[0]]);
});

it("caps results and exposes implemented Calendar and Plugins destinations", () => {
  const items = Array.from({ length: 20 }, (_, index) => ({
    category: "General",
    label: `Option ${index}`,
    description: "setting",
  }));
  expect(searchSettingsIndex(items, "option")).toHaveLength(12);
  expect(searchSettings("calendar").some((item) => item.label === "Google Calendar")).toBe(true);
  expect(searchSettings("plugins").some((item) => item.label === "Plugins")).toBe(true);
});

it("indexes the rendered field props and uses them in search", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <section data-settings-section="Appearance">
          <SettingsField label="Theme" description="Appearance mode" searchTerms={["color", "contrast"]}>
            <button>Dark</button>
          </SettingsField>
        </section>,
      ),
    );
    const fields = collectSettingsFields(container);
    expect(fields).toEqual([
      {
        category: "Appearance",
        label: "Theme",
        description: "Appearance mode",
        target: "Theme",
        searchTerms: ["color", "contrast"],
      },
    ]);
    expect(searchSettings("contrast", fields)).toEqual(fields);
    expect(searchSettings("theme", fields).filter((item) => item.label === "Theme")).toHaveLength(1);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
