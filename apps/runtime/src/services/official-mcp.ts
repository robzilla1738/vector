import type { OutboundMcpServer, OutboundMcpTool } from "@aux/contracts";

/** Exact provider paths only; a matching hostname alone does not identify a reviewed service. */
export function officialMcpProvider(source: OutboundMcpServer["source"]): "notion" | "slack" | undefined {
  if (source.kind !== "remote" || source.auth !== "oauth") return;
  const url = new URL(source.url);
  if (url.username || url.password || url.search || url.hash) return;
  if (url.href === "https://mcp.notion.com/mcp") return "notion";
  if (url.href === "https://mcp.slack.com/mcp") return "slack";
}

// https://developers.notion.com/guides/mcp/mcp-supported-tools
// Deliberately bounded to documented operations. Server hints cannot grant read authority.
const notionReads = new Set([
  "notion-search",
  "notion-ai-search",
  "notion-fetch",
  "notion-get-self",
  "notion-get-tool-access",
  "notion-get-comments",
  "notion-get-users",
  "notion-get-async-task",
  "notion-query-data-sources",
  "notion-query-multiple-data-sources",
  "notion-get-file-download-urls",
  "notion-download-attachment",
]);
const notionWrites = new Set([
  "notion-create-attachment",
  "notion-create-file-upload",
  "notion-create-pages",
  "notion-create-database",
  "notion-update-page",
  "notion-convert-page-to-skill",
  "notion-update-data-source",
  "notion-create-view",
  "notion-update-view",
  "notion-move-pages",
  "notion-duplicate-page",
  "notion-create-comment",
]);
// https://docs.slack.dev/ai/slack-mcp-server/ explicitly identifies these uploads as writes.
const slackWrites = new Set(["slack_get_file_upload_url", "slack_complete_file_upload"]);

export function officialMcpEffect(
  source: OutboundMcpServer["source"],
  name: string,
  annotations?: OutboundMcpTool["annotations"],
): "read" | "write" | "unknown" {
  const provider = officialMcpProvider(source);
  if (provider === "notion" && notionWrites.has(name)) return "write";
  if (provider === "slack" && slackWrites.has(name)) return "write";
  if (
    provider === "notion" &&
    notionReads.has(name) &&
    annotations?.readOnlyHint !== false &&
    annotations?.destructiveHint !== true
  )
    return "read";
  return "unknown";
}
