import { createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import { EventBus, NullNativeBridge, openDb, PageService, Repo } from "@aux/runtime";
import { RECORDER_SOURCE } from "@aux/chromium-driver";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
const pageId = "15120a93-910a-451a-bbbd-e1daf3368f60";
const recorderId = "35120a93-910a-451a-bbbd-e1daf3368f60";
const receipt = { recorderId, documentGeneration: "1", producerSha256: createHash("sha256").update(RECORDER_SOURCE).digest("hex") };
function fixture() {
  const repo = new Repo(openDb(":memory:")), events = new EventBus(repo), native = new NullNativeBridge();
  vi.spyOn(native, "available").mockReturnValue(true);
  const start = vi.fn(async () => receipt), drain = vi.fn(async () => ({ recorderId, documentGeneration: "1", events: [] })), stop = vi.fn(async () => ({ stopped: true }));
  Object.assign(native, { recorderStart: start, recorderDrain: drain, recorderStop: stop });
  const pages: PageService = new PageService({ repo, events, native, drivers: () => ({ aux: null, chrome: null }), turnMentions: fixtureTurnMentions(id => pages.get(id)) });
  const register = () => pages.registerExternal({ pageId, marker: "native-person-marker", backend: "aux", url: "https://person.test/", active: false });
  return { repo, pages, register, start, drain, stop };
}
it("records only through native receipts without a DriverPage or fabricated session", async () => {
  const f = fixture();
  try {
    const page = await f.register();
    expect(page.sessionId).toBeUndefined(); expect(f.pages.isAttached(pageId)).toBe(false);
    const observer = await f.pages.recorderObserver(pageId);
    await observer.start(() => {}, () => {});
    expect(f.start).toHaveBeenCalledWith({ pageId });
    await observer.close();
    expect(f.stop).toHaveBeenCalledWith({ pageId, recorderId });
    expect(f.drain).not.toHaveBeenCalled();
    expect(f.pages.get(pageId).sessionId).toBeUndefined();
  } finally { f.repo.close(); }
});
it("refuses a same-ID registry replacement during held native Start and cleans the original receipt", async () => {
  const f = fixture(); let release!: (value: typeof receipt) => void;
  f.start.mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  try {
    await f.register(); const observer = await f.pages.recorderObserver(pageId);
    const failed = observer.start(() => {}, () => {}).catch(error => error);
    f.pages.onNativeRemoved(pageId, false); await f.register(); release(receipt);
    expect(await failed).toMatchObject({ code: "target_detached" });
    await expect(observer.close()).rejects.toMatchObject({ code: "target_detached" });
    expect(f.stop).toHaveBeenCalledWith({ pageId, recorderId });
    expect(f.drain).not.toHaveBeenCalled();
    expect(f.pages.get(pageId).sessionId).toBeUndefined();
  } finally { f.repo.close(); }
});
