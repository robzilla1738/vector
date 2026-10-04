// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AutofillSetting } from "./AutofillSetting";
import { PasswordsAutofillSettings } from "../settings/sections/PasswordsAutofill";
import { invokeScopedControl } from "../scoped-control-commands";
const native = vi.hoisted(() => ({
  windowId: "main",
  windowKind: "normal",
  privateMode: false,
  autofillProfile: vi.fn(),
  setAutofillProfile: vi.fn(),
}));
const errors = vi.hoisted(() => vi.fn());
vi.mock("../bridge", () => ({ inNativeHost: true, bridge: native }));
vi.mock("../commands", () => ({
  executeCommand: (id: string, invocation: any) => {
    try {
      return Promise.resolve(invokeScopedControl(id, invocation));
    } catch (reason) {
      return Promise.reject(reason);
    }
  },
}));
vi.mock("../store", () => ({
  errToast: errors,
  toast: vi.fn(),
  useStore: Object.assign(() => ({}), { getState: () => ({}) }),
}));
vi.mock("./PasswordTransferSetting", () => ({ PasswordTransferSetting: () => null }));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const save = vi.fn();
let profile: any, active: boolean;
async function render(parent = false) {
  await act(async () =>
    root.render(
      parent ? (
        <PasswordsAutofillSettings active={active} settings={{ autofill: profile }} onSave={save} />
      ) : (
        <AutofillSetting active={active} value={profile} onSave={save} />
      ),
    ),
  );
}
const button = (name: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent?.trim() === name)!;
async function click(name: string) {
  await act(async () => button(name).click());
}
async function edit(text: string) {
  const input = host.querySelector<HTMLInputElement>('input[autocomplete="name"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function submit() {
  await act(async () =>
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
}
const held = <T,>() => {
  let resolve!: (v: T) => void, reject!: (e: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 36 }] as any);
  native.windowId = "main";
  native.windowKind = "normal";
  native.privateMode = false;
  native.autofillProfile.mockReset().mockResolvedValue(null);
  native.setAutofillProfile.mockReset().mockResolvedValue(true);
  save.mockReset().mockResolvedValue(true);
  errors.mockReset();
  profile = undefined;
  active = true;
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
it("registers focused Edit/Cancel and actual form submission, keeping original trimming and fields", async () => {
  await render();
  button("Add personal info").focus();
  await act(async () => invokeScopedControl("edit-personal-info"));
  expect(host.querySelectorAll("input")).toHaveLength(9);
  await edit("  Ada  ");
  await submit();
  expect(save).toHaveBeenCalledWith({ name: "Ada" });
  expect(host.querySelector("form")).toBeNull();
  await click("Add personal info");
  button("Cancel").focus();
  await act(async () => invokeScopedControl("cancel-personal-info"));
  expect(host.querySelector("form")).toBeNull();
  expect(save).toHaveBeenCalledTimes(1);
});
it("preserves a false save ACK, original draft and active full rejection", async () => {
  await render();
  await click("Add personal info");
  await edit("Ada");
  save.mockResolvedValueOnce(false);
  await submit();
  expect(host.textContent).toContain("wasn’t saved");
  expect(host.querySelector<HTMLInputElement>('input[autocomplete="name"]')!.value).toBe("Ada");
  const reason = new Error("complete native diagnostic <unsafe>");
  save.mockRejectedValueOnce(reason);
  await submit();
  expect(host.querySelector('[role="alert"]')!.textContent).toBe(reason.message);
  expect(errors).toHaveBeenCalledWith(reason);
  expect(host.querySelector("unsafe")).toBeNull();
});
it("reserves same-tick saves and returns the original result after window/private ABA retirement", async () => {
  await render();
  await click("Add personal info");
  await edit("Ada");
  const pending = held<boolean>();
  save.mockReturnValueOnce(pending.promise);
  button("Save").focus();
  let completion: any;
  await act(async () => {
    completion = invokeScopedControl("save-personal-info");
    expect(() => invokeScopedControl("save-personal-info")).toThrow("current");
  });
  native.privateMode = true;
  await render();
  native.privateMode = false;
  await render();
  await click("Add personal info");
  await edit("New draft");
  await act(async () => pending.resolve(true));
  expect(await completion).toBe(true);
  expect(host.querySelector<HTMLInputElement>('input[autocomplete="name"]')!.value).toBe("New draft");
  expect(errors).not.toHaveBeenCalled();
});
it("retains original rejection without publishing stale diagnostics after changed-value retirement", async () => {
  await render();
  await click("Add personal info");
  const pending = held<boolean>();
  save.mockReturnValueOnce(pending.promise);
  button("Save").focus();
  let completion: any;
  await act(async () => {
    completion = invokeScopedControl("save-personal-info");
  });
  const reason = new Error("old private text");
  const observed = completion.catch((e: unknown) => e);
  profile = { name: "New value" };
  await render();
  await act(async () => pending.reject(reason));
  expect(await observed).toBe(reason);
  expect(host.textContent).not.toContain(reason.message);
  expect(errors).not.toHaveBeenCalled();
});
it("recovers actual synchronous initial native transport throw through original Retry", async () => {
  native.autofillProfile.mockImplementationOnce(() => {
    throw new Error("transport unavailable <full>");
  });
  await render(true);
  expect(host.querySelector('[role="alert"]')!.textContent).toBe("transport unavailable <full>");
  expect(button("Retry").dataset.commandId).toBe("retry-personal-info");
  await click("Retry");
  expect(native.autofillProfile).toHaveBeenCalledTimes(2);
  expect(button("Add personal info")).toBeTruthy();
});
it("keeps a native setter false ACK and original editable personal info", async () => {
  await render(true);
  await click("Add personal info");
  await edit("Ada");
  native.setAutofillProfile.mockResolvedValueOnce(false);
  await submit();
  expect(native.setAutofillProfile).toHaveBeenCalledWith({ name: "Ada" });
  expect(host.textContent).toContain("Chromium could not save personal info. Try again.");
  expect(host.querySelector<HTMLInputElement>('input[autocomplete="name"]')!.value).toBe("Ada");
  expect(save).not.toHaveBeenCalled();
});
it("retires held native read on committed window A-B-A and never delivers original protected info", async () => {
  const old = held<any>();
  native.autofillProfile.mockReturnValueOnce(old.promise).mockResolvedValue({ name: "New" });
  await render(true);
  native.windowId = "other";
  await render(true);
  native.windowId = "main";
  await render(true);
  await act(async () => old.resolve({ name: "Old private" }));
  await click("Edit");
  expect(host.querySelector<HTMLInputElement>('input[autocomplete="name"]')!.value).toBe("New");
});
it("imports only original prior Aux data on native ACK and does not clear settings after retirement", async () => {
  profile = { name: "Legacy" };
  await render(true);
  const pending = held<boolean>();
  native.setAutofillProfile.mockReturnValueOnce(pending.promise);
  await click("Import prior Aux personal info into Chromium");
  expect(native.setAutofillProfile).toHaveBeenCalledWith(profile);
  active = false;
  await render(true);
  active = true;
  await render(true);
  await act(async () => pending.resolve(true));
  expect(save).not.toHaveBeenCalled();
  expect(errors).not.toHaveBeenCalled();
});

it("refuses Private initial reads and original foreign focus before any edit effect", async () => {
  native.privateMode = true;
  await render(true);
  expect(native.autofillProfile).not.toHaveBeenCalled();
  expect(host.textContent).toContain("regular Aux window");
  native.privateMode = false;
  await render();
  const foreign = document.createElement("button");
  host.append(foreign);
  foreign.focus();
  expect(() => invokeScopedControl("edit-personal-info")).toThrow("focused");
  expect(host.querySelector("form")).toBeNull();
  expect(save).not.toHaveBeenCalled();
});
it("preserves active import false refusal and only clears prior data after exact native success", async () => {
  profile = { name: "Legacy" };
  await render(true);
  native.setAutofillProfile.mockResolvedValueOnce(false);
  await click("Import prior Aux personal info into Chromium");
  expect(host.textContent).toContain("Chromium could not import personal info.");
  expect(save).not.toHaveBeenCalled();
  await click("Import prior Aux personal info into Chromium");
  expect(save).toHaveBeenCalledWith({ autofill: {} });
  expect(button("Edit")).toBeTruthy();
});

it("retains original rejected import identity without stale error after changed prior-data props", async () => {
  profile = { name: "Old" };
  await render(true);
  const pending = held<boolean>();
  native.setAutofillProfile.mockReturnValueOnce(pending.promise);
  button("Import prior Aux personal info into Chromium").focus();
  let completion: any;
  await act(async () => {
    completion = invokeScopedControl("import-prior-personal-info");
  });
  const reason = new Error("original old profile diagnostic");
  const observed = completion.catch((e: unknown) => e);
  profile = { name: "New" };
  await render(true);
  await act(async () => pending.reject(reason));
  expect(await observed).toBe(reason);
  expect(host.textContent).not.toContain(reason.message);
  expect(errors).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});

it("preserves undefined setter success and original synchronous rejected completion", async () => {
  await render();
  await click("Add personal info");
  await edit("  Ada  ");
  save.mockResolvedValueOnce(undefined);
  button("Save").focus();
  let completion: Promise<unknown>;
  await act(async () => { completion = invokeScopedControl("save-personal-info") as Promise<unknown>; });
  expect(await completion!).toBeUndefined();
  expect(save).toHaveBeenLastCalledWith({ name: "Ada" });
  expect(host.querySelector("form")).toBeNull();
  await click("Add personal info");
  await edit("Kept draft");
  const reason = new Error("original synchronous setter failure");
  save.mockImplementationOnce(() => { throw reason; });
  button("Save").focus();
  let observed: Promise<unknown>;
  await act(async () => {
    observed = (invokeScopedControl("save-personal-info") as Promise<unknown>).catch((error) => error);
  });
  expect(await observed!).toBe(reason);
  expect(host.querySelector('[role="alert"]')!.textContent).toBe(reason.message);
  expect(host.querySelector<HTMLInputElement>('input[autocomplete="name"]')!.value).toBe("Kept draft");
  expect(button("Save").disabled).toBe(false);
});

it("checks live normal-kind admission before dispatch and a held completion without rerender", async () => {
  await render();
  await click("Add personal info");
  await edit("Retained original draft");
  button("Save").focus();
  native.windowKind = "little";
  expect(() => invokeScopedControl("save-personal-info")).toThrow("current");
  expect(save).not.toHaveBeenCalled();
  native.windowKind = "normal";
  const pending = held<unknown>();
  save.mockReturnValueOnce(pending.promise);
  let completion: Promise<unknown>;
  await act(async () => { completion = invokeScopedControl("save-personal-info") as Promise<unknown>; });
  const originalInput = host.querySelector<HTMLInputElement>('input[autocomplete="name"]')!;
  native.windowKind = "little";
  await act(async () => pending.resolve(undefined));
  expect(await completion!).toBeUndefined();
  expect(originalInput.value).toBe("Retained original draft");
  expect(originalInput.isConnected).toBe(false);
  expect(button("Add personal info").disabled).toBe(true);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(errors).not.toHaveBeenCalled();
});
