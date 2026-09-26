import { expect, it } from "vitest";
import { conversationMarkdown } from "./conversation-export";

it("exports visible conversation provenance without hidden context, source paths, or active markup", () => {
  const output = conversationMarkdown({
    chatId: "chat-1", title: "Research <script>bad()</script>", generatedAt: 0,
    runs: [{ runId: "run-1", goal: "Compare *tools*", status: "completed", pageIds: ["page-1"], config: { chatId: "chat-1", context: "HIDDEN_PRIVATE_CONTEXT", contextAttachmentIds: ["doc-1"], contextWorkspaceId: "workspace-1", contextWorkspaceRevision: 2 }, result: { answer: "Use <img src=x onerror=bad()>" }, createdAt: 1 }],
    attachments: [{ attachmentId: "doc-1", filename: "brief.md", excerpt: "PRIVATE DOCUMENT BODY", byteLength: 20, createdAt: 1, included: true }],
    artifacts: [{ artifactId: "artifact-1", runId: "run-1", filename: "report.md", mediaType: "text/markdown", excerpt: "PRIVATE ARTIFACT BODY", byteLength: 10, createdAt: 1, turnGoal: "Compare", included: true }],
    sources: [{ sourceId: "observation-1", runId: "run-1", pageId: "page-1", profileId: "work-profile", url: "https://research.example.test/report", title: "Research report", observedAt: 2, documentEpoch: 1, revision: 3 }],
    workspace: { workspaceId: "workspace-1", name: "Research", createdAt: 1 }, memory: { workspaceId: "workspace-1", content: "PRIVATE MEMORY BODY", revision: 2 },
  });
  expect(output).toContain("# Aux conversation");
  expect(output).toContain("brief.md");
  expect(output).toContain("artifact-1");
  expect(output).toContain("Research report");
  expect(output).toContain("https://research.example.test/report");
  expect(output).toContain("observation-1 revision 3");
  expect(output).toContain("browser Profile work-profile");
  expect(output).toContain("workspace-1 revision 2");
  expect(output).not.toContain("HIDDEN_PRIVATE_CONTEXT");
  expect(output).not.toContain("PRIVATE DOCUMENT BODY");
  expect(output).not.toContain("PRIVATE ARTIFACT BODY");
  expect(output).not.toContain("PRIVATE MEMORY BODY");
  expect(output).not.toContain("<script>");
  expect(output).not.toContain("<img");
});
