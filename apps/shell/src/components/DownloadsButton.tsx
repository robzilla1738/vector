import { useStore } from "../store";
import { shellIconDownloadSm } from "../ui/icons";
import { Popover } from "../ui/popover";
import { deferNamedSurface } from "./DeferredSurface";

const Downloads = deferNamedSurface(() => import("./Downloads"), "Downloads", "Downloads");

export function DownloadsButton() {
  const hasDownloads = useStore((state) => state.downloads.length > 0);
  if (!hasDownloads) return null;
  return (
    <Popover
      label="Recent downloads"
      trigger={shellIconDownloadSm}
      align="end"
      className="icon-btn composer-control downloads-trigger"
    >
      {(close) => <Downloads presentation="recent" onClose={close} />}
    </Popover>
  );
}
