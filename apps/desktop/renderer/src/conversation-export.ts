import type { ConversationArtifact, ConversationAttachment, ConversationSource, Run, Workspace, WorkspaceMemory } from "@vector/contracts";

const md = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\\`*_{}[\]()#+!|]/g, "\\$&").replace(/^([-=>])/gm, "\\$1");
const iso = (value: number) => new Date(value).toISOString();
const resultLines = (result: Record<string, unknown> | undefined): string[] => {
  if (!result) return ["No structured result was recorded."];
  return Object.entries(result).slice(0, 50).map(([key, value]) => {
    const rendered = typeof value === "string" ? value : JSON.stringify(value);
    return `- **${md(key.replaceAll("_", " "))}:** ${md(rendered.slice(0, 20_000))}`;
  });
};

/** Portable visible transcript. Hidden prompt context and local source paths are deliberately omitted. */
export function conversationMarkdown(input: {
  chatId: string;
  title: string;
  runs: Run[];
  attachments: ConversationAttachment[];
  artifacts: ConversationArtifact[];
  sources: ConversationSource[];
  workspace: Workspace | null;
  memory: WorkspaceMemory | null;
  generatedAt?: number;
}): string {
  const runs = [...input.runs].sort((a, b) => a.createdAt - b.createdAt);
  const lines = ["# Aux conversation", "", md(input.title), "", `Conversation: ${md(input.chatId)}`, `Exported: ${iso(input.generatedAt ?? Date.now())}`, "",
    "This file contains the visible conversation record and provenance metadata. It omits hidden prompt context, local document contents and filesystem paths. Reported results are not independent verification of consequential actions.", ""];
  if (input.workspace) lines.push("## Workspace", "", `${md(input.workspace.name)} · ${md(input.workspace.workspaceId)}${input.memory ? ` · memory revision ${input.memory.revision}` : ""}`, "");
  lines.push("## Conversation", "");
  for (const run of runs) {
    lines.push(`### ${iso(run.createdAt)}`, "", `**You:** ${md(run.goal)}`, "", `**Aux status:** ${md(run.status)}${run.statusMessage ? ` — ${md(run.statusMessage)}` : ""}`, "", ...resultLines(run.result), "");
    if (run.failure) lines.push(`Recovery: ${md(run.failure.message)} · ${run.failure.retryable ? "retry available" : "retry unavailable"}`, "");
    const context = [
      run.config?.contextRunIds?.length ? `prior turns ${run.config.contextRunIds.map(md).join(", ")}` : "",
      run.config?.contextAttachmentIds?.length ? `local snapshots ${run.config.contextAttachmentIds.map(md).join(", ")}` : "",
      run.config?.contextArtifactIds?.length ? `generated artifacts ${run.config.contextArtifactIds.map(md).join(", ")}` : "",
      run.config?.contextWorkspaceId ? `workspace ${md(run.config.contextWorkspaceId)} revision ${run.config.contextWorkspaceRevision ?? 0}` : "",
    ].filter(Boolean);
    if (context.length) lines.push(`Context provenance: ${context.join(" · ")}`, "");
    const sources = input.sources.filter(source => source.runId === run.runId);
    if (sources.length) {
      lines.push("Sources observed by Aux:");
      for (const source of sources) lines.push(`- ${md(source.title)} · ${md(source.url)} · observed ${iso(source.observedAt)} · observation ${md(source.sourceId)} revision ${source.revision}`);
      lines.push("");
    }
  }
  lines.push("## Referenced local snapshots", "");
  if (!input.attachments.length) lines.push("None.", "");
  for (const item of input.attachments) lines.push(`- ${md(item.filename)} · ${item.byteLength} bytes · ${item.included ? "currently selected" : "not selected"} · snapshot ${md(item.attachmentId)}`);
  lines.push("", "## Generated text artifacts", "");
  if (!input.artifacts.length) lines.push("None.", "");
  for (const item of input.artifacts) lines.push(`- ${md(item.filename)} · ${item.mediaType} · ${item.byteLength} bytes · artifact ${md(item.artifactId)} · turn ${md(item.runId)}${item.included ? " · currently selected" : ""}`);
  lines.push("");
  return lines.join("\n");
}
