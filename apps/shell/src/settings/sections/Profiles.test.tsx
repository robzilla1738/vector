// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { collectSettingsFields } from "../search";
import { ProfilesSettings } from "./Profiles";

it("indexes the routed Profile manager", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<ProfilesSettings />));
    expect(collectSettingsFields(container)).toEqual(
      expect.arrayContaining([expect.objectContaining({ category: "Profiles", label: "Browser profiles" })]),
    );
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
