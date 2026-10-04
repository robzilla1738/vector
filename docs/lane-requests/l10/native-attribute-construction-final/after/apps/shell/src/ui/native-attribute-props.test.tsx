// @vitest-environment jsdom
import { createElement, createRef, type MouseEvent } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { nativeAriaHiddenProps, nativeButtonTypeProps } from "./native-attribute-props";

const originalActEnvironment = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT");
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterAll(() => {
  if (originalActEnvironment)
    Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", originalActEnvironment);
  else Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT");
});
let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

describe("closed native attribute construction", () => {
  it("retains literal values in frozen own data records", () => {
    for (const [record, key, value] of [
      [nativeButtonTypeProps, "type", "button"],
      [nativeAriaHiddenProps, "aria-hidden", "true"],
    ] as const) {
      expect(Reflect.ownKeys(record)).toEqual([key]);
      expect(Object.isFrozen(record)).toBe(true);
      expect(Object.getOwnPropertyDescriptor(record, key)).toEqual({
        value,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
  });

  it("still creates fresh native props with the original key and property order", () => {
    const ref = createRef<HTMLButtonElement>();
    const literal = createElement("button", {
      key: "original",
      ref,
      title: "Before",
      type: "button",
      disabled: true,
    });
    const spread = createElement("button", {
      key: "original",
      ref,
      title: "Before",
      ...nativeButtonTypeProps,
      disabled: true,
    });
    const fresh = createElement("button", {
      key: "original",
      ref,
      title: "Before",
      ...nativeButtonTypeProps,
      disabled: true,
    });
    expect(spread.key).toBe(literal.key);
    expect(spread.props).toEqual(literal.props);
    expect(Reflect.ownKeys(spread.props)).toEqual(Reflect.ownKeys(literal.props));
    expect(fresh.props).not.toBe(spread.props);
    expect(spread.props.ref).toBe(ref);
  });

  it("retains native button form behavior, original event/ref and hidden literal", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    cleanup = () => {
      act(() => root.unmount());
      host.remove();
      cleanup = undefined;
    };
    const literalRef = createRef<HTMLButtonElement>(),
      spreadRef = createRef<HTMLButtonElement>();
    const events: MouseEvent<HTMLButtonElement>[] = [];
    let submissions = 0;
    await act(async () =>
      root.render(
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submissions++;
          }}
        >
          <button key="literal" ref={literalRef} type="button" onClick={(event) => events.push(event)}>
            Literal
          </button>
          <button
            key="spread"
            ref={spreadRef}
            {...nativeButtonTypeProps}
            onClick={(event) => events.push(event)}
          >
            Spread
          </button>
          <span aria-hidden="true">Original hidden</span>
          <span {...nativeAriaHiddenProps}>Spread hidden</span>
          <button type="submit">Submit</button>
        </form>,
      ),
    );
    const literal = literalRef.current!,
      spread = spreadRef.current!;
    await act(async () => {
      literal.click();
      spread.click();
    });
    expect(submissions).toBe(0);
    expect(events.map((event) => event.target)).toEqual([literal, spread]);
    expect(events.map((event) => event.nativeEvent.target)).toEqual([literal, spread]);
    spread.focus();
    expect(document.activeElement).toBe(spread);
    expect(spread.type).toBe(literal.type);
    expect([...host.querySelectorAll("span")].map((node) => node.getAttribute("aria-hidden"))).toEqual([
      "true",
      "true",
    ]);
    await act(async () => host.querySelector<HTMLButtonElement>('[type="submit"]')!.click());
    expect(submissions).toBe(1);
    await act(async () =>
      root.render(
        <button {...nativeButtonTypeProps} disabled onClick={() => submissions++}>
          Disabled
        </button>,
      ),
    );
    await act(async () => host.querySelector("button")!.click());
    expect(submissions).toBe(1);
  });
});
