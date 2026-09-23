import { wireAgentsIpc } from "./agents.js";
import { wireAppearanceIpc } from "./appearance.js";
import { wireBackupIpc } from "./backup.js";
import { wireDownloadsIpc } from "./downloads.js";
import { wireExtensionsIpc } from "./extensions.js";
import { wireFilesIpc } from "./files.js";
import { wirePreviewIpc } from "./preview.js";
import { wirePrivacyIpc } from "./privacy.js";
import { wireProfilesIpc } from "./profiles.js";
import { wireProjectsIpc } from "./projects.js";
import { wireRuntimeIpc } from "./runtime.js";
import { wireShellIpc } from "./shell.js";
import { wireStageIpc } from "./stage.js";
import { wireTabsIpc } from "./tabs.js";
import { wireVaultIpc } from "./vault.js";

/** Every renderer → main handler; each requires the Aux shell document as sender. */
export function wireRendererIpc() {
  wireShellIpc();
  wireProfilesIpc();
  wireVaultIpc();
  wireRuntimeIpc();
  wireDownloadsIpc();
  wireTabsIpc();
  wireStageIpc();
  wirePreviewIpc();
  wireProjectsIpc();
  wireFilesIpc();
  wireBackupIpc();
  wireAgentsIpc();
  wireExtensionsIpc();
  wirePrivacyIpc();
  wireAppearanceIpc();
}
