// @vitest-environment jsdom
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SettingsOutline } from "./SettingsOutline";

it("routes the outline to visible mounted sections and ignores retained drafts in hidden sections", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    shellRef = createRef<HTMLElement>();
  try {
    await act(async () =>
      root.render(
        <section ref={shellRef}>
          <div className="settings-scroll">
            <section hidden>
              <h2>Hidden draft</h2>
            </section>
            <section>
              <h2>Appearance</h2>
              <h2>Typography</h2>
            </section>
          </div>
          <SettingsOutline shellRef={shellRef} />
        </section>,
      ),
    );
    const headings = host.querySelectorAll("h2"),
      buttons = host.querySelectorAll("button");
    expect([...buttons].map((button) => button.getAttribute("aria-label"))).toEqual([
      "Appearance",
      "Typography",
    ]);
    await act(async () => (buttons[1] as HTMLButtonElement).click());
    expect(document.activeElement).toBe(headings[2]);
    expect(buttons[1]?.getAttribute("aria-current")).toBe("location");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
