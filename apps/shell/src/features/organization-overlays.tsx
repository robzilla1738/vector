import { lazy, Suspense, useRef } from "react";
import { Dialog } from "../ui/dialog";
import { ArchivePolicy } from "../components/ArchivePolicy";
import { showOrganizationEditor, useOrganizationEditor } from "./organization-state";
import { staticButtonProps as auxClassButtonProps } from "../ui/class-props";
const LiveFolderEditor = lazy(() =>
  import("../components/LiveFolderEditor").then((module) => ({ default: module.LiveFolderEditor })),
);
const SavedPages = lazy(() =>
  import("../components/SavedPages").then((module) => ({ default: module.SavedPages })),
);

export function OrganizationEditor() {
  const editor = useOrganizationEditor();
  if (editor?.kind !== "live-folder") return null;
  return (
    <Suspense fallback={null}>
      <LiveFolderEditor
        key={editor.folderId}
        folderId={editor.folderId}
        onClose={() => showOrganizationEditor(null)}
      />
    </Suspense>
  );
}
export function ArchivePolicyOverlay() {
  const editor = useOrganizationEditor();
  const trigger = useRef(document.activeElement as HTMLElement | null);
  if (editor?.kind !== "archive-policy") return null;
  return (
    <Dialog
      label="Auto-archive policy"
      onClose={() => showOrganizationEditor(null)}
      returnFocus={trigger}
      className="aux-dialog-surface organization-editor"
    >
      <h3>Auto-archive</h3>
      <ArchivePolicy spaceId={editor.spaceId} />
      <button {...auxClassButtonProps} onClick={() => showOrganizationEditor(null)}>
        Done
      </button>
    </Dialog>
  );
}
export function ArchiveOverlay() {
  const editor = useOrganizationEditor();
  if (editor?.kind !== "archive") return null;
  return (
    <Suspense fallback={null}>
      <SavedPages initialView="archived" onClose={() => showOrganizationEditor(null)} />
    </Suspense>
  );
}
