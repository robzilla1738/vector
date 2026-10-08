import { expect, it } from "vitest";
import { makeRun } from "./mock/fixtures";
import type { RunMessage } from "@aux/contracts";
import { conversationMarkdown } from "./conversation-export";

it("exports visible conversation provenance without hidden context, source paths, or active markup", () => {
  const output = conversationMarkdown({
    chatId: "chat-1",
    title: "Research <script>bad()</script>",
    generatedAt: 0,
    runs: [
      {
        runId: "run-1",
        goal: "Compare *tools*",
        status: "completed",
        pageIds: ["page-1"],
        config: {
          chatId: "chat-1",
          context: "HIDDEN_PRIVATE_CONTEXT",
          contextAttachmentIds: ["doc-1"],
          contextWorkspaceId: "workspace-1",
          contextWorkspaceRevision: 2,
        },
        result: { answer: "Use <img src=x onerror=bad()>" },
        createdAt: 1,
      },
    ],
    attachments: [
      {
        attachmentId: "doc-1",
        filename: "brief.md",
        excerpt: "PRIVATE DOCUMENT BODY",
        byteLength: 20,
        createdAt: 1,
        included: true,
      },
    ],
    artifacts: [
      {
        artifactId: "artifact-1",
        runId: "run-1",
        filename: "report.md",
        mediaType: "text/markdown",
        excerpt: "PRIVATE ARTIFACT BODY",
        byteLength: 10,
        createdAt: 1,
        turnGoal: "Compare",
        included: true,
      },
    ],
    sources: [
      {
        sourceId: "observation-1",
        runId: "run-1",
        pageId: "page-1",
        profileId: "work-profile",
        url: "https://research.example.test/report",
        title: "Research report",
        observedAt: 2,
        documentEpoch: 1,
        revision: 3,
      },
    ],
    workspace: { workspaceId: "workspace-1", name: "Research", createdAt: 1 },
    memory: { workspaceId: "workspace-1", content: "PRIVATE MEMORY BODY", revision: 2 },
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

it("exports complete rich answers and delivered corrections while omitting inert or hidden context", () => {
  const correction: RunMessage = {
    messageId: "correction",
    chatId: "chat",
    targetRunId: "run",
    deliveryRunId: "run",
    mode: "steer",
    status: "delivered",
    text: "Use the revised budget",
    pageIds: [],
    contextPageRefs: [],
    expectedRevision: 0,
    createdAt: 1,
    updatedAt: 2,
  };
  const report = `## Findings\n\n**Important** [source](https://example.test/research)\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n${"A long paragraph. ".repeat(1500)}REPORT END`;
  const output = conversationMarkdown({
    chatId: "chat",
    title: "Research",
    generatedAt: 0,
    runs: [
      makeRun({
        runId: "run",
        config: { chatId: "chat", implementation: "agent-loop" },
        status: "completed",
        result: {
          report,
          textProposal: "HIDDEN_INSERT_PROPOSAL",
          ...Object.fromEntries(Array.from({ length: 55 }, (_, i) => [`field_${i}`, i])),
        },
      }),
    ],
    messages: [
      correction,
      { ...correction, messageId: "undelivered", status: "accepted", text: "NOT_SENT" },
      { ...correction, messageId: "foreign", chatId: "another-chat", text: "FOREIGN" },
    ],
    attachments: [],
    artifacts: [],
    sources: [],
    workspace: null,
    memory: null,
  });
  expect(output).toContain("## Findings");
  expect(output).toContain("**Important** [source](https://example.test/research)");
  expect(output).toContain("REPORT END");
  expect(output).toContain("A long paragraph. ".repeat(1500));
  expect(output).toContain("| A");
  expect(output).toContain("**field 54:**\n\n54");
  expect(output).toContain("**You — changed task:** Use the revised budget");
  for (const secret of ["HIDDEN_INSERT_PROPOSAL", "NOT_SENT", "FOREIGN"])
    expect(output).not.toContain(secret);
});

it("keeps code and safe citations but never embeds remote images, raw HTML, or active URL schemes", async () => {
  const { visibleAnswerMarkdown } = await import("@aux/contracts/conversation-reply-text");
  const markdown = visibleAnswerMarkdown(
    "**Keep** [source](https://example.test) ![Chart](https://tracking.test/pixel) <img src=x> [bad](javascript:alert) [![nested](https://tracking.test/nested)](javascript:alert) [secret](https://user:password@example.test)\n\n```html\n<script>example()</script>\n```",
  );
  expect(markdown).toContain("**Keep** [source](https://example.test) Image: Chart");
  expect(markdown).toContain("```html\n<script>example()</script>\n```");
  for (const hidden of ["<img", "tracking.test", "javascript:", "user:password"])
    expect(markdown).not.toContain(hidden);
});
