// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { AnswerMarkdown } from "./components/AnswerMarkdown";
import { useStore } from "./store";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const host = document.createElement("div");
const root = createRoot(host);
afterEach(async () => {
  await act(async () => root.render(null));
  vi.restoreAllMocks();
});
it("renders useful structure without executing HTML or loading remote images", async () => {
  await act(async () =>
    root.render(
      <AnswerMarkdown
        text={
          "## Result\n\n**Ready**\n\n- First\n- Second\n\n| Item | State |\n| --- | --- |\n| Build | Done |\n\n<script>alert(1)</script>\n\n![tracker](https://example.com/pixel)\n\n[bad](javascript:alert%281%29)\n\n[file](file:///etc/passwd)\n\n[data](data:text/html,bad)"
        }
      />,
    ),
  );
  expect(host.querySelector("h2")?.textContent).toBe("Result");
  expect(host.querySelectorAll("li")).toHaveLength(2);
  expect(host.querySelector("table")?.textContent).toContain("Build");
  expect(host.querySelectorAll("img,script,iframe,a")).toHaveLength(0);
});
it("opens an explicit web link as an Aux tab and copies code literally", async () => {
  const newTab = vi.fn().mockResolvedValue(true);
  const previous = useStore.getState().newTab;
  useStore.setState({ newTab });
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  try {
    await act(async () =>
      root.render(
        <AnswerMarkdown text={'[Order](https://example.com/order)\n\n```sh\necho "<keep>"\n```'} />,
      ),
    );
    await act(async () => host.querySelector("a")!.click());
    expect(newTab).toHaveBeenCalledWith("https://example.com/order");
    await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="Copy code"]')!.click());
    expect(writeText).toHaveBeenCalledWith('echo "<keep>"\n');
  } finally {
    useStore.setState({ newTab: previous });
    vi.unstubAllGlobals();
  }
});

it("jumps to a heading within the same answer and moves keyboard focus", async () => {
  document.body.append(host);
  const scroll = vi.fn();
  try {
    await act(async () =>
      root.render(
        <>
          <AnswerMarkdown text={"## Résumé\n\nFirst answer"} />
          <AnswerMarkdown
            text={"[Jump](#r%C3%A9sum%C3%A9-1)\n\n## Résumé\n\nFirst section\n\n## Résumé\n\nSecond section"}
          />
        </>,
      ),
    );
    const target = host.querySelectorAll<HTMLElement>("h2")[2]!;
    target.scrollIntoView = scroll;
    await act(async () => host.querySelector<HTMLAnchorElement>("a")!.click());
    expect(scroll).toHaveBeenCalledWith({ block: "start" });
    expect(document.activeElement).toBe(target);
    expect(host.querySelectorAll("[id]")).toHaveLength(0);
  } finally {
    host.remove();
  }
});

it("only shows citation provenance for one exact recorded source and preserves account-aware activation", async () => {
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  document.body.append(host);
  const source = {
    sourceId: "s1",
    runId: "r1",
    pageId: "p1",
    profileId: "work",
    url: "https://example.com/report",
    title: "Recorded report",
    observedAt: 1000,
    documentEpoch: 1,
    revision: 1,
  };
  const onOpenLink = vi.fn().mockReturnValue(true);
  try {
    await act(async () =>
      root.render(
        <AnswerMarkdown
          text="Read [report](https://example.com/report) or [other](https://example.com/other)."
          sources={[source]}
          onOpenLink={onOpenLink}
        />,
      ),
    );
    expect(host.querySelectorAll(".citation-chip")).toHaveLength(1);
    expect(host.querySelectorAll("a")).toHaveLength(2);
    await act(async () => host.querySelector<HTMLAnchorElement>(".citation-chip")!.focus());
    expect(document.querySelector('[role="tooltip"]')?.textContent).toContain("Recorded report");
    expect(document.querySelector('[role="tooltip"]')?.textContent).toContain("Unknown Profile");
    expect(document.querySelector('[role="tooltip"] img')).toBeNull();
    await act(async () => host.querySelector<HTMLAnchorElement>(".citation-chip")!.click());
    expect(onOpenLink).toHaveBeenCalledWith(source.url, false);
    await act(async () =>
      root.render(
        <AnswerMarkdown
          text="[report](https://example.com/report)"
          sources={[source, { ...source, sourceId: "s2", profileId: "personal" }]}
        />,
      ),
    );
    expect(host.querySelector(".citation-chip")).toBeNull();
    expect(host.querySelector("a")?.getAttribute("href")).toBe(source.url);
  } finally {
    await act(async () => root.render(null));
    host.remove();
    vi.unstubAllGlobals();
  }
});
