import { expect, it } from "vitest";
import { memoryContentSensitivityReason, memorySensitivityReason } from "@aux/contracts/memory-sensitivity";

it("rejects banking, health, login and account metadata while allowing ordinary articles", () => {
  expect(memorySensitivityReason("https://online.bank.example/news")).toBeTruthy();
  expect(memorySensitivityReason("https://example.test/patient/records")).toBeTruthy();
  expect(memorySensitivityReason("https://example.test/sign-in", "Welcome")).toBeTruthy();
  expect(memorySensitivityReason("https://example.test/news", "Your medical records")).toBeTruthy();
  expect(memorySensitivityReason("https://example.test/article", "Browser research")).toBeUndefined();
  expect(memorySensitivityReason("http://example.test/article")).toBeTruthy();
  expect(memorySensitivityReason("https://example.test/%zz")).toBeTruthy();
});

it("rejects high-confidence financial, health and credential content on neutral URLs", () => {
  expect(memoryContentSensitivityReason("Your account balance is $4,000.")).toBe("financial account content");
  expect(memoryContentSensitivityReason("Lab results are available for this patient.")).toBe("health record content");
  expect(memoryContentSensitivityReason("Enter your password to continue.")).toBe("credential or identity content");
  expect(memoryContentSensitivityReason("The coffee harvest begins in October. Farmers dry beans in the sun.")).toBeUndefined();
});
