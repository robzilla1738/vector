import { normalizePages, orderedPages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStore } from "../store";
import { makePage } from "../mock/fixtures";
import { RunPanel } from "./RunPanel";

const initial = useStore.getState();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const retry = vi.fn().mockResolvedValue(undefined);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 },
  ] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  retry.mockClear();
  useStore.setState({
    pages: normalizePages([makePage(0, { pageId: "selected", title: "Selected website" })]),
    runs: [
      {
        runId: "original",
        goal: "Hello",
        status: "completed",
        pageIds: [],
        createdAt: 1,
        endedAt: 2,
        result: { answer: "Hello back" },
        config: { chatId: "chat" },
      },
    ],
    steps: { original: [] },
    retryRun: retry,
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  useStore.setState(initial, true);
  vi.unstubAllGlobals();
});
it("retries a page-free turn without offering to attach a subsequently selected website", async () => {
  await act(async () =>
    root.render(<RunPanel runId="original" conversation latest retryPageId="selected" controlsInComposer />),
  );
  expect(host.textContent).not.toContain("The original tab is unavailable");
  expect(host.textContent).not.toContain("Retry in selected tab");
  const button = host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!;
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(retry).toHaveBeenCalledExactlyOnceWith("original");
});
it("retains explicit selected-tab recovery when a failed turn's genuine original website is missing", async () => {
  useStore.setState((state) => ({
    runs: state.runs.map((run) => ({ ...run, status: "failed", pageIds: ["missing"] })),
  }));
  await act(async () =>
    root.render(<RunPanel runId="original" conversation latest retryPageId="selected" controlsInComposer />),
  );
  expect(host.textContent).toContain("The original tab is unavailable");
  const button = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.textContent === "Retry in selected tab",
  )!;
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(retry).toHaveBeenCalledExactlyOnceWith("original", "selected");
});

function protectedContext() {
  const source = makePage(1, {
    pageId: "source",
    title: "Original website",
    url: "https://original.test/",
    ownedByRuntime: false,
    documentEpoch: 3,
    sessionId: "original-person-session",
  });
  const copy = makePage(2, { pageId: "temporary", url: source.url, ownedByRuntime: true });
  useStore.setState((state) => ({
    pages: normalizePages([...orderedPages(state.pages), source, copy]),
    runs: state.runs.map((run) => ({
      ...run,
      pageIds: [copy.pageId],
      config: {
        ...run.config,
        contextPageRefs: [
          {
            pageId: source.pageId,
            url: source.url,
            documentEpoch: source.documentEpoch,
            sessionId: source.sessionId,
          },
        ],
        isolatedPageSources: [{ sourcePageId: source.pageId, pageId: copy.pageId, url: source.url }],
      },
    })),
  }));
  return { source, copy };
}

it("enables original-source retry after a temporary copy closes without selecting another website", async () => {
  const { copy } = protectedContext();
  useStore.setState((state) => ({
    pages: normalizePages(orderedPages(state.pages).filter((page) => page.pageId !== copy.pageId)),
  }));
  await act(async () =>
    root.render(<RunPanel runId="original" conversation latest retryPageId="selected" controlsInComposer />),
  );
  expect(host.textContent).not.toContain("The original tab is unavailable");
  expect(host.textContent).not.toContain("Retry in selected tab");
  const button = host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!;
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(retry).toHaveBeenCalledExactlyOnceWith("original");
});

it.each([
  "document",
  "session",
  "url",
  "ownership",
  "closed",
  "missing-map",
  "ambiguous-map",
  "missing-snapshot",
] as const)(
  "does not offer ordinary protected-copy retry after original %s drift even with a live old copy",
  async (drift) => {
    const { source } = protectedContext();
    useStore.setState((state) => ({
      pages: normalizePages(
        orderedPages(state.pages)
          .filter((page) => drift !== "closed" || page.pageId !== source.pageId)
          .map((page) =>
            page.pageId !== source.pageId
              ? page
              : {
                  ...page,
                  documentEpoch: drift === "document" ? page.documentEpoch + 1 : page.documentEpoch,
                  sessionId: drift === "session" ? "replacement-person-session" : page.sessionId,
                  url: drift === "url" ? "https://replacement.test/" : page.url,
                  ownedByRuntime: drift === "ownership" ? true : page.ownedByRuntime,
                },
          ),
      ),
      runs: state.runs.map((run) => ({
        ...run,
        config: {
          ...run.config,
          isolatedPageSources:
            drift === "missing-map"
              ? undefined
              : drift === "ambiguous-map"
                ? [...run.config!.isolatedPageSources!, ...run.config!.isolatedPageSources!]
                : run.config?.isolatedPageSources,
          contextPageRefs: drift === "missing-snapshot" ? undefined : run.config?.contextPageRefs,
        },
      })),
    }));
    await act(async () => root.render(<RunPanel runId="original" conversation latest controlsInComposer />));
    const button = host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!;
    expect(button.disabled).toBe(true);
    await act(async () => button.click());
    expect(retry).not.toHaveBeenCalled();
  },
);

