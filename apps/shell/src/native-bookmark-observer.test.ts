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
    finish: (value: unknown) => resolve({ method: "bookmarks.list", result: value }),
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
  await vi.waitFor(() => expect(hasNativeBookmarkAuthority()).toBe(true));
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
  await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
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

it("preserves event arrival order while validation loads and cannot publish after retirement", async () => {
  const { port, apply, error, emit, finish } = fixture();
  const retire = startNativeBookmarkObserver(port, apply, error);
  emit(saved);
  emit([{ ...saved[0]!, title: "Latest" }]);
  finish([]);
  await vi.waitFor(() => expect(apply).toHaveBeenCalledTimes(2));
  expect(apply.mock.calls).toEqual([[saved], [[{ ...saved[0]!, title: "Latest" }]]]);
  retire();
  emit(saved);
  await Promise.resolve();
  expect(apply).toHaveBeenCalledTimes(2);
  expect(error).not.toHaveBeenCalled();
});

it("retires synchronously before deferred event validation can publish", async () => {
  const { port, apply, error, emit, finish } = fixture();
  const retire = startNativeBookmarkObserver(port, apply, error);
  emit(saved);
  finish(saved);
  retire();
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(apply).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  expect(hasNativeBookmarkAuthority()).toBe(false);
});

it("keeps the preceding valid event if a newer event fails deferred validation", async () => {
  const { port, apply, error, emit, finish } = fixture();
  const retire = startNativeBookmarkObserver(port, apply, error);
  emit(saved);
  emit([{ title: "Malformed latest event" }]);
  finish([]);
  await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
  expect(apply.mock.calls).toEqual([[saved]]);
  expect(hasNativeBookmarkAuthority()).toBe(true);
  retire();
});
