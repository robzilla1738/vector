// @vitest-environment jsdom
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SectionRail } from "./SectionRail";

it("shows implemented sections, gates unavailable ones, and routes connection sections", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  const onOpenCategory = vi.fn();
  try {
    await act(async () => root.render(
      <SectionRail
        category="Connections"
        connectionTab="Models"
        searching={false}
        memoryAvailable={false}
        downloadNamingAvailable={true}
        profilesAvailable={true}
        linkRoutingAvailable={true}
        appleScriptAvailable={false}
        skillsAvailable={false}
        automationsAvailable={false}
        servicesAvailable={false}
        permissionsAvailable={true}
        extensionsAvailable={false}
        firstCategory={createRef<HTMLButtonElement>()}
        onOpenCategory={onOpenCategory}
      />,
    ));
    expect(container.querySelector('button[data-category="Models"]')?.getAttribute("aria-current")).toBe("page");
    expect(container.querySelector('button[data-category="Memory"]')).toBeNull();
    await act(async () => (container.querySelector('button[data-category="Downloads"]') as HTMLButtonElement).click());
    expect(onOpenCategory).toHaveBeenCalledWith("Downloads", undefined);
    expect(container.querySelector('button[data-category="Profiles"]')).not.toBeNull();
    expect(container.querySelector('button[data-category="Extensions"]')).toBeNull();
    expect(container.querySelector('button[data-category="Link Routing"]')).not.toBeNull();
    expect(container.querySelector('button[data-category="Advanced"]')).toBeNull();
    await act(async () => (container.querySelector('button[data-category="Link Routing"]') as HTMLButtonElement).click());
    expect(onOpenCategory).toHaveBeenCalledWith("Link Routing", undefined);
    expect(container.querySelector('button[data-category="Skills & Plugins"]')).toBeNull();
    expect(container.querySelector('button[data-category="Automations"]')).toBeNull();
    expect(container.querySelector('button[data-category="Selection & Capture"]')).not.toBeNull();
    expect(container.querySelector('button[data-category="MCP & Connectors"]')).toBeNull();
    await act(async () => (container.querySelector('button[data-category="Developers & External Agents"]') as HTMLButtonElement).click());
    expect(onOpenCategory).toHaveBeenCalledWith("Connections", "Agents");
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