it("updates original-source retry availability when its document changes after render", async () => {
  const { source, copy } = protectedContext();
  useStore.setState((state) => ({
    pages: normalizePages(orderedPages(state.pages).filter((page) => page.pageId !== copy.pageId)),
  }));
  await act(async () => root.render(<RunPanel runId="original" conversation latest controlsInComposer />));
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!.disabled).toBe(false);
  await act(async () =>
    useStore.setState((state) => ({
      pages: normalizePages(
        orderedPages(state.pages).map((page) =>
          page.pageId === source.pageId ? { ...page, documentEpoch: page.documentEpoch + 1 } : page,
        ),
      ),
    })),
  );
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!.disabled).toBe(true);
});

it("refuses a multi-source retry subset even when both old protected copies remain", async () => {
  protectedContext();
  useStore.setState((state) => ({ runs: state.runs.map((run) => ({ ...run, status: "failed" })) }));
  const second = makePage(3, {
    pageId: "second-source",
    ownedByRuntime: false,
    url: "https://second.test/",
    documentEpoch: 5,
    sessionId: "second-person-session",
  });
  const secondCopy = makePage(4, { pageId: "second-copy", ownedByRuntime: true, url: second.url });
  useStore.setState((state) => ({
    pages: normalizePages([...orderedPages(state.pages), secondCopy]),
    runs: state.runs.map((run) => ({
      ...run,
      pageIds: [...run.pageIds, secondCopy.pageId],
      config: {
        ...run.config,
        contextPageRefs: [
          ...run.config!.contextPageRefs!,
          {
            pageId: second.pageId,
            url: second.url,
            documentEpoch: second.documentEpoch,
            sessionId: second.sessionId,
          },
        ],
        isolatedPageSources: [
          ...run.config!.isolatedPageSources!,
          { sourcePageId: second.pageId, pageId: secondCopy.pageId, url: second.url },
        ],
      },
    })),
  }));
  await act(async () =>
    root.render(<RunPanel runId="original" conversation latest retryPageId="selected" controlsInComposer />),
  );
  expect(host.textContent).toContain("Original tabs are missing");
  expect(host.textContent).not.toContain("Retry in selected tab");
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!.disabled).toBe(true);
  expect(retry).not.toHaveBeenCalled();
});

it("retains failure recovery against the original source after its temporary copy closes", async () => {
  const { copy } = protectedContext();
  useStore.setState((state) => ({
    pages: normalizePages(orderedPages(state.pages).filter((page) => page.pageId !== copy.pageId)),
    runs: state.runs.map((run) => ({
      ...run,
      failure: { category: "unknown", message: "The turn stopped", action: "retry", retryable: true },
    })),
  }));
  await act(async () => root.render(<RunPanel runId="original" conversation latest controlsInComposer />));
  const button = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.textContent === "Retry turn",
  )!;
  expect(button).toBeDefined();
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(retry).toHaveBeenCalledExactlyOnceWith("original");
});

it.each(["session", "document"] as const)(
  "shows changed original %s context without calling a still-open tab unavailable",
  async (change) => {
    const { source, copy } = protectedContext();
    useStore.setState((state) => ({ runs: state.runs.map((run) => ({ ...run, status: "failed" })) }));
    useStore.setState((state) => ({
      pages: normalizePages(
        orderedPages(state.pages)
          .filter((page) => page.pageId !== copy.pageId)
          .map((page) =>
            page.pageId === source.pageId
              ? {
                  ...page,
                  sessionId: change === "session" ? "fresh-retired-session" : page.sessionId,
                  documentEpoch: change === "document" ? page.documentEpoch + 1 : page.documentEpoch,
                }
              : page,
          ),
      ),
    }));
    await act(async () =>
      root.render(
        <RunPanel runId="original" conversation latest retryPageId={source.pageId} controlsInComposer />,
      ),
    );
    expect(host.textContent).toContain("The original tab context changed");
    expect(host.textContent).not.toContain("The original tab is unavailable");
    const original = host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!;
    expect(original.disabled).toBe(true);
    await act(async () => original.click());
    expect(retry).not.toHaveBeenCalled();
    const replacement = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent === "Retry in selected tab",
    )!;
    expect(replacement.disabled).toBe(false);
    await act(async () => replacement.click());
    expect(retry).toHaveBeenCalledExactlyOnceWith("original", source.pageId);
  },
);

