// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { collectSettingsFields } from "../search";
import { GeneralSettings } from "./General";

vi.mock("../../use-feature", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../use-feature")>()),
  useFeature: () => true,
}));

it("keeps General fields indexed and opens an editor after extraction", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const saved = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => {
      saved.set(key, value);
    },
  });
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
    expect(container.querySelector<HTMLSelectElement>('[aria-label="New tab mode"]')!.value).toBe("ask");
    const fields = collectSettingsFields(container);
    expect(fields.filter((field) => field.category === "General").map((field) => field.label)).toEqual(
      expect.arrayContaining([
        "Search engine",
        "New tab mode",
        "Memory saver",
        "Download folder",
        "About Aux",
        "Spell check",
        "On startup",
        "Languages",
        "Automatic picture in picture",
        "Keep Aux running in the background",
        "Keyword engines",
        "Task data backup",
      ]),
    );
    const manage = container.querySelector<HTMLButtonElement>('[aria-label="Manage keyword engines"]')!;
    await act(async () => manage.click());
    expect(onOpenEditor).toHaveBeenCalledWith("Keyword engines", manage);
    await act(async () => root.render(<GeneralSettings {...props} subview="Keyword engines" />));
    expect(
      container.querySelector<HTMLElement>('[aria-label="Keyword engines"].settings-editor-view')?.hidden,
    ).toBe(false);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});

it.each([
  { active: false, searching: false, subview: null },
  { active: true, searching: true, subview: null },
  { active: true, searching: false, subview: "Task data backup" },
])("keeps diagnostics indexed without admitting live actions: %j", async (state) => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div"),
    root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <GeneralSettings
          {...state}
          settings={{}}
          onSave={vi.fn(async () => true)}
          onOpenEditor={vi.fn()}
          editorViews={{ current: new Map() }}
          refreshVersion={0}
          onIndexChange={vi.fn()}
        />,
      ),
    );
    expect(collectSettingsFields(container).map((field) => field.label)).toEqual(
      expect.arrayContaining(["Browser health", "Support report"]),
    );
    expect(
      container.querySelector<HTMLButtonElement>('[data-command-id="export-support-report"]')!.disabled,
    ).toBe(true);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
