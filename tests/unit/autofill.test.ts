/// <reference lib="dom" />
// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { autofillScript, hasAutofillData } from "../../apps/desktop/main/autofill.js";

const profile = {
  name: "Ada Lovelace", email: "ada@example.com", phone: "+1 555 0100",
  organization: "Analytical Engines", street: "12 Engine Way", city: "London",
  region: "London", postal: "N1 9GU", country: "United Kingdom",
};
const fill = (p = profile): number =>
  // oxlint-disable-next-line no-eval — exercising the real serialized script.
  (0, eval)(autofillScript(p)) as number;

afterEach(() => { document.body.innerHTML = ""; });

it("detects saved data honestly", () => {
  expect(hasAutofillData(undefined)).toBe(false);
  expect(hasAutofillData({ name: "  " })).toBe(false);
  expect(hasAutofillData({ email: "a@b.c" })).toBe(true);
});

it("fills autocomplete-tagged fields and leaves user input untouched", () => {
  document.body.innerHTML = `<form>
    <input name="mail" autocomplete="email">
    <input name="town" autocomplete="address-level2" value="Paris">
    <input name="zip" autocomplete="postal-code">
    <select autocomplete="country-name"><option value="">Select…</option><option value="US">United States</option><option value="UK">United Kingdom</option></select>
  </form>`;
  expect(fill()).toBe(3);
  expect((document.querySelector('[name="mail"]') as HTMLInputElement).value).toBe("ada@example.com");
  expect((document.querySelector('[name="town"]') as HTMLInputElement).value).toBe("Paris");
  expect((document.querySelector('[name="zip"]') as HTMLInputElement).value).toBe("N1 9GU");
  expect((document.querySelector("select") as HTMLSelectElement).value).toBe("UK");
});

it("splits given/family names and matches heuristic field names", () => {
  document.body.innerHTML = `<form>
    <input autocomplete="given-name"><input autocomplete="family-name">
    <input name="phone_number"><input placeholder="Company">
    <input name="q" placeholder="Search products">
  </form>`;
  expect(fill()).toBe(4);
  const inputs = Array.from(document.querySelectorAll("input"));
  expect(inputs[0]!.value).toBe("Ada");
  expect(inputs[1]!.value).toBe("Lovelace");
  expect(inputs[2]!.value).toBe("+1 555 0100");
  expect(inputs[3]!.value).toBe("Analytical Engines");
  expect(inputs[4]!.value).toBe("");
});

it("never fills password, payment, account or search fields", () => {
  document.body.innerHTML = `<form>
    <input type="password" name="password">
    <input name="username" autocomplete="username">
    <input name="cc" autocomplete="cc-number">
    <input name="card-name" placeholder="Name on card">
    <input name="login" autocomplete="off" placeholder="Account email">
  </form>`;
  expect(fill()).toBe(0);
  expect(Array.from(document.querySelectorAll("input")).every(field => !field.value)).toBe(true);
});

it("fires input and change events so controlled components notice", () => {
  document.body.innerHTML = `<input autocomplete="email">`;
  const field = document.querySelector("input")!;
  const events: string[] = [];
  field.addEventListener("input", () => events.push("input"));
  field.addEventListener("change", () => events.push("change"));
  expect(fill()).toBe(1);
  expect(events).toEqual(["input", "change"]);
});

it("returns zero on pages with no matching fields", () => {
  document.body.innerHTML = `<p>No form here.</p>`;
  expect(fill()).toBe(0);
});
