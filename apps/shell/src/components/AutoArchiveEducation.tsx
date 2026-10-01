import { useStore } from "../store";
import { archiveSettings } from "../auto-archive";
import { executeCommand } from "../commands";
import { useOrganizationEditor } from "../features/organization-state";

export function AutoArchiveEducation() {
  const settings = useStore(state => state.settings.autoArchive);
  const connected = useStore(state => state.connected);
  const editor = useOrganizationEditor();
  if (!connected || archiveSettings(settings).acknowledged || editor) return null;
  return <dialog open aria-label="Tabs stay one click away" className="archive-education"><h3>Tabs stay one click away</h3><p>Aux archives tabs you haven't used in 12 hours. They're one click away in Archive.</p><div className="dialog-actions"><button className="btn ghost" data-command-id="configure-auto-archive" onClick={() => void executeCommand("configure-auto-archive").catch(() => undefined)}>Change</button><button className="btn primary" data-command-id="acknowledge-auto-archive" onClick={() => void executeCommand("acknowledge-auto-archive").catch(() => undefined)}>Got it</button></div></dialog>;
}
