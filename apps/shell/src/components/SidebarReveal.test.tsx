// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
const fixture = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock("../commands", () => ({ runCommand: fixture.run }));
import { SidebarReveal, type SidebarRevealProps } from "./SidebarReveal";

it("keeps a focused registered reveal action outside the inert hidden toolbar", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const props: SidebarRevealProps = {
    minimal: false,
    horizontal: false,
    hidden: true,
    toolbarHidden: true,
    peek: false,
  };
  act(() =>
    root.render(
      <>
        <header inert aria-hidden>
          <button>Hidden toolbar</button>
        </header>
        <SidebarReveal {...props} />
      </>,
    ),
  );
  const button = container.querySelector<HTMLButtonElement>('[aria-label="Show sidebar"]')!;
  expect(button.closest("[inert]")).toBeNull();
  expect(button.dataset.commandId).toBe("sidebar");
  button.focus();
  expect(document.activeElement).toBe(button);
  act(() => button.click());
  expect(fixture.run).toHaveBeenCalledWith("sidebar");
  for (const change of [
    { minimal: true },
    { horizontal: true },
    { hidden: false },
    { toolbarHidden: false },
    { peek: true },
  ]) {
    act(() => root.render(<SidebarReveal {...props} {...change} />));
    expect(container.querySelector('[aria-label="Show sidebar"]')).toBeNull();
  }
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
