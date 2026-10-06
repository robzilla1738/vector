import { vi } from "vitest";
import { bridge, type OmniboxResult } from "./bridge";

export type BrowserFixtureMatch = Omit<OmniboxResult["items"][number], "index"> & { index?: number };
/** A real start/event/stop/open transport fixture; results retain native identity. */
export function nativeOmniboxFixture(items: BrowserFixtureMatch[] = []) {
  const listeners = new Set<(result: OmniboxResult) => void>();
  const emit = (result: OmniboxResult) => listeners.forEach((callback) => callback(result));
  vi.spyOn(bridge, "onOmniboxResult").mockImplementation((callback) => {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  });
  const start = vi.spyOn(bridge, "omnibox.start").mockImplementation(async ({ queryId, input }) => {
    emit({
      queryId,
      sequenceId: queryId,
      input,
      done: true,
      items: items.map((item, index) => ({ ...item, index: item.index ?? index })),
    });
    return true;
  });
  const stop = vi.spyOn(bridge, "omnibox.stop").mockResolvedValue(true);
  const open = vi.spyOn(bridge, "omnibox.open").mockResolvedValue(true);
  return { start, stop, open, emit };
}
