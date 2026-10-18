import { expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { PlaywrightDriverPage, RefRegistry } from "@aux/chromium-driver";
import { executeProgram, writeOutcome } from "@aux/runtime";

it.each(["type", "fill"] as const)(
  "direct %s focuses the contenteditable and records its value change without a click",
  async (op) => {
    const dom = new JSDOM('<div id="bio" contenteditable="true" tabindex="0"></div>', {
      url: "https://input.test/",
      runScripts: "outside-only",
    });
    try {
      const editor = dom.window.document.querySelector<HTMLElement>("#bio")!;
      const before = op === "fill" ? "Old bio" : "";
      editor.textContent = before;
      // jsdom has no editable/layout implementation; the real isolated-world
      // focus and selection code still operates on this actual DOM element.
      Object.defineProperties(editor, {
        isContentEditable: { value: true },
        innerText: { get: () => editor.textContent },
      });
      editor.getBoundingClientRect = () => ({ width: 300, height: 100 }) as DOMRect;
      Object.assign(dom.window, {
        __auxStore: { refs: new Map([["r12", editor]]), cssPath: () => "#bio" },
      });
      const input: string[] = [];
      const selections: string[] = [];
      const insert = (text: string) => {
        expect(dom.window.document.activeElement).toBe(editor);
        selections.push(dom.window.getSelection()?.toString() ?? "");
        editor.textContent = text;
      };
      const session = {
        on() {},
        detach: async () => {},
        send: async (method: string, params: Record<string, unknown> = {}) => {
          if (method === "Page.getFrameTree") return { frameTree: { frame: { id: "main" } } };
          if (method === "Page.createIsolatedWorld") return { executionContextId: 7 };
          if (method === "Runtime.evaluate")
            return {
              result: { value: dom.window.eval(String(params.expression)) },
            };
          if (method.startsWith("Input.")) {
            input.push(method);
            insert(String(params.text));
          }
          return {};
        },
      };
      const locator = {
        count: async () => 1,
        filter() {
          return this;
        },
        evaluate: async (read: (element: HTMLElement) => unknown) => read(editor),
      };
      const frame = {
        url: () => dom.window.location.href,
        locator: () => locator,
      };
      const page = {
        on() {},
        url: frame.url,
        mainFrame: () => frame,
        frames: () => [frame],
        isClosed: () => false,
        keyboard: {
          type: async (text: string) => {
            input.push("keyboard.type");
            insert(text);
          },
        },
      };
      const refs = new RefRegistry();
      refs.register("p1", [{ ref: "r12", tag: "div", frame: "main", selector: { css: "#bio" } }]);
      const driver = new PlaywrightDriverPage({
        page: page as never,
        context: { newCDPSession: async () => session } as never,
        identity: { pageId: "p1", targetId: "t1", backend: "aux" },
        refs,
        initialDocumentEpoch: 20,
      });
      const result = await executeProgram(driver, {
        pageId: "p1",
        steps: [{ id: "bio", op, target: "r12", value: "Design systems for teams" }],
      });
      expect(result.status).toBe("completed");
      expect(input).toEqual([op === "fill" ? "Input.insertText" : "keyboard.type"]);
      expect(selections).toEqual([before]);
      expect(editor.textContent).toBe("Design systems for teams");
      expect(result.steps[0]).toMatchObject({
        status: "ok",
        before: { value: before },
        after: { value: "Design systems for teams" },
        effect: "observed",
        receipt: {
          uncertain: false,
          remoteConfirmed: false,
          identity: { documentEpoch: 20 },
        },
      });
      expect(writeOutcome(result).outcome).toBe("confirmed");
    } finally {
      dom.window.close();
    }
  },
);
