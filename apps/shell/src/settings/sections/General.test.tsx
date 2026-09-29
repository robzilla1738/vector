// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { collectSettingsFields } from "../search";
import { GeneralSettings } from "./General";
import { recordMemorySaverCycle } from "../../memory-saver-report";

vi.mock("../../use-feature", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../use-feature")>(),
  useFeature: () => true,
}));

it("keeps General fields indexed and opens an editor after extraction", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const saved = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => { saved.set(key, value); } });
  const container = document.createElement("div");
  const root = createRoot(container);
  const onOpenEditor = vi.fn();
  const props = {
    active: true,
    searching: false,
    settings: {} as Record<string, unknown>,
    onSave: vi.fn(async () => true),
    onOpenEditor,
    editorViews: { current: new Map<string, HTMLElement>() },
    refreshVersion: 0,
    onIndexChange: vi.fn(),
  };
  try {
    await act(async () => root.render(<GeneralSettings {...props} subview={null} />));
    const fields = collectSettingsFields(container);
    expect(fields.filter(field => field.category === "General").map(field => field.label)).toEqual(
      expect.arrayContaining(["Search engine", "New tab mode", "Memory saver", "Download folder", "About Aux", "Spell check", "On startup", "Languages", "Automatic picture in picture", "Keep Aux running in the background", "Keyword engines", "Task data backup"]),
    );
    const saver = container.querySelector<HTMLSelectElement>('[aria-label="Memory saver"]')!;
    await act(async () => { saver.value = "1"; saver.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(props.onSave).toHaveBeenCalledWith({ memorySaverMinutes: 1 });
    await act(async () => recordMemorySaverCycle({ pageId: "fixture", url: "https://example.test/" },
      { slept: true, estimatedSavedBytes: 12 * 1024 * 1024 }));
    expect(container.querySelector('[aria-label="Memory saver cycle report"]')?.textContent)
      .toContain("About 12 MB estimated at sleep time");
    expect(container.querySelector("details")?.textContent).toContain("about 12.0 MB estimated saved");
    const manage = container.querySelector<HTMLButtonElement>('[aria-label="Manage keyword engines"]')!;
    await act(async () => manage.click());
    expect(onOpenEditor).toHaveBeenCalledWith("Keyword engines", manage);
    await act(async () => root.render(<GeneralSettings {...props} subview="Keyword engines" />));
    expect(container.querySelector<HTMLElement>('[aria-label="Keyword engines"].settings-editor-view')?.hidden).toBe(false);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
