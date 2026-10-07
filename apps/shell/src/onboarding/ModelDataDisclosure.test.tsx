// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ModelDataDisclosure } from "./ModelDataDisclosure";

it("shows all provider routing, cost and credential disclosures before acknowledgment, retaining them afterward", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(<ModelDataDisclosure reviewed={false} />));
  expect(container.querySelector("details")).toBeNull();
  const required = [
    "selected page context",
    "attached material",
    "Usage may cost money",
    "OS credential store",
    "Gateway routes requests to that provider",
    "BYOK uses your chosen provider account",
  ];
  for (const text of required) expect(container.textContent).toContain(text);
  const disclosure = [...container.querySelectorAll("p")].map((node) => node.textContent);
  act(() => root.render(<ModelDataDisclosure reviewed />));
  const details = container.querySelector("details")!;
  expect(details.open).toBe(false);
  expect(details.querySelector("summary")?.textContent).toBe("Model data use and costs");
  expect([...details.querySelectorAll("p")].map((node) => node.textContent)).toEqual(disclosure);
  act(() => {
    details.open = true;
  });
  expect(details.open).toBe(true);
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
