import { createHash } from "node:crypto";
import type { OutboundMcpServer, OutboundMcpTool } from "@aux/contracts";
import { officialMcpProvider } from "./official-mcp.js";

/** The same bounded discovered schema shape gates both cached discovery and actual Notion allocation. */
export function notionFileAllocationShape(tool: OutboundMcpTool): { contentType: boolean } | undefined {
  const input = tool.inputSchema.properties,
    output = tool.outputSchema?.properties;
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    !("filename" in input) ||
    !output ||
    typeof output !== "object" ||
    Array.isArray(output) ||
    !["upload_url", "upload_method", "upload_headers", "upload_form_field"].every((field) => field in output)
  )
    return;
  return { contentType: "content_type" in input };
}

/** Non-sensitive structural discovery only; this is never an account, permission or dispatch authority. */
export function discoveredFileUploadCapability(
  source: OutboundMcpServer["source"],
  catalog: readonly OutboundMcpTool[],
  catalogDigest: string,
): OutboundMcpServer["fileUpload"] {
  if (
    !/^[a-f0-9]{64}$/.test(catalogDigest) ||
    new Set(catalog.map((tool) => tool.name)).size !== catalog.length
  )
    return;
  const provider = officialMcpProvider(source);
  if (
    provider === "slack" &&
    catalog.some((tool) => tool.name === "slack_get_file_upload_url") &&
    catalog.some((tool) => tool.name === "slack_complete_file_upload")
  )
    return {
      catalogDigest,
      allocationTool: "slack_get_file_upload_url",
      completionTool: "slack_complete_file_upload",
    };
  if (
    provider === "notion" &&
    catalog.some((tool) => tool.name === "notion-create-file-upload" && notionFileAllocationShape(tool))
  )
    return { catalogDigest, allocationTool: "notion-create-file-upload" };
}

/** Synchronous cached capability, derived against current source/catalog/toggles; no credentials or network reads. */
export function fileUploadCapability(server: OutboundMcpServer): OutboundMcpServer["fileUpload"] {
  const proof = server.fileUpload,
    provider = officialMcpProvider(server.source);
  if (
    !proof ||
    server.state !== "active" ||
    proof.catalogDigest !== server.catalogDigest ||
    createHash("sha256").update(JSON.stringify(server.source)).digest("hex") !== server.sourceDigest
  )
    return;
  if (
    provider === "notion"
      ? proof.allocationTool !== "notion-create-file-upload" || proof.completionTool !== undefined
      : provider === "slack"
        ? proof.allocationTool !== "slack_get_file_upload_url" ||
          proof.completionTool !== "slack_complete_file_upload"
        : true
  )
    return;
  const required = [proof.allocationTool, ...(proof.completionTool ? [proof.completionTool] : [])];
  if (required.some((name) => !server.toolNames.includes(name) || server.disabledTools.includes(name)))
    return;
  return proof;
}
