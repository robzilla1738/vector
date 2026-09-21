// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { extractElements } from "../../packages/engine-client/src/extract-script";

afterEach(() => document.body.replaceChildren());
it("masks protected attributes and text without changing the page", () => {
  document.body.innerHTML = '<input type="PASSWORD" value="synthetic-password"><input autocomplete="one-time-code" value="739152"><p>ordinary text</p><textarea autocomplete="new-password">synthetic-new-password</textarea><div id="host"></div>';
  const shadow = document.querySelector("#host")!.attachShadow({mode:"open"});
  shadow.innerHTML = '<input autocomplete="current-password" value="synthetic-shadow-password"><b>Shadow content</b>';
  const inputs = Array.from(document.querySelectorAll("input"));
  expect(extractElements(inputs, "value")).toEqual(["{redacted}", "{redacted}"]);
  expect(extractElements(inputs, "type")).toEqual(["PASSWORD", null]);
  const text = extractElements([document.body]);
  expect(text[0]).toContain("ordinary text");
  expect(text[0]).toContain("Shadow content");
  expect(text[0]).not.toContain("synthetic-");
  expect(document.querySelector<HTMLInputElement>("input")!.value).toBe("synthetic-password");
  expect(extractElements([], "value")).toEqual([]);
});
it("redacts whole-page echoes before the text limit", () => {
  const secret = "synthetic-very-long-secret-".repeat(200);
  const input = document.createElement("input"); input.type="password"; input.value=secret;
  document.body.append(input);
  Object.defineProperty(document.body,"innerText",{configurable:true,value:`Before ${secret} after`});
  expect(extractElements(null)).toEqual(["Before {redacted} after"]);
});
