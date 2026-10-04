import { expect, it } from "vitest";
import { errorMessage } from "./error-message";

it("preserves original conversion order, getter/toString effects and thrown identities", () => {
  const original = (reason: unknown) => (reason instanceof Error ? reason.message : String(reason));
  const thrown = { original: "conversion failure" };
  const factories = [
    (events: string[]) =>
      Object.defineProperty(new Error(), "message", {
        get() {
          events.push("message");
          return 777;
        },
      }),
    (events: string[]) =>
      Object.defineProperty(new Error(), "message", {
        get() {
          events.push("message");
          return undefined;
        },
      }),
    (events: string[]) =>
      Object.defineProperty(new Error(), "message", {
        get() {
          events.push("message");
          return "original details";
        },
      }),
    (events: string[]) =>
      Object.defineProperty(new Error(), "message", {
        get() {
          events.push("message");
          throw thrown;
        },
      }),
    (events: string[]) => ({
      get toString() {
        events.push("get toString");
        return () => {
          events.push("call toString");
          return "original reason";
        };
      },
    }),
    (events: string[]) => ({
      toString() {
        events.push("call toString");
        throw thrown;
      },
    }),
    (events: string[]) =>
      new Proxy(
        {},
        {
          getPrototypeOf() {
            events.push("prototype");
            return null;
          },
          get(_target, key) {
            events.push(String(key));
            return key === Symbol.toPrimitive ? () => "proxy reason" : undefined;
          },
        },
      ),
    () => null,
    () => undefined,
    () => "primitive reason",
    () => 0,
  ];
  for (const make of factories) {
    const evaluate = (convert: (reason: unknown) => string) => {
      const events: string[] = [];
      const reason = make(events);
      expect(events).toEqual([]);
      events.push("before conversion");
      try {
        return { value: convert(reason), reason: undefined, events };
      } catch (reason) {
        return { value: undefined, reason, events };
      }
    };
    const before = evaluate(original);
    const after = evaluate(errorMessage);
    expect(after).toEqual(before);
    expect(after.reason).toBe(before.reason);
  }
});
