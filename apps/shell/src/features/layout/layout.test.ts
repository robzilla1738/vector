import { beforeEach, expect, it, vi } from "vitest";
import { toggleMinimalUi, MINIMAL_UI_HINT } from "./layout";
const mocked = vi.hoisted(() => ({ settings: {} as Record<string, unknown>, toast: vi.fn(), call: vi.fn(), kind: "normal" }));
vi.mock("../../bridge", () => ({ bridge: { get windowKind() { return mocked.kind; } } }));
vi.mock("../../store", () => ({ useStore: { getState: () => ({ settings: mocked.settings, toast: mocked.toast }) } }));
vi.mock("../../store/shared", () => ({ call: mocked.call }));
vi.mock("../../use-feature", () => ({ featureStage: () => "on" }));
beforeEach(() => { mocked.settings = {}; mocked.kind = "normal"; vi.clearAllMocks(); mocked.call.mockResolvedValue({}); });
it("persists Minimal UI before the first-use hint and retains the user's sidebar preference", async () => {
  mocked.settings = { sidebar: "expanded" };
  await toggleMinimalUi();
  expect(mocked.call).toHaveBeenCalledWith("settings.set", { minimalUi: true, minimalUiAcknowledged: true });
  expect(mocked.toast).toHaveBeenCalledWith(MINIMAL_UI_HINT);
  expect(mocked.call.mock.invocationCallOrder[0]).toBeLessThan(mocked.toast.mock.invocationCallOrder[0]!);
});
it("does not repeat the hint when re-entering or leaving Minimal UI", async () => {
  mocked.settings = { minimalUiAcknowledged: true };
  await toggleMinimalUi();
  expect(mocked.toast).not.toHaveBeenCalled();
  mocked.settings.minimalUi = true;
  await toggleMinimalUi();
  expect(mocked.call).toHaveBeenLastCalledWith("settings.set", { minimalUi: false });
  expect(mocked.toast).not.toHaveBeenCalled();
});
it("refuses special windows and does not show a success hint when persistence fails", async () => {
  for (const kind of ["little", "quickask"]) {
    mocked.kind = kind;
    await expect(toggleMinimalUi()).rejects.toThrow("browser windows");
  }
  expect(mocked.call).not.toHaveBeenCalled();
  mocked.kind = "normal";
  mocked.call.mockRejectedValueOnce(new Error("Disconnected"));
  await expect(toggleMinimalUi()).rejects.toThrow("Disconnected");
  expect(mocked.toast).not.toHaveBeenCalled();
});
