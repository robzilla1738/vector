import { describe, expect, it } from "vitest";
import { observedCategory } from "../../apps/runtime/src/safety/observed-target.js";

const click = { id: "click", op: "click" as const, target: "e1" };
const login = {
  origin: "https://example.test",
  tag: "button",
  type: "submit",
  autocomplete: "",
  name: "Sign in",
  form: {
    action: "https://example.test/login",
    method: "post",
    fields: [{ type: "password", autocomplete: "current-password" }],
  },
};
describe("live target classification", () => {
  it("recognizes a resolved login submit, without treating arbitrary password forms or labels as login", () => {
    expect(observedCategory(click, login)).toBe("login");
    expect(
      observedCategory(click, { ...login, form: { ...login.form, action: "https://other.test/login" } }),
    ).toBeUndefined();
    expect(observedCategory(click, { ...login, name: "Save" })).toBeUndefined();
    expect(observedCategory(click, { ...login, form: { ...login.form, method: "get" } })).toBeUndefined();
    expect(observedCategory(click, { ...login, type: "button" })).toBeUndefined();
  });
  it("escalates protected and consequential targets even when a login label is present", () => {
    expect(
      observedCategory(click, {
        ...login,
        form: { ...login.form, fields: [{ type: "password", autocomplete: "new-password" }] },
      }),
    ).toBe("password_change");
    expect(
      observedCategory(
        { id: "fill", op: "fill", target: "e1", value: "synthetic" },
        { ...login, tag: "input", type: "password", autocomplete: "current-password" },
      ),
    ).toBe("credential");
    expect(observedCategory(click, { ...login, autocomplete: "one-time-code" })).toBe("two_factor");
    expect(observedCategory(click, { ...login, autocomplete: "cc-number" })).toBe("payment");
    expect(observedCategory(click, { ...login, name: "Send message" })).toBe("send");
    expect(observedCategory(click, { ...login, name: "Delete account" })).toBe("delete");
    expect(observedCategory(click, { ...login, challenge: "captcha" })).toBe("captcha");
    expect(
      observedCategory({ id: "fill", op: "fillCredential", passwordSelector: "input[type=password]" }, login),
    ).toBe("credential");
  });
});
