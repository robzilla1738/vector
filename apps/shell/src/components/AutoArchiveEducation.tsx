import { useStore } from "../store";
import { archiveSettings } from "../auto-archive";
import { executeCommand } from "../commands";
import { useOrganizationEditor } from "../features/organization-state";
import {
  staticGhostButtonProps as auxClassGhostButtonProps,
  staticPrimaryButtonProps as auxClassPrimaryButtonProps,
} from "../ui/class-props";

export function AutoArchiveEducation() {
  const settings = useStore((state) => state.settings.autoArchive);
  const connected = useStore((state) => state.connected);
  const editor = useOrganizationEditor();
  if (!connected || archiveSettings(settings).acknowledged || editor) return null;
  return (
    <section aria-label="Tab archiving" className="archive-education">
      <div className="archive-education-copy">
        <strong>Tabs stay one click away</strong>
        <p>Unused tabs move to Archive after 12 hours.</p>
      </div>
      <div className="archive-education-actions">
        <button
          {...auxClassGhostButtonProps}
          data-command-id="configure-auto-archive"
          onClick={() => void executeCommand("configure-auto-archive").catch(() => undefined)}
        >
          Change
        </button>
        <button
          {...auxClassPrimaryButtonProps}
          data-command-id="acknowledge-auto-archive"
          onClick={() => void executeCommand("acknowledge-auto-archive").catch(() => undefined)}
        >
          Got it
        </button>
      </div>
    </section>
  );
}
