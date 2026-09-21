// @vitest-environment jsdom
import { expect, it } from "vitest";
import { rememberSiteControlsOpener, restoreSiteControlsOpener } from "./site-controls-opener";

it("restores the remembered site-controls opener", () => {
  const opener = document.createElement("button");
  opener.setAttribute("aria-label", "Site controls");
  document.body.append(opener);
  opener.focus();
  rememberSiteControlsOpener(opener);
  const other = document.createElement("button");
  document.body.append(other);
  other.focus();
  expect(document.activeElement).toBe(other);
  restoreSiteControlsOpener();
  expect(document.activeElement).toBe(opener);
});
