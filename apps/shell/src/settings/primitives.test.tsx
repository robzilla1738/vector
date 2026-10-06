// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { SettingsField } from "./primitives";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("displays the original policy description and joins it to its labelled control group", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const description =
    "Block third-party cookies in the regular Profile. This can affect embedded sign-ins and widgets; existing cookies are kept.";
  try {
    await act(async () =>
      root.render(
        <SettingsField label="Cookies" description={description}>
          <button>Choose policy</button>
        </SettingsField>,
      ),
    );
    const group = host.querySelector('[role="group"]')!;
    const supportingText = host.querySelector(".hint")!;
    expect(supportingText.textContent).toBe(description);
    expect(group.getAttribute("aria-describedby")).toBe(supportingText.id);
    expect(document.getElementById(group.getAttribute("aria-labelledby")!)?.textContent).toBe("Cookies");
    expect(group.getAttribute("data-settings-description")).toBe(description);
    expect(host.querySelector("button")?.textContent).toBe("Choose policy");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
it("preserves the original explicit rich hint once while retaining independent search description", async () => {
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <SettingsField
          label="Interface text"
          hint={
            <>
              <strong>Shell type size only.</strong> Does not change website zoom.
            </>
          }
          description="Original search terms"
        >
          <select aria-label="Interface text">
            <option>Medium</option>
          </select>
        </SettingsField>,
      ),
    );
    expect(host.querySelectorAll(".hint")).toHaveLength(1);
    expect(host.querySelector(".hint strong")?.textContent).toBe("Shell type size only.");
    expect(host.textContent).not.toContain("Original search terms");
    expect(host.querySelector('[role="group"]')?.getAttribute("data-settings-description")).toBe(
      "Original search terms",
    );
    expect(host.querySelector("select")?.getAttribute("aria-label")).toBe("Interface text");
  } finally {
    await act(async () => root.unmount());
  }
});
it("keeps empty explicit hints and fields without supporting copy free of dangling description ids", async () => {
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <>
          <SettingsField label="Explicit empty" hint="" description="Search metadata only">
            <input />
          </SettingsField>
          <SettingsField label="No copy">
            <input />
          </SettingsField>
        </>,
      ),
    );
    expect(host.querySelectorAll(".hint")).toHaveLength(0);
    for (const group of host.querySelectorAll('[role="group"]'))
      expect(group.hasAttribute("aria-describedby")).toBe(false);
    expect(host.querySelectorAll("input")).toHaveLength(2);
  } finally {
    await act(async () => root.unmount());
  }
});
