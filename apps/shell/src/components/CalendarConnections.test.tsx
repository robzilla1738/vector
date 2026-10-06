// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CalendarConnections } from "./CalendarConnections";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../store", () => ({ call: rpc }));
vi.mock("../bridge", () => ({ bridge: { openExternal: vi.fn() } }));

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const account = (connectionId: string, accountKey: string) => ({
  connectionId,
  provider: "google",
  accountKey,
  label: accountKey,
  state: "active",
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  createdAt: 1,
  updatedAt: 1,
});
const alice = account("alice", "alice@example.test");
const bob = account("bob", "bob@example.test");

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  rpc.mockReset();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("never displays an older account read after the owner switches accounts", async () => {
  let finishAlice!: (value: unknown) => void;
  rpc.mockImplementation(async (method: string, params: { connectionId?: string }) => {
    if (method === "calendar.connections.list") return { available: true, connections: [alice, bob] };
    if (method === "calendar.events.list" && params.connectionId === "alice")
      return new Promise((resolve) => {
        finishAlice = resolve;
      });
    if (method === "calendar.events.list" && params.connectionId === "bob")
      return {
        events: [
          {
            eventId: "bob-event",
            title: "Bob private meeting",
            start: "2026-09-29T10:00:00Z",
            end: "2026-09-29T11:00:00Z",
            source: {
              connectionId: "bob",
              accountKey: bob.accountKey,
              calendarId: bob.accountKey,
              fetchedAt: 1,
            },
          },
        ],
        fetchedAt: 1,
      };
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<CalendarConnections />));
  await act(async () => {
    await Promise.resolve();
  });
  const show = () =>
    [...host.querySelectorAll("button")].find((button) => button.textContent === "Show next 7 days")!;
  await act(async () => {
    show().click();
  });
  const select = host.querySelector<HTMLSelectElement>('select[aria-label="Calendar account"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")!.set!.call(select, "bob");
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => {
    finishAlice({
      events: [
        {
          eventId: "alice-event",
          title: "Alice private meeting",
          start: "2026-09-29T10:00:00Z",
          end: "2026-09-29T11:00:00Z",
          source: {
            connectionId: "alice",
            accountKey: alice.accountKey,
            calendarId: alice.accountKey,
            fetchedAt: 1,
          },
        },
      ],
      fetchedAt: 1,
    });
    await Promise.resolve();
  });
  expect(host.textContent).not.toContain("Alice private meeting");
  await act(async () => {
    show().click();
    await Promise.resolve();
  });
  expect(host.textContent).toContain("Bob private meeting");
  expect(host.textContent).toContain("Google Calendar read-only");
});
