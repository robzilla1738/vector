import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { authorizeProgram } from "../../agent/permissions.js";
import { siteExportUrl } from "../../agent/site-adapters.js";

async function h_sites_read(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, tasks, turnTabs } = ctx;
  const previewGranted =
    !!client.connectionId && turnTabs.owns(client.connectionId, params.taskId, params.pageId);
  tasks.preparePageAccess(params.taskId, params.expectedRevision, params.pageId, false, previewGranted);
  const exportUrl = siteExportUrl(params);
  const grants = s.settings.effectGrants();
  if (
    !authorizeProgram(
      [{ id: "site-read", op: "extract", fields: [{ name: "content" }] }],
      grants,
      exportUrl.origin,
    ).ok ||
    !authorizeProgram([{ id: "site-egress", op: "navigate", url: exportUrl.href }], grants).ok
  )
    throw new AuxError(
      "permission_denied",
      `Site export needs read and egress grants for ${exportUrl.origin}.`,
    );
  const result = await s.pages.readSiteContent(params, (url) => {
    const current = s.settings.effectGrants();
    return (
      authorizeProgram(
        [{ id: "site-read", op: "extract", fields: [{ name: "content" }] }],
        current,
        url.origin,
      ).ok && authorizeProgram([{ id: "site-egress", op: "navigate", url: url.href }], current).ok
    );
  });
  tasks.preparePageAccess(params.taskId, params.expectedRevision, params.pageId, false, previewGranted);
  if (
    !authorizeProgram(
      [{ id: "site-read", op: "extract", fields: [{ name: "content" }] }],
      s.settings.effectGrants(),
      exportUrl.origin,
    ).ok ||
    !authorizeProgram([{ id: "site-egress", op: "navigate", url: exportUrl.href }], s.settings.effectGrants())
      .ok
  )
    throw new AuxError("permission_denied", "The site read grant changed during extraction.");
  return result;
}

export const sitesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "sites.read": h_sites_read,
};
