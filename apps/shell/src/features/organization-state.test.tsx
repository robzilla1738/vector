// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterAll, afterEach, expect, it } from "vitest";
import { showOrganizationEditor, useOrganizationEditor } from "./organization-state";

const previousActEnvironment = Reflect.get(globalThis, "IS_REACT_ACT_ENVIRONMENT");
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const host = document.createElement("div"); document.body.append(host);
const root = createRoot(host);
afterEach(() => { act(() => { showOrganizationEditor(null); root.render(null); }); });
afterAll(() => { act(() => root.unmount()); host.remove(); Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", previousActEnvironment); });
function Consumer({ name }: { name: string }) {
  const editor = useOrganizationEditor();
  return <output data-consumer={name}>{editor ? `${editor.kind}:covered` : "uncovered"}</output>;
}
it("publishes one cover state to independent native and overlay consumers through editor transitions", () => {
  act(() => root.render(<><Consumer name="native" /><Consumer name="overlay" /></>));
  expect([...host.querySelectorAll("output")].map(item => item.textContent)).toEqual(["uncovered", "uncovered"]);
  act(() => showOrganizationEditor({ kind: "live-folder", folderId: "folder" }));
  expect([...host.querySelectorAll("output")].map(item => item.textContent)).toEqual(["live-folder:covered", "live-folder:covered"]);
  act(() => showOrganizationEditor({ kind: "archive" }));
  expect([...host.querySelectorAll("output")].map(item => item.textContent)).toEqual(["archive:covered", "archive:covered"]);
  act(() => showOrganizationEditor(null));
  expect([...host.querySelectorAll("output")].map(item => item.textContent)).toEqual(["uncovered", "uncovered"]);
});
