import { expect, it, vi } from "vitest";
import { hasNativeBookmarkAuthority, startNativeBookmarkObserver } from "./native-bookmark-observer";
import type { ChromiumHostPort } from "./chromium-bridge";

function fixture() {
  let receive: (value: unknown) => void = () => {};
  let resolve: (value: unknown) => void = () => {};
  const stop = vi.fn();
  const request = vi.fn(
    () =>
      new Promise<unknown>((done) => {
        resolve = done;
      }),
  );
  const port: ChromiumHostPort = {
    host: "chromium-fork",
    windowId: "window",
    profileId: "profile",
    platform: "darwin",
    privateMode: false,
    windowKind: "normal",
    request,
    subscribe: vi.fn((_event, callback) => {
      receive = callback;
      return stop;
    }),
  };
  const apply = vi.fn(),
    error = vi.fn();
  return {
    port,
    apply,
    error,
    stop,
    emit: (value: unknown) => receive(value),
    finish: (value: unknown) => resolve(value),
  };
}
const saved = [{ nodeId: "12", url: "https://saved.test/", title: "Saved", createdAt: 1 }];

it("subscribes before the initial read and prevents that read from replacing a newer native event", async () => {
  const fixtureState = fixture();
  const { port, apply, error, emit, finish } = fixtureState;
  const retire = startNativeBookmarkObserver(port, apply, error);
  expect(vi.mocked(port.subscribe).mock.invocationCallOrder[0]).toBeLessThan(
    vi.mocked(port.request).mock.invocationCallOrder[0]!,
  );
  expect(hasNativeBookmarkAuthority()).toBe(false);
  emit(saved);
  expect(hasNativeBookmarkAuthority()).toBe(true);
  finish([]);
  await Promise.resolve();
  expect(apply.mock.calls).toEqual([[saved]]);
  expect(error).not.toHaveBeenCalled();
  retire();
  expect(hasNativeBookmarkAuthority()).toBe(false);
});

it("discards reads and events after retirement and rejects malformed native snapshots", async () => {
  const { port, apply, error, stop, emit, finish } = fixture();
  const retire = startNativeBookmarkObserver(port, apply, error);
  emit([{ title: "Missing identity and address" }]);
  expect(error).toHaveBeenCalledOnce();
  retire();
  emit(saved);
  finish(saved);
  await Promise.resolve();
  expect(apply).not.toHaveBeenCalled();
  expect(stop).toHaveBeenCalledOnce();
});

it("does not read or subscribe to persistent bookmarks for private windows", () => {
  const { port, apply, error } = fixture();
  startNativeBookmarkObserver({ ...port, privateMode: true }, apply, error)();
  expect(port.request).not.toHaveBeenCalled();
  expect(port.subscribe).not.toHaveBeenCalled();
});
