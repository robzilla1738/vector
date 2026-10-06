import type { PageTarget } from "@aux/contracts";
import type { RpcChannel } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import { BrowserGroupLedger } from "./browser-group-ledger.js";
import { BrowserHistoryLedger } from "./browser-history-ledger.js";

/** Only the authenticated native host channel may submit browser effect provenance. */
export function registerNativeReceiptChannel(
  channel: RpcChannel,
  repo: Repo,
  pages: () => PageTarget[],
): void {
  const groups = new BrowserGroupLedger(repo);
  const history = new BrowserHistoryLedger(repo);
  channel.onMethod("browser.groupEffect", (raw) => groups.recordNativeEffect(raw, pages()));
  channel.onMethod("browser.historyVisitEffect", (raw) => history.recordNativeEffect(raw, pages()));
}
