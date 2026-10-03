// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ActionMenu, DetailPane, ListRow } from "./index";
const originalScroll = HTMLElement.prototype.scrollIntoView;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  if (originalScroll) HTMLElement.prototype.scrollIntoView = originalScroll;
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("optional refs expose the original row and detail buttons with their original events and retire on unmount", async () => {
  const openRef = vi.fn(),
    closeRef = vi.fn(),
    open = vi.fn(),
    close = vi.fn();
  await act(async () =>
    root.render(
      <>
        <ListRow title="Original page" onOpen={open} openRef={openRef} />
        <DetailPane title="Original detail" onClose={close} closeRef={closeRef}>
          Body
        </DetailPane>
      </>,
    ),
  );
  const row = host.querySelector<HTMLButtonElement>(".ui-list-open")!,
    detail = host.querySelector<HTMLButtonElement>(".ui-detail-actions button")!;
  expect(openRef).toHaveBeenLastCalledWith(row);
  expect(closeRef).toHaveBeenLastCalledWith(detail);
  const first = new MouseEvent("click", { bubbles: true }),
    second = new MouseEvent("click", { bubbles: true });
  await act(async () => {
    row.dispatchEvent(first);
    detail.dispatchEvent(second);
  });
  expect(open.mock.calls[0]?.[0].nativeEvent).toBe(first);
  expect(close.mock.calls[0]?.[0].nativeEvent).toBe(second);
  await act(async () => root.render(null));
  expect(openRef.mock.calls.at(-1)?.[0]).toBeNull();
  expect(closeRef.mock.calls.at(-1)?.[0]).toBeNull();
});
it("owned trigger activation preserves ArrowUp last-item focus, original item event, Escape and trigger return focus", async () => {
  let activate = () => {};
  const triggerRef = vi.fn(),
    itemRef = vi.fn(),
    selected = vi.fn(),
    inputs: Event[] = [];
  await act(async () =>
    root.render(
      <ActionMenu
        label="Original actions"
        triggerControl={(node, action) => {
          triggerRef(node);
          activate = action;
        }}
        onTrigger={(event) => {
          inputs.push(event.nativeEvent);
          activate();
        }}
        actions={[
          { label: "First", onSelect: () => {} },
          { label: "Last", controlRef: itemRef, onSelect: selected },
        ]}
      />,
    ),
  );
  const trigger = host.querySelector<HTMLButtonElement>("button")!;
  trigger.focus();
  const up = new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true });
  await act(async () => trigger.dispatchEvent(up));
  const last = document.querySelector<HTMLButtonElement>('[role="menuitem"]:last-child')!;
  expect(inputs).toEqual([up]);
  expect(itemRef).toHaveBeenLastCalledWith(last);
  expect(document.activeElement).toBe(last);
  const click = new MouseEvent("click", { bubbles: true });
  await act(async () => last.dispatchEvent(click));
  expect(selected.mock.calls[0]?.[0].nativeEvent).toBe(click);
  expect(itemRef.mock.calls.at(-1)?.[0]).toBeNull();
  expect(document.activeElement).toBe(trigger);
  await act(async () => trigger.click());
  await act(async () =>
    document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    ),
  );
  expect(document.querySelector('[role="menuitem"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  await act(async () => root.render(null));
  expect(triggerRef).toHaveBeenLastCalledWith(null);
});
