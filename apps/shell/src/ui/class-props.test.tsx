// @vitest-environment jsdom
import { act, type ComponentPropsWithRef, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { staticHintProps, staticRowProps } from "./class-props";

const actEnvironment = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT");
beforeAll(() => {
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    value: true,
    writable: true,
    configurable: true,
  });
});
afterAll(() => {
  if (actEnvironment) Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", actEnvironment);
  else delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
});

describe("closed static hint and row attributes", () => {
  it("retains fresh props, exact key order, original ref and callback identities", () => {
    const onClick = () => {};
    const ref = () => {};
    for (const attributes of [staticHintProps, staticRowProps]) {
      const original: ReactElement<ComponentPropsWithRef<"button">> = (
        <button
          id="original"
          className={attributes.className}
          disabled={false}
          ref={ref}
          onClick={onClick}
          key="original-key"
        >
          Retry
        </button>
      );
      const result: ReactElement<ComponentPropsWithRef<"button">> = (
        <button id="original" {...attributes} disabled={false} ref={ref} onClick={onClick} key="original-key">
          Retry
        </button>
      );
      expect(Object.isFrozen(attributes)).toBe(true);
      expect(result.props).not.toBe(original.props);
      expect(Object.keys(result.props)).toEqual(Object.keys(original.props));
      expect(result.props).toEqual(original.props);
      expect(result.key).toBe(original.key);
      expect(result.type).toBe(original.type);
      expect(result.props.ref).toBe(ref);
      expect(result.props.onClick).toBe(onClick);
    }
  });

  it("keeps surrounding evaluations and later overwrite precedence", () => {
    const calls: string[] = [];
    const read = (value: string) => {
      calls.push(value);
      return value;
    };
    const later: Record<string, unknown> = {
      get className() {
        return read("later-class");
      },
    };
    const original = { id: read("before"), className: "hint", title: read("after"), ...later };
    const originalCalls = calls.splice(0);
    const result = { id: read("before"), ...staticHintProps, title: read("after"), ...later };
    expect(calls).toEqual(originalCalls);
    expect(result).toEqual(original);
    expect(Object.keys(result)).toEqual(Object.keys(original));
  });

  it("keeps actual mounted button focus, disabled refusal, ref and original native event", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    let original: HTMLButtonElement | null = null;
    const events: Event[] = [];
    const render = (disabled: boolean) => (
      <button
        {...staticRowProps}
        ref={(node) => {
          original = node;
        }}
        disabled={disabled}
        onClick={(event) => {
          events.push(event.nativeEvent);
        }}
      >
        Retry
      </button>
    );
    try {
      await act(async () => {
        root.render(render(false));
      });
      const button = host.querySelector("button")!;
      expect(original).toBe(button);
      expect(button.className).toBe("row");
      button.focus();
      expect(document.activeElement).toBe(button);
      const event = new MouseEvent("click", { bubbles: true });
      await act(async () => {
        button.dispatchEvent(event);
      });
      expect(events).toEqual([event]);
      await act(async () => {
        root.render(render(true));
      });
      expect(original).toBe(button);
      await act(async () => {
        button.click();
      });
      expect(events).toEqual([event]);
      expect(button.textContent).toBe("Retry");
    } finally {
      await act(async () => {
        root.unmount();
      });
      host.remove();
    }
  });
});
