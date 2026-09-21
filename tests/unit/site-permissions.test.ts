import { afterEach, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
const native = vi.hoisted(() => ({ ask: vi.fn() }));
vi.mock("../../apps/desktop/node_modules/electron", () => ({ dialog: { showMessageBox: native.ask } }));
import { installSitePermissions, type SitePermissions } from "../../apps/desktop/main/site-permissions.js";
type Session = Parameters<typeof installSitePermissions>[0];
type Options = Parameters<typeof installSitePermissions>[1];
type WebContents = Parameters<Options["owner"]>[0];
type BaseWindow = NonNullable<ReturnType<Options["owner"]>>;
afterEach(() => vi.clearAllMocks());
function setup() {
  let request: Function, check: Function, answer!: (value: {response: number}) => void;
  let saved: SitePermissions = {};
  const window = Object.assign(new EventEmitter(), { isDestroyed: () => false });
  const page = Object.assign(new EventEmitter(), { isDestroyed: () => false, getURL: () => "https://fixture.test" });
  native.ask.mockImplementation(() => new Promise(resolve => { answer = resolve; }));
  installSitePermissions({ setPermissionRequestHandler: (handler: Function) => { request=handler; }, setPermissionCheckHandler: (handler: Function) => { check=handler; } } as unknown as Session, {
    owner: contents => contents === page as unknown as WebContents ? window as unknown as BaseWindow : undefined,
    read: () => saved, save: value => { saved=value; }, privateMode: true,
  });
  return {page,window,request: (permission="media", details={mediaTypes:["audio"]})=>{
    const callback=vi.fn();request(page,permission,callback,{requestingUrl:"https://fixture.test",...details});return callback;
  }, answer: async()=>{answer({response:1});await Promise.resolve();}, reset:()=>{saved={};}, saved:()=>saved,
  check:(permission:string,mediaType?:string)=>check(page,permission,"https://fixture.test",{mediaType})};
}
it("separates camera/microphone grants and never grants legacy screen capture",async()=>{
  const fixture=setup(),mic=fixture.request();await fixture.answer();
  expect(mic).toHaveBeenCalledExactlyOnceWith(true);
  expect(fixture.check("media","audio")).toBe(true);
  expect(fixture.check("media","video")).toBe(false);
  expect(fixture.request("media",{mediaTypes:[]})).toHaveBeenCalledExactlyOnceWith(false);
  expect(fixture.request("display-capture")).toHaveBeenCalledExactlyOnceWith(false);
  expect(fixture.request("unknown-permission")).toHaveBeenCalledExactlyOnceWith(false);
});
it("dismisses a stale document prompt without saving or accepting its late answer",async()=>{
  const fixture=setup(),callback=fixture.request();
  fixture.page.emit("did-start-navigation",{},"https://elsewhere.test",false);
  await fixture.answer();
  expect(callback).toHaveBeenCalledExactlyOnceWith(false);
  expect(fixture.saved()).toEqual({});
  expect(fixture.page.listenerCount("destroyed")).toBe(0);
  expect(fixture.window.listenerCount("closed")).toBe(0);
});
it("invalidates pending consent when access is reset or its owner closes",async()=>{
  const fixture=setup(),callback=fixture.request();fixture.reset();await fixture.answer();
  expect(callback).toHaveBeenCalledExactlyOnceWith(false);expect(fixture.saved()).toEqual({});
  const second=fixture.request();fixture.window.emit("closed");await fixture.answer();
  expect(second).toHaveBeenCalledExactlyOnceWith(false);
});