it("reports mixed missing and changed original tabs without offering a retry subset", async () => {
  const { source, copy } = protectedContext();
  useStore.setState((state) => ({ runs: state.runs.map((run) => ({ ...run, status: "failed" })) }));
  useStore.setState((state) => ({
    pages: normalizePages(
      orderedPages(state.pages)
        .filter((page) => page.pageId !== copy.pageId)
        .map((page) => (page.pageId === source.pageId ? { ...page, sessionId: "fresh-session" } : page)),
    ),
    runs: state.runs.map((run) => ({
      ...run,
      pageIds: [source.pageId, "missing-source"],
      config: { ...run.config, isolatedPageSources: undefined },
    })),
  }));
  await act(async () =>
    root.render(<RunPanel runId="original" conversation latest retryPageId="selected" controlsInComposer />),
  );
  expect(host.textContent).toContain("Original tabs are missing");
  expect(host.textContent).not.toContain("Retry in selected tab");
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!.disabled).toBe(true);
});

it("keeps a successful navigated answer complete and requires explicit fresh-context rerun instead of showing a failure", async () => {
  const { source, copy } = protectedContext();
  const targetUrl = "https://original.test/next";
  useStore.setState((state) => ({
    pages: normalizePages(
      orderedPages(state.pages)
        .filter((page) => page.pageId !== copy.pageId)
        .map((page) =>
          page.pageId === source.pageId ? { ...page, url: targetUrl, documentEpoch: 4 } : page,
        ),
    ),
    steps: {
      original: [
        {
          stepId: "navigation",
          runId: "original",
          pageId: source.pageId,
          op: "navigate",
          inputs: { url: targetUrl },
          startedAt: 1,
          outcome: {
            stepId: "navigation",
            op: "navigate",
            status: "ok",
            startedAt: 1,
            durationMs: 1,
            effect: "observed",
            receipt: {
              remoteConfirmed: false,
              uncertain: false,
              dispatchedBeforeTakeover: false,
              identity: { pageId: source.pageId, documentEpoch: 4 },
            },
          },
        },
      ],
    },
  }));
  await act(async () =>
    root.render(
      <RunPanel runId="original" conversation latest retryPageId={source.pageId} controlsInComposer />,
    ),
  );
  expect(host.textContent).toContain("Hello back");
  expect(host.textContent).not.toContain("The original tab context changed");
  expect(host.querySelector(".run-failure")).toBeNull();
  expect(host.querySelector(".conversation-context-note")?.textContent).toContain("current browser context");
  const originalRetry = host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!;
  expect(originalRetry.disabled).toBe(true);
  await act(async () => originalRetry.click());
  expect(retry).not.toHaveBeenCalled();
  const fresh = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Run again in selected tab",
  )!;
  await act(async () => fresh.click());
  expect(retry).toHaveBeenCalledExactlyOnceWith("original", source.pageId);
});

it("keeps completed multi-tab context guidance neutral without offering a partial rerun", async () => {
  useStore.setState((state) => ({
    runs: state.runs.map((run) => ({ ...run, pageIds: ["missing-one", "missing-two"] })),
  }));
  await act(async () =>
    root.render(<RunPanel runId="original" conversation latest retryPageId="selected" controlsInComposer />),
  );
  expect(host.textContent).toContain("This finished turn used 2 tabs");
  expect(host.textContent).not.toContain("Original tabs are missing");
  expect(host.querySelector(".run-failure")).toBeNull();
  expect(
    [...host.querySelectorAll("button")].some((button) => button.textContent === "Run again in selected tab"),
  ).toBe(false);
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!.disabled).toBe(true);
  expect(retry).not.toHaveBeenCalled();
});
