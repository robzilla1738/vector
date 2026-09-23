import { expect, it } from "vitest";
import { workspaceMemoryText } from "@aux/contracts/memory-context";
import type { WorkspaceMemory } from "@aux/contracts";

it("includes only active unexpired notes without letting one long note crowd out the rest", () => {
  const memory: WorkspaceMemory = { workspaceId: "w", revision: 1, content: "X".repeat(5000), items: [
    { itemId: "a", content: "Keep this", enabled: true, sourceUrl: "https://example.com/", createdAt: 1, updatedAt: 1 },
    { itemId: "b", content: "Expired", enabled: true, expiresAt: 50, createdAt: 1, updatedAt: 1 },
    { itemId: "c", content: "Paused", enabled: false, createdAt: 1, updatedAt: 1 },
  ] };
  const text = workspaceMemoryText(memory, 4000, 100);
  expect(text.length).toBeLessThanOrEqual(4000);
  expect(text).toContain("Keep this\nSource: https://example.com/");
  expect(text).not.toMatch(/Expired|Paused/);
  expect(workspaceMemoryText({ ...memory, enabled: false })).toBe("");
  expect(workspaceMemoryText({ workspaceId: "w", revision: 0, content: "Existing notes" })).toBe("Existing notes");
});


it("excludes sourced notes for an exact site without conflating subdomains or ports", () => {
  const memory: WorkspaceMemory = { workspaceId: "w", revision: 1, content: "Overview", excludedOrigins: ["https://example.com"], items: [
    { itemId: "a", content: "Excluded note", enabled: true, sourceUrl: "https://example.com/path?q=1", createdAt: 1, updatedAt: 1 },
    { itemId: "b", content: "Other subdomain", enabled: true, sourceUrl: "https://docs.example.com/path", createdAt: 1, updatedAt: 1 },
    { itemId: "c", content: "Other port", enabled: true, sourceUrl: "https://example.com:8443/path", createdAt: 1, updatedAt: 1 },
    { itemId: "d", content: "Manual preference", enabled: true, createdAt: 1, updatedAt: 1 },
  ] };
  const text = workspaceMemoryText(memory);
  expect(text).not.toContain("Excluded note");
  expect(text).toContain("Other subdomain");
  expect(text).toContain("Other port");
  expect(text).toContain("Manual preference");
  expect(text).toContain("Overview");
});
