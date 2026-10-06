import { AuxError, type RpcChannel } from "@aux/contracts";
import { canonicalCommandUrl } from "@aux/contracts/command-ranking-url";
import { z } from "zod";
import type { PageService } from "./pages.js";
import type { CommandRankingStore } from "./command-ranking.js";

const LinkPick = z
  .object({
    pageId: z.string().min(1).max(256),
    url: z.string().min(1).max(2048),
    navigationId: z.string().uuid(),
  })
  .strict();
/** Only the authenticated native Profile channel can publish committed link picks.
 * PageSignals supplies real renderer navigation transitions and user gestures. */
export function registerNativeCommandRanking(
  channel: RpcChannel,
  pages: Pick<PageService, "get" | "livePageIds">,
  ranking: CommandRankingStore,
): void {
  const seen = new Set<string>();
  channel.onMethod("command.ranking.link", (raw) => {
    const pick = LinkPick.parse(raw);
    if (seen.has(pick.navigationId)) return { recorded: false };
    if (!pages.livePageIds().includes(pick.pageId))
      throw new AuxError("not_found", "The link target is no longer live.");
    const page = pages.get(pick.pageId),
      url = canonicalCommandUrl(pick.url);
    if (
      !url ||
      url.length > 160 ||
      page.backend !== "aux" ||
      page.ownedByRuntime ||
      page.windowKind === "private" ||
      ["agent", "external"].includes(page.controller) ||
      ["detached", "crashed"].includes(page.viewStatus) ||
      page.url !== pick.url
    )
      throw new AuxError("permission_denied", "The native link target changed or is controlled.");
    ranking.record(url, url, "history", "link");
    seen.add(pick.navigationId);
    if (seen.size > 400) seen.delete(seen.values().next().value!);
    return { recorded: true };
  });
}
