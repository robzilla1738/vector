// @vitest-environment jsdom
import { expect, it } from "vitest";
import { rememberSiteControlsOpener, siteControlsOpener } from "./site-controls-opener";

it("returns the remembered site-controls opener for dialog focus restoration", () => {
  const opener = document.createElement("button");
  opener.setAttribute("aria-label", "Site controls");
  document.body.append(opener);
  opener.focus();
  rememberSiteControlsOpener(opener);
  expect(siteControlsOpener()).toBe(opener);
});
