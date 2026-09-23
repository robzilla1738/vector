// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { collectObservation } from "../../packages/chromium-driver/src/observe-script";

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it("removes credential values before a raw observation leaves the page", () => {
  // Fixture identifiers contain only CSS-safe characters; jsdom lacks CSS.escape.
  vi.stubGlobal("CSS", {escape:(value:string)=>value});
  document.body.innerHTML = `<label>Password<input id="password" type="PASSWORD" value="synthetic-password-123"></label>
    <input id="shown" type="text" autocomplete="section-login current-password" value="synthetic-revealed-password">
    <input id="otp" autocomplete="one-time-code" value="938271">
    <input id="empty" type="password">
    <input id="ordinary" aria-label="Search" value="ordinary search">
    <div id="shadow"></div>`;
  const shadow = document.querySelector("#shadow")!.attachShadow({mode:"open"});
  shadow.innerHTML = '<input type="password" value="synthetic-shadow-secret">';
  document.querySelector<HTMLInputElement>("#password")!.setCustomValidity("synthetic-password-123 is invalid");
  Object.defineProperty(document.body,"innerText",{configurable:true,value:"Sign in synthetic-revealed-password 938271"});
  vi.spyOn(Element.prototype,"getBoundingClientRect").mockReturnValue({x:0,y:0,left:0,top:0,right:120,bottom:32,width:120,height:32,toJSON:()=>({})});
  const result = collectObservation({maxElements:30,maxTextChars:2000,frameKey:"main",refStart:1});
  const serialized = JSON.stringify(result);
  for (const secret of ["synthetic-password-123","synthetic-revealed-password","938271","synthetic-shadow-secret"]) expect(serialized).not.toContain(secret);
  expect(serialized).toContain("ordinary search");
  expect(result.elements.filter(element => element.value === "{redacted}")).toHaveLength(4);
  expect(result.formFields.find(field => field.name === undefined && field.type === "password" && field.value === "{redacted}")?.valid).toBe(false);
  expect(result.formFields.find(field => field.type === "password" && field.value === "")?.value).toBe("");
});

it("redacts echoed credential text before observation sections truncate it", () => {
  vi.stubGlobal("CSS", {escape:(value:string)=>value});
  const secret = "synthetic-long-credential-".repeat(30);
  document.body.innerHTML = '<input id="secret" type="password"><h1></h1><button></button><table><caption></caption><tr><th>Result</th></tr><tr><td></td></tr></table><div id="host"></div>';
  document.querySelector<HTMLInputElement>("#secret")!.value = secret;
  for (const selector of ["h1", "button", "caption", "td"]) document.querySelector(selector)!.textContent = secret;
  document.querySelector("button")!.setAttribute("aria-label", secret);
  document.querySelector("#host")!.attachShadow({mode:"open"}).textContent = secret;
  Object.defineProperty(document.body,"innerText",{configurable:true,value:secret});
  vi.spyOn(Element.prototype,"getBoundingClientRect").mockReturnValue({x:0,y:0,left:0,top:0,right:120,bottom:32,width:120,height:32,toJSON:()=>({})});
  const result = collectObservation({maxElements:30,maxTextChars:40,frameKey:"main",refStart:1});
  expect(JSON.stringify(result)).not.toContain("synthetic-long-credential");
  expect(result.headings).toEqual(["{redacted}"]);
  expect(result.tables[0].rows).toEqual([["{redacted}"]]);
  expect(result.elements.find(element => element.tag === "button")?.name).toBe("{redacted}");
});
