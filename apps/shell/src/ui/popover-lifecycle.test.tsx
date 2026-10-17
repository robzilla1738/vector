// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { Popover } from "./popover";

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
afterEach(() => document.body.replaceChildren());

async function mount(element: React.ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(element));
  return {
    host,
    root,
    dispose: async () => {
      await act(async () => root.unmount());
      host.remove();
    },
  };
}
const dialog = (label: string) => document.querySelector<HTMLDialogElement>(`dialog[aria-label="${label}"]`)!;
const escape = async (panel: HTMLDialogElement, isComposing = false) =>
  act(async () => {
    panel.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true, isComposing }),
    );
  });

it("closes only the nested picker on Escape and restores each original trigger", async () => {
  const view = await mount(
    <Popover label="Context" trigger="Context">
      {() => (
        <Popover label="Tabs" trigger="Add tabs">
          {() => <input aria-label="Find tabs" />}
        </Popover>
      )}
    </Popover>,
  );
  try {
    const outer = view.host.querySelector<HTMLButtonElement>("button")!;
    await act(async () => outer.click());
    expect(dialog("Context").classList.contains("aux-stage-dialog")).toBe(false);
    const inner = dialog("Context").querySelector<HTMLButtonElement>("button")!;
    await act(async () => inner.click());
    expect(document.activeElement).toBe(dialog("Tabs").querySelector("input"));
    await escape(dialog("Tabs"));
    expect(dialog("Tabs")).toBeNull();
    expect(dialog("Context")).toBeTruthy();
    expect(document.activeElement).toBe(inner);
    await escape(dialog("Context"));
    expect(document.activeElement).toBe(outer);
  } finally {
    await view.dispose();
  }
});

it("does not close during IME Escape; native cancel closes and restores focus", async () => {
  const view = await mount(
    <Popover label="Context" trigger="Context">
      {() => <input />}
    </Popover>,
  );
  try {
    const trigger = view.host.querySelector<HTMLButtonElement>("button")!;
    await act(async () => trigger.click());
    await escape(dialog("Context"), true);
    expect(dialog("Context")).toBeTruthy();
    await act(async () =>
      dialog("Context").dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true })),
    );
    expect(dialog("Context")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  } finally {
    await view.dispose();
  }
});

it("disabling an open picker closes it without focusing its unavailable trigger", async () => {
  const content = (disabled: boolean) => (
    <Popover disabled={disabled} label="Context" trigger="Context">
      {() => <input />}
    </Popover>
  );
  const view = await mount(content(false));
  try {
    const trigger = view.host.querySelector<HTMLButtonElement>("button")!;
    await act(async () => trigger.click());
    await act(async () => view.root.render(content(true)));
    expect(dialog("Context")).toBeNull();
    expect(trigger.disabled).toBe(true);
    expect(document.activeElement).not.toBe(trigger);
  } finally {
    await view.dispose();
  }
});

it("an action initiated in the portal survives closing without losing the parent draft", async () => {
  let finish!: () => void;
  const completion = new Promise<void>((resolve) => {
    finish = resolve;
  });
  function Composer() {
    const [draft, setDraft] = useState("Keep my draft");
    const [attached, setAttached] = useState(false);
    return (
      <>
        <textarea aria-label="Draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Popover label="Context" trigger="Context">
          {(close) => (
            <button
              onClick={() => {
                close();
                void completion.then(() => setAttached(true));
              }}
            >
              Attach file
            </button>
          )}
        </Popover>
        <output>{attached ? "Attached" : "No attachment"}</output>
      </>
    );
  }
  const view = await mount(<Composer />);
  try {
    await act(async () => view.host.querySelector<HTMLButtonElement>("button")!.click());
    await act(async () => dialog("Context").querySelector<HTMLButtonElement>("button")!.click());
    expect(dialog("Context")).toBeNull();
    await act(async () => {
      finish();
      await completion;
    });
    expect(view.host.querySelector("output")!.textContent).toBe("Attached");
    expect(view.host.querySelector("textarea")!.value).toBe("Keep my draft");
  } finally {
    await view.dispose();
  }
});
