// @vitest-environment jsdom
import { act, createElement, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  nativeAlertRoleProps,
  nativeMenuItemRoleProps,
  nativeGroupRoleProps,
  nativeStatusRoleProps,
  nativePoliteLiveProps,
  nativeCheckboxTypeProps,
  nativeNumberTypeProps,
  nativeAutocompleteOffProps,
} from "./native-attribute-props";
const environment = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT");
beforeAll(() =>
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    value: true,
    writable: true,
    configurable: true,
  }),
);
afterAll(() => {
  if (environment) Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", environment);
  else Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT");
});
const cases = [
  [nativeAlertRoleProps, "role", "alert"],
  [nativeMenuItemRoleProps, "role", "menuitem"],
  [nativeGroupRoleProps, "role", "group"],
  [nativeStatusRoleProps, "role", "status"],
  [nativePoliteLiveProps, "aria-live", "polite"],
  [nativeCheckboxTypeProps, "type", "checkbox"],
  [nativeNumberTypeProps, "type", "number"],
  [nativeAutocompleteOffProps, "autoComplete", "off"],
] as const;
describe("closed native attribute roles and inputs", () => {
  it("preserves each own data value, fresh props, ref/key and surrounding evaluation order", () => {
    const ref = createRef<HTMLInputElement>(),
      onClick = () => {};
    for (const [record, key, value] of cases) {
      expect(Reflect.ownKeys(record)).toEqual([key]);
      expect(Object.getOwnPropertyDescriptor(record, key)).toEqual({
        value,
        writable: false,
        enumerable: true,
        configurable: false,
      });
      expect(Object.isFrozen(record)).toBe(true);
      const calls: string[] = [],
        read = (value: string) => {
          calls.push(value);
          return value;
        };
      const later: Record<string, unknown> = {
        get title() {
          return read("override");
        },
      };
      const literal = createElement("input", {
        id: read("before"),
        [key]: value,
        title: read("after"),
        ...later,
        ref,
        onClick,
        key: "original",
      });
      const order = calls.splice(0);
      const result = createElement("input", {
        id: read("before"),
        ...record,
        title: read("after"),
        ...later,
        ref,
        onClick,
        key: "original",
      });
      expect(calls).toEqual(order);
      expect(result.props).not.toBe(literal.props);
      expect(Reflect.ownKeys(result.props)).toEqual(Reflect.ownKeys(literal.props));
      expect(result.props).toEqual(literal.props);
      expect(result.key).toBe(literal.key);
      expect((result.props as { ref?: unknown }).ref).toBe(ref);
      expect(result.props.onClick).toBe(onClick);
    }
  });
  it("retains actual announcements, checkbox native events and number bounds/focus", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host),
      checkbox = createRef<HTMLInputElement>(),
      number = createRef<HTMLInputElement>(),
      events: Event[] = [];
    try {
      await act(async () =>
        root.render(
          <section {...nativeGroupRoleProps} aria-label="Original controls">
            <p {...nativeAlertRoleProps}>Complete original error</p>
            <p {...nativeStatusRoleProps} {...nativePoliteLiveProps}>
              Current status
            </p>
            <button {...nativeMenuItemRoleProps}>Original action</button>
            <input
              {...nativeCheckboxTypeProps}
              ref={checkbox}
              onChange={(event) => events.push(event.nativeEvent)}
            />
            <input
              {...nativeNumberTypeProps}
              {...nativeAutocompleteOffProps}
              ref={number}
              min={1}
              max={10}
              defaultValue={4}
            />
          </section>,
        ),
      );
      expect(host.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Original controls");
      expect(host.querySelector('[role="alert"]')?.textContent).toBe("Complete original error");
      expect(host.querySelector('[role="status"]')?.getAttribute("aria-live")).toBe("polite");
      expect(host.querySelector('[role="menuitem"]')?.textContent).toBe("Original action");
      const click = new MouseEvent("click", { bubbles: true });
      await act(async () => {
        checkbox.current!.dispatchEvent(click);
      });
      expect(checkbox.current!.checked).toBe(true);
      expect(events).toEqual([click]);
      number.current!.focus();
      expect(document.activeElement).toBe(number.current);
      expect(number.current!.type).toBe("number");
      expect(number.current!.autocomplete).toBe("off");
      expect(number.current!.value).toBe("4");
      number.current!.value = "11";
      expect(number.current!.validity.rangeOverflow).toBe(true);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  });
});
