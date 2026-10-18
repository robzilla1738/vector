// @vitest-environment jsdom
import { act, StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Select } from "./index";

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("keeps original options, native form value, change event and focus across controlled updates", async () => {
  const changed = vi.fn();
  const render = (labels: string[]) => (
    <form>
      <Select name="account" aria-label="Account" value="second" onChange={changed}>
        <optgroup label="Connected accounts">
          {labels.map((label) => (
            <option key={label} value={label === "First" ? "first" : "second"}>
              {label}
            </option>
          ))}
        </optgroup>
        <option value="unavailable" disabled>
          Disconnected account
        </option>
      </Select>
    </form>
  );
  await act(async () => root.render(render(["First", "Original long account label"])));
  const select = host.querySelector("select")!;
  const trigger = select.firstElementChild!;
  select.focus();
  await act(async () => root.render(render(["Updated long account label", "First"])));
  expect(host.querySelector("select")).toBe(select);
  expect(document.activeElement).toBe(select);
  expect(select.firstElementChild).toBe(trigger);
  expect(select.querySelectorAll("selectedcontent")).toHaveLength(1);
  expect(Array.from(select.options, (option) => option.text)).toEqual([
    "Updated long account label",
    "First",
    "Disconnected account",
  ]);
  expect(select.selectedOptions[0]?.text).toBe("Updated long account label");
  expect(new FormData(host.querySelector("form")!).get("account")).toBe("second");
  expect(changed).not.toHaveBeenCalled();
  const original = new Event("change", { bubbles: true });
  await act(async () => {
    select.value = "first";
    select.dispatchEvent(original);
  });
  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed.mock.calls[0]?.[0].nativeEvent).toBe(original);
  expect(select.options[2]?.disabled).toBe(true);
});

it("keeps uncontrolled selection while options change, and supports native reset", async () => {
  function Fixture({ extra }: { extra: boolean }) {
    const [selection, setSelection] = useState("");
    return (
      <form>
        <Select
          name="frequency"
          aria-label="Frequency"
          defaultValue="context"
          onChange={(event) => setSelection(event.currentTarget.value)}
        >
          <option value="off">Off</option>
          <option value="context">When context changes</option>
          {extra && <option value="five-minutes">Every 5 minutes</option>}
        </Select>
        <output>{selection}</output>
      </form>
    );
  }
  await act(async () => root.render(<Fixture extra={false} />));
  const select = host.querySelector("select")!;
  await act(async () => {
    select.value = "off";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => root.render(<Fixture extra />));
  expect(select.value).toBe("off");
  expect(host.querySelector("output")!.value).toBe("off");
  expect(select.options).toHaveLength(3);
  host.querySelector("form")!.reset();
  expect(select.value).toBe("context");
});

it("retires the exact native label and forwards old and replacement refs under StrictMode", async () => {
  const first = vi.fn(),
    second = vi.fn(),
    errors = vi.spyOn(console, "error");
  const render = (controlRef: typeof first) => (
    <StrictMode>
      <Select controlRef={controlRef} aria-label="Original control" defaultValue="one">
        <option value="one">One</option>
      </Select>
    </StrictMode>
  );
  await act(async () => root.render(render(first)));
  const select = host.querySelector("select")!;
  const retired = select.firstElementChild!;
  expect(first).toHaveBeenLastCalledWith(select);
  expect(select.querySelectorAll(":scope > button")).toHaveLength(1);
  expect(select.firstElementChild!.getAttribute("type")).toBe("button");
  await act(async () => root.render(render(second)));
  expect(first).toHaveBeenLastCalledWith(null);
  expect(second).toHaveBeenLastCalledWith(select);
  expect(retired.parentNode).toBeNull();
  expect(select.querySelectorAll(":scope > button")).toHaveLength(1);
  const current = select.firstElementChild!;
  await act(async () => root.render(null));
  expect(second).toHaveBeenLastCalledWith(null);
  expect(current.parentNode).toBeNull();
  expect(errors).not.toHaveBeenCalled();
});

it("leaves native listboxes and multiple selections intact when the control mode changes", async () => {
  const ref = vi.fn();
  const render = (multiple: boolean, size?: number) => (
    <Select controlRef={ref} aria-label="Choices" multiple={multiple} size={size}>
      <option value="one">One</option>
      <option value="two">Two</option>
    </Select>
  );
  await act(async () => root.render(render(true)));
  const select = host.querySelector("select")!;
  expect(select.querySelector("button")).toBeNull();
  select.options[0]!.selected = true;
  select.options[1]!.selected = true;
  expect(select.selectedOptions).toHaveLength(2);
  await act(async () => root.render(render(false, 2)));
  expect(select.size).toBe(2);
  expect(select.querySelector("button")).toBeNull();
  await act(async () => root.render(render(false)));
  expect(select.querySelectorAll("selectedcontent")).toHaveLength(1);
  const trigger = select.firstElementChild!;
  await act(async () => root.render(render(true)));
  expect(trigger.parentNode).toBeNull();
  expect(select.querySelector("button")).toBeNull();
  expect(select.options).toHaveLength(2);
  expect(ref).toHaveBeenLastCalledWith(select);
});
