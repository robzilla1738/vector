import { useStore } from "../store";
import { archiveSettings } from "../auto-archive";
import { runCommand } from "../commands";
import { useOrganizationEditor } from "../features/organization-state";
import { shellIconClockSm } from "../ui/icons";

export function AutoArchiveEducation() {
  const settings = useStore((state) => state.settings.autoArchive);
  const connected = useStore((state) => state.connected);
  const editor = useOrganizationEditor();
  if (!connected || archiveSettings(settings).acknowledged || editor) return null;
  return (
    <section aria-label="Tab archiving" className="archive-education">
      <span aria-hidden="true">{shellIconClockSm}</span>
      <button
        className="archive-education-policy"
        title="Unused tabs move to Archive after 12 hours. Change tab archiving."
        data-command-id="configure-auto-archive"
        onClick={() => runCommand("configure-auto-archive")}
      >
        Unused tabs archive after 12 hours
      </button>
      <button
        className="archive-education-ack"
        data-command-id="acknowledge-auto-archive"
        onClick={() => runCommand("acknowledge-auto-archive")}
      >
        Got it
      </button>
    </section>
  );
}
