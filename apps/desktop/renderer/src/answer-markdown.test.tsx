// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { AnswerMarkdown } from "./components/AnswerMarkdown";
import { useStore } from "./store";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const host = document.createElement("div");
const root = createRoot(host);
afterEach(async () => { await act(async () => root.render(null)); vi.restoreAllMocks(); });
it("renders useful structure without executing HTML or loading remote images", async () => {
  await act(async () => root.render(<AnswerMarkdown text={'## Result\n\n**Ready**\n\n- First\n- Second\n\n| Item | State |\n| --- | --- |\n| Build | Done |\n\n<script>alert(1)</script>\n\n![tracker](https://example.com/pixel)\n\n[bad](javascript:alert%281%29)\n\n[file](file:///etc/passwd)\n\n[data](data:text/html,bad)'}/>));
  expect(host.querySelector('h2')?.textContent).toBe('Result');
  expect(host.querySelectorAll('li')).toHaveLength(2);
  expect(host.querySelector('table')?.textContent).toContain('Build');
  expect(host.querySelectorAll('img,script,iframe,a')).toHaveLength(0);
});
it("opens an explicit web link as an Aux tab and copies code literally", async () => {
  const newTab = vi.fn().mockResolvedValue(true);
  const previous = useStore.getState().newTab;
  useStore.setState({ newTab });
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  try {
    await act(async () => root.render(<AnswerMarkdown text={'[Order](https://example.com/order)\n\n```sh\necho "<keep>"\n```'}/>));
    await act(async () => host.querySelector('a')!.click());
    expect(newTab).toHaveBeenCalledWith('https://example.com/order');
    await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="Copy code"]')!.click());
    expect(writeText).toHaveBeenCalledWith('echo "<keep>"\n');
  } finally { useStore.setState({ newTab: previous }); vi.unstubAllGlobals(); }
});

it("jumps to a heading within the same answer and moves keyboard focus", async () => {
  document.body.append(host);
  const scroll = vi.fn();
  try {
    await act(async () => root.render(<><AnswerMarkdown text={'## Résumé\n\nFirst answer'}/><AnswerMarkdown text={'[Jump](#r%C3%A9sum%C3%A9-1)\n\n## Résumé\n\nFirst section\n\n## Résumé\n\nSecond section'}/></>));
    const target = host.querySelectorAll<HTMLElement>('h2')[2]!;
    target.scrollIntoView = scroll;
    await act(async () => host.querySelector<HTMLAnchorElement>('a')!.click());
    expect(scroll).toHaveBeenCalledWith({block:"start"});
    expect(document.activeElement).toBe(target);
    expect(host.querySelectorAll('[id]')).toHaveLength(0);
  } finally { host.remove(); }
});
