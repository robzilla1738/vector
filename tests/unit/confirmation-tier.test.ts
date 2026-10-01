import { expect, it } from "vitest";
import { CONFIRMATION_TIERS, confirmationTierFor, stricterConfirmation } from "../../apps/runtime/src/safety/confirmation.js";

it("keeps consequence floors immutable and independent of site allow rules", () => {
  expect(Object.isFrozen(CONFIRMATION_TIERS)).toBe(true);
  for (const category of ["delete", "purchase", "payment", "send", "post", "credential", "submit", "external_tool"] as const)
    expect(stricterConfirmation(confirmationTierFor({ category, effect: "write", dataClasses: [] }), "none")).toBe("action");
  expect(confirmationTierFor({ category: "upload", effect: "write", dataClasses: ["file"] })).toBe("preapprovable");
  for (const category of ["read", "navigate", "input", "download"] as const)
    expect(confirmationTierFor({ category, effect: "read", dataClasses: [] })).toBe("none");
  expect(confirmationTierFor({ category: "input", effect: "write", dataClasses: ["credential"] })).toBe("action");
  expect(confirmationTierFor({ category: "read", effect: "destructive", dataClasses: [] })).toBe("action");
  expect(confirmationTierFor({ category: "read", effect: "read", dataClasses: [], recipient: "service" })).toBe("action");
  expect(confirmationTierFor({ category: "read", effect: "write", dataClasses: [], action: "send" })).toBe("action");
  expect(confirmationTierFor({ category: "cookie", effect: "write", dataClasses: [], action: "delete" })).toBe("action");
  expect(confirmationTierFor({ category: "read", effect: "write", dataClasses: [], action: "submit" })).toBe("action");
  expect(confirmationTierFor({ category: "login", effect: "write", dataClasses: [], action: "submit" })).toBe("preapprovable");
  expect(confirmationTierFor({ category: "password_change", effect: "write", dataClasses: [], action: "delete" })).toBe("handoff");
  expect(confirmationTierFor({ category: "captcha", effect: "write", dataClasses: [], action: "send" })).toBe("handoff");
  expect(stricterConfirmation("action", "handoff")).toBe("handoff");
});
