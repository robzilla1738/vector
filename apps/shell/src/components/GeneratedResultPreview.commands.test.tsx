// @vitest-environment jsdom
import { act, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { COMMANDS, type GeneratedResult } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { GeneratedResultPreview } from "./GeneratedResultPreview";
const initial = useStore.getState(),
  originalWindow = bridge.windowId,
  originalPrivate = bridge.privateMode,
  originalKind = bridge.windowKind;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const changed = vi.fn(),
  close = vi.fn();
const file = (id = "one", chat = "a", revision = 1): GeneratedResult => ({
  artifactId: id,
  chatId: chat,
  filename: "report.docx",
  mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  byteLength: 1200,
  createdAt: 1,
  sha256: "a".repeat(64),
  kind: "docx",
  revision,
  rootArtifactId: "one",
  parentArtifactId: "one",
  sourceRunId: "turn-a",
  preview: { title: `Original ${id}`, lines: ["<script>inert</script>"] },
  spec: { kind: "docx", title: "Brief", paragraphs: ["Current text"], tables: [] },
});
type Pending<T> = { resolve(value: T): void; reject(reason: unknown): void; promise: Promise<T> };
function hold<T>(): Pending<T> {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
let reads: { id: string; chat: string; pending: Pending<GeneratedResult> }[],
  generations: { params: unknown; pending: Pending<GeneratedResult> }[],
  exports: Pending<string | null>[];
let chat = "a";
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  useStore.setState({ ...initial, connected: false, toasts: [] }, true);
  changed.mockReset();
  close.mockReset();
  reads = [];
  generations = [];
  exports = [];
  chat = "a";
  vi.spyOn(bridge, "invoke").mockImplementation((method, params) => {
    if (method === "results.generated.get") {
      const pending = hold<GeneratedResult>();
      reads.push({ id: (params as { artifactId: string }).artifactId, chat, pending });
      return pending.promise;
    }
    if (method === "results.generated.versions")
      return Promise.resolve([file("one", chat), file("two", chat, 2)]);
    if (method === "results.generate") {
      const pending = hold<GeneratedResult>();
      generations.push({ params, pending });
      return pending.promise;
    }
    throw new Error(`Unexpected ${method}`);
  });
  vi.spyOn(bridge, "saveStoredArtifact").mockImplementation(() => {
    const pending = hold<string | null>();
    exports.push(pending);
    return pending.promise;
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowId = originalWindow;
  bridge.privateMode = originalPrivate;
  bridge.windowKind = originalKind;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const ids = {
  close: "close-generated-result-preview",
  toggle: "toggle-generated-result-source",
  export: "export-generated-result",
  version: "select-generated-result-version",
  save: "save-generated-result-version",
};
async function render(nextChat = "a", id = "one", contextDisabled = false) {
  chat = nextChat;
  await act(async () =>
    root.render(
      <GeneratedResultPreview
        chatId={nextChat}
        artifactId={id}
        contextDisabled={contextDisabled}
        onClose={close}
        onVersionSaved={changed}
      />,
    ),
  );
}
async function ready() {
  await render();
  await act(async () => reads[0]!.pending.resolve(file()));
}
const control = (id: string) => host.querySelector<HTMLButtonElement>(`[data-command-id="${id}"]`)!;
async function command(id: string) {
  let result!: Promise<unknown>;
  await act(async () => {
    const node =
      id === ids.version
        ? [...host.querySelectorAll<HTMLButtonElement>(`[data-command-id="${id}"]`)].find(
            (node) => !node.disabled,
          )!
        : control(id);
    node.focus();
    result = executeCommand(id);
    void result.catch(() => {});
  });
  return { result };
}
it("all five actual controls are normal scoped and disconnected viewing retains original args", async () => {
  await ready();
  expect(host.querySelector("script,iframe,img")).toBeNull();
  expect(host.textContent).toContain("Current text");
  for (const id of Object.values(ids))
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal", "private"],
      palette: false,
      bindings: [],
      intercept: true,
    });
  const ack = { close: true };
  close.mockReturnValue(ack);
  await expect((await command(ids.close)).result).resolves.toBe(ack);
  expect(reads[0]!.id).toBe("one");
});
it("revision uses exact original source/draft and returns real ACK once", async () => {
  await ready();
  await command(ids.toggle);
  const operation = await command(ids.save);
  expect(generations).toHaveLength(1);
  expect(generations[0]!.params).toEqual({
    chatId: "a",
    sourceArtifactId: "one",
    filename: "report.docx",
    spec: file().spec,
  });
  const ack = file("new", "a", 2);
  await act(async () => generations[0]!.pending.resolve(ack));
  await expect(operation.result).resolves.toBe(ack);
  expect(changed).toHaveBeenCalledExactlyOnceWith("new");
  expect(control(ids.save).disabled).toBe(false);
});
it("export retains real path ACK, exact original producer and current toast", async () => {
  const reveal = vi.spyOn(bridge, "revealPath").mockResolvedValue(true);
  await ready();
  const operation = await command(ids.export);
  expect(bridge.saveStoredArtifact).toHaveBeenCalledExactlyOnceWith("one", "report.docx");
  await act(async () => exports[0]!.resolve("/tmp/real-original-report.docx"));
  await expect(operation.result).resolves.toBe("/tmp/real-original-report.docx");
  expect(useStore.getState().toasts.map((value) => value.text)).toContain("Result exported");
  const action = useStore.getState().toasts.find((value) => value.text === "Result exported")!.action!;
  expect(action.label).toBe("Reveal");
  await act(async () => action.run());
  expect(reveal).toHaveBeenCalledExactlyOnceWith("/tmp/real-original-report.docx");
  await render("a", "two");
  await act(async () => action.run());
  expect(reveal).toHaveBeenCalledTimes(1);
});
it("current original revision rejection remains identical and inline without duplicate toast", async () => {
  await ready();
  await command(ids.toggle);
  const operation = await command(ids.save);
  const reason = new Error("Original revision failed");
  await act(async () => generations[0]!.pending.reject(reason));
  await expect(operation.result).rejects.toBe(reason);
  expect(host.querySelector('[role="alert"]')?.textContent).toBe(reason.message);
  expect(useStore.getState().toasts).toEqual([]);
  expect(control(ids.save).disabled).toBe(false);
});
it("current actual native export rejection reports once and recovers busy", async () => {
  await ready();
  await act(async () => control(ids.export).click());
  const reason = new Error("Original export failed");
  await act(async () => exports[0]!.reject(reason));
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(control(ids.export).disabled).toBe(false);
});
it("same-tick original native admission cannot issue duplicate exports", async () => {
  await ready();
  await act(async () => {
    control(ids.export).click();
    control(ids.export).click();
  });
  expect(exports).toHaveLength(1);
  await act(async () => exports[0]!.resolve(null));
  expect(useStore.getState().toasts).toEqual([]);
});
it("held revision chat A→B→A cannot publish or clear newer operation", async () => {
  await ready();
  await command(ids.toggle);
  const old = await command(ids.save);
  await render("b");
  await render("a");
  await act(async () => reads[2]!.pending.resolve(file()));
  await command(ids.toggle);
  const fresh = await command(ids.save);
  await act(async () => generations[0]!.pending.resolve(file("retired", "a", 2)));
  await expect(old.result).resolves.toMatchObject({ artifactId: "retired" });
  expect(changed).not.toHaveBeenCalled();
  expect(control(ids.save).disabled).toBe(true);
  await act(async () => generations[1]!.pending.resolve(file("accepted", "a", 2)));
  await expect(fresh.result).resolves.toMatchObject({ artifactId: "accepted" });
  expect(changed).toHaveBeenCalledExactlyOnceWith("accepted");
});
it("observed foreign window ABA retires held export errors and old local actions", async () => {
  await ready();
  const operation = await command(ids.export);
  bridge.windowId = "foreign";
  await act(async () => control(ids.close).click());
  bridge.windowId = originalWindow;
  await act(async () => exports[0]!.reject(new Error("Retired native error")));
  await expect(operation.result).rejects.toThrow("Retired native error");
  expect(useStore.getState().toasts).toEqual([]);
  expect(close).not.toHaveBeenCalled();
  control(ids.close).focus();
  await expect(executeCommand(ids.close)).rejects.toThrow();
});
it("held original read cannot publish after observed owner ABA", async () => {
  await render();
  bridge.windowId = "foreign";
  await act(async () => control(ids.close).click());
  bridge.windowId = originalWindow;
  await act(async () => reads[0]!.pending.resolve(file()));
  expect(host.textContent).not.toContain("Original one");
});
it("artifact one→two→one keeps newest source and rejects late original read error", async () => {
  await render();
  await render("a", "two");
  await render();
  await act(async () =>
    reads[2]!.pending.resolve({ ...file(), preview: { title: "Newest original", lines: [] } }),
  );
  await act(async () => reads[0]!.pending.reject(new Error("Retired source")));
  expect(host.textContent).toContain("Newest original");
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("retained version remap chooses exact recorded target and title toggle is focused", async () => {
  useStore.setState({
    settings: {
      shortcutOverrides: {
        [ids.version]: [{ key: "j", command: true, alt: true }],
        [ids.toggle]: [{ key: "k", command: true, alt: true }],
      },
    },
  });
  await ready();
  const version = [...host.querySelectorAll<HTMLButtonElement>(`[data-command-id="${ids.version}"]`)].find(
    (node) => !node.disabled,
  )!;
  await act(async () => {
    version.focus();
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(changed).toHaveBeenCalledExactlyOnceWith("two");
  await act(async () => {
    control(ids.toggle).focus();
    expect(dispatchShortcut({ key: "k", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(host.querySelector("textarea")?.value).toContain("Current text");
});
it("hidden and Private controls never admit original callback or export", async () => {
  await ready();
  control(ids.export).hidden = true;
  control(ids.export).focus();
  await expect(executeCommand(ids.export)).rejects.toThrow();
  bridge.privateMode = true;
  control(ids.close).focus();
  await expect(executeCommand(ids.close)).rejects.toThrow();
  expect(exports).toEqual([]);
  expect(close).not.toHaveBeenCalled();
});
it("context disabled preserves the revise gate while allowing export", async () => {
  await render("a", "one", true);
  await act(async () => reads[0]!.pending.resolve(file("one", "a", 20)));
  expect(control(ids.toggle).disabled).toBe(true);
  const operation = await command(ids.export);
  await act(async () => exports[0]!.resolve(null));
  await expect(operation.result).resolves.toBeNull();
  expect(generations).toEqual([]);
});
it("committed connection ABA renews exact source and old save cannot deliver", async () => {
  await ready();
  await command(ids.toggle);
  const operation = await command(ids.save);
  await act(async () => useStore.setState({ connected: true }));
  await act(async () => useStore.setState({ connected: false }));
  expect(reads).toHaveLength(3);
  await act(async () => reads[2]!.pending.resolve(file()));
  await act(async () => generations[0]!.pending.resolve(file("retired", "a", 2)));
  await expect(operation.result).resolves.toMatchObject({ artifactId: "retired" });
  expect(changed).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Original one");
});
it("actual remapped current revision failure stays inline without a global duplicate", async () => {
  useStore.setState({
    settings: { shortcutOverrides: { [ids.save]: [{ key: "l", command: true, alt: true }] } },
  });
  await ready();
  await command(ids.toggle);
  await act(async () => {
    control(ids.save).focus();
    expect(dispatchShortcut({ key: "l", meta: true, alt: true, shift: false })).toBe(true);
  });
  const reason = new Error("Original remapped generated failure");
  await act(async () => generations[0]!.pending.reject(reason));
  expect(host.querySelector('[role="alert"]')?.textContent).toBe(reason.message);
  expect(useStore.getState().toasts).toEqual([]);
  expect(control(ids.save).disabled).toBe(false);
});
it("actual remapped current native export error still reports once", async () => {
  useStore.setState({
    settings: { shortcutOverrides: { [ids.export]: [{ key: "l", command: true, alt: true }] } },
  });
  await ready();
  await act(async () => {
    control(ids.export).focus();
    expect(dispatchShortcut({ key: "l", meta: true, alt: true, shift: false })).toBe(true);
  });
  await act(async () => exports[0]!.reject(new Error("Actual native export error")));
  expect(useStore.getState().toasts.map((value) => value.text)).toEqual(["Actual native export error"]);
  expect(control(ids.export).disabled).toBe(false);
});

it("committed layout-cut source change cannot export old result before passive clear", async () => {
  let attack = false,
    completion: Promise<unknown> | undefined;
  function Probe({ attack }: { attack: boolean }) {
    useLayoutEffect(() => {
      if (attack) {
        control(ids.export).focus();
        completion = executeCommand(ids.export);
        void completion.catch(() => {});
      }
    }, [attack]);
    return null;
  }
  function View({ id, nextChat }: { id: string; nextChat: string }) {
    return (
      <>
        <GeneratedResultPreview artifactId={id} chatId={nextChat} onClose={close} />
        <Probe attack={attack} />
      </>
    );
  }
  await act(async () => root.render(<View id="one" nextChat="a" />));
  await act(async () => reads[0]!.pending.resolve(file()));
  attack = true;
  chat = "b";
  await act(async () => root.render(<View id="two" nextChat="b" />));
  expect(exports).toEqual([]);
  await expect(completion).rejects.toThrow();
  await act(async () => reads[1]!.pending.resolve(file("two", "b")));
  await command(ids.export);
  expect(bridge.saveStoredArtifact).toHaveBeenCalledWith("two", "report.docx");
  await act(async () => exports[0]!.resolve(null));
});
