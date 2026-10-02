import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import { commitInteractiveComposer } from "../../apps/shell/src/use-interactive-composer";

function fixture(url = "chrome://aux/") {
  const dom = new JSDOM('<main><textarea></textarea><button>Send</button></main>', { url, pretendToBeVisual: true });
  const document = dom.window.document;
  const input = document.querySelector("textarea")!;
  input.getBoundingClientRect = () => ({ x: 10, y: 10, left: 10, top: 10, right: 210, bottom: 110, width: 200, height: 100, toJSON() {} });
  document.elementFromPoint = () => input;
  const mark = vi.fn();
  Object.defineProperty(dom.window.performance, "mark", { value: mark });
  return { dom, document, input, mark };
}

describe("committed interactive composer witness (synthetic DOM, no native evidence)", () => {
  it("marks actual editable input independently of unavailable Send/model", () => {
    const f = fixture(); f.document.querySelector("button")!.disabled = true;
    const cleanup = commitInteractiveComposer(f.input, "first");
    expect(f.mark).toHaveBeenCalledWith("aux-interactive", { detail: { instance: "first" } });
    expect(f.input.dataset.auxInteractiveInstance).toBe("first");
    cleanup?.(); expect(f.input.dataset.auxInteractiveInstance).toBeUndefined(); f.dom.window.close();
  });
  it("does not mark disabled, readonly, detached or inert inputs", () => {
    for (const mutate of [
      (f: ReturnType<typeof fixture>) => { f.input.disabled = true; },
      (f: ReturnType<typeof fixture>) => { f.input.readOnly = true; },
      (f: ReturnType<typeof fixture>) => { f.input.remove(); },
      (f: ReturnType<typeof fixture>) => { f.input.parentElement!.setAttribute("inert", ""); },
    ]) { const f = fixture(); mutate(f); expect(commitInteractiveComposer(f.input, "bad")).toBeUndefined(); expect(f.mark).not.toHaveBeenCalled(); f.dom.window.close(); }
  });
  it("refuses covered, offscreen, hidden and foreign documents", () => {
    const covered = fixture(); covered.document.elementFromPoint = () => covered.document.querySelector("button");
    const offscreen = fixture(); offscreen.input.getBoundingClientRect = () => ({ x:-300,y:10,left:-300,top:10,right:-100,bottom:110,width:200,height:100,toJSON(){} });
    const hidden = fixture(); hidden.input.style.visibility = "hidden";
    const foreign = fixture("https://example.test/");
    for (const f of [covered, offscreen, hidden, foreign]) { expect(commitInteractiveComposer(f.input, "bad")).toBeUndefined(); expect(f.mark).not.toHaveBeenCalled(); f.dom.window.close(); }
  });
  it("refuses disabled fieldsets and invisible ancestors even when hit testing returns the input", () => {
    const fieldset = fixture(); const group = fieldset.document.createElement("fieldset");
    fieldset.input.replaceWith(group); group.append(fieldset.input); group.disabled = true;
    const opacity = fixture(); opacity.input.parentElement!.style.opacity = "0";
    const ownOpacity = fixture(); ownOpacity.input.style.opacity = "0";
    const hidden = fixture(); hidden.input.parentElement!.hidden = true;
    const hiddenStyle = fixture(); hiddenStyle.input.parentElement!.style.visibility = "hidden";
    const display = fixture(); display.input.parentElement!.style.display = "none";
    for (const f of [fieldset, opacity, ownOpacity, hidden, hiddenStyle, display]) {
      expect(commitInteractiveComposer(f.input, "hidden")).toBeUndefined(); expect(f.mark).not.toHaveBeenCalled(); f.dom.window.close();
    }
  });
  it("marks once per actual document and removes stale mount authority", () => {
    const f = fixture(); const oldCleanup = commitInteractiveComposer(f.input, "old");
    const currentCleanup = commitInteractiveComposer(f.input, "new"); oldCleanup?.();
    expect(f.input.dataset.auxInteractiveInstance).toBe("new"); expect(f.mark).toHaveBeenCalledTimes(1);
    currentCleanup?.(); expect(f.input.dataset.auxInteractiveInstance).toBeUndefined(); f.dom.window.close();
    const other = fixture(); commitInteractiveComposer(other.input, "other-document"); expect(other.mark).toHaveBeenCalledTimes(1); other.dom.window.close();
  });
});
