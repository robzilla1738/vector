// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { ModelConnections } from "./ModelConnections";
import { call } from "../../store";

vi.mock("../../bridge", () => ({
  bridge: { windowId: "voice-fixture", windowKind: "normal", privateMode: false },
  inNativeHost: false,
  inMock: true,
}));
vi.mock("../../store", () => ({ call: vi.fn(), toast: vi.fn(), errToast: vi.fn() }));
vi.mock("../../commands", () => ({ executeCommand: vi.fn() }));
const dispose: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of dispose.splice(0)) await close();
  vi.unstubAllGlobals();
  vi.mocked(call).mockReset();
});
const gateway = {
  provider: "gateway",
  selected: true,
  enabled: true,
  credentialSource: "environment",
  credentialUnavailable: false,
  localEndpoint: false,
};
async function fixture() {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div"),
    root = createRoot(container),
    save = vi.fn(async () => true);
  document.body.append(container);
  dispose.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  const render = (settings: Record<string, unknown>) =>
    act(async () =>
      root.render(
        <ModelConnections
          settings={settings}
          active
          disabled={false}
          onSave={save}
          onEdit={async () => {}}
        />,
      ),
    );
  return { container, save, render };
}
it("keeps voice Off by default, shows verified models and saves a keyboard selection without dispatching transcription", async () => {
  vi.mocked(call).mockResolvedValue({
    models: [
      {
        id: "openai/whisper-1",
        name: "Whisper",
        source: "catalog",
        transcription: { batch: true, usdPerSecond: 0.0001 },
      },
    ],
    available: false,
  } as never);
  const f = await fixture();
  await f.render({ modelConnections: [gateway], imageModel: null });
  const select = f.container.querySelector<HTMLSelectElement>(
    'select[aria-label="Voice-transcription model"]',
  )!;
  expect(select.value).toBe("off");
  expect(select.disabled).toBe(false);
  expect(f.container.textContent).toContain("10 minutes");
  await act(async () => {
    select.value = "openai/whisper-1";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(f.save).toHaveBeenCalledWith({ transcriptionModel: "openai/whisper-1" });
  expect(vi.mocked(call).mock.calls.map(([method]) => method)).toEqual(["models.transcription.list"]);
});
it("discards a late catalog belonging to a retired connection control", async () => {
  let finish!: (value: unknown) => void;
  vi.mocked(call)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue({ models: [], available: false } as never);
  const f = await fixture();
  await f.render({ modelConnections: [gateway] });
  await f.render({ modelConnections: [{ ...gateway, enabled: false }] });
  await act(async () =>
    finish({
      models: [{ id: "stale/model", source: "catalog", transcription: { batch: true, usdPerSecond: 0 } }],
      available: true,
    }),
  );
  expect(f.container.querySelector('option[value="stale/model"]')).toBeNull();
});
