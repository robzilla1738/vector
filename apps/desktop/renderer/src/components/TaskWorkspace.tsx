import { useState } from "react";
import type { LocalProject, ProjectInspection, Task } from "@aux/contracts";
import { ProjectFileEditor } from "./ProjectFileEditor";
import { ProjectCommandPanel } from "./ProjectCommandPanel";
import { UntrackedFileReview } from "./UntrackedFileReview";
import { CloudEnvironmentPanel } from "./CloudEnvironmentPanel";

type Tab = "preview" | "changes" | "files" | "console";

export function TaskWorkspace({
  project, task, inspection, attached, busy, onInspect, onEvidenceImported,
}: {
  project: LocalProject;
  task: Task;
  inspection: ProjectInspection | null;
  attached: boolean;
  busy: boolean;
  onInspect(): Promise<void>;
  onEvidenceImported?: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<Tab>("preview");
  const current = inspection?.project.projectId === project.projectId ? inspection : null;
  return <section className="task-workspace" aria-label="Project workspace">
    <div className="settings-connection-tabs" role="tablist" aria-label="Project workspace">
      {(["preview", "changes", "files", "console"] as const).map(name => (
        <button key={name} role="tab" aria-selected={tab === name} onClick={() => setTab(name)}>{name[0]!.toUpperCase() + name.slice(1)}</button>
      ))}
    </div>
    {tab === "preview" && <ProjectCommandPanel key={`preview:${project.projectId}`} surface="preview" task={task} projectId={project.projectId} disabled={task.state === "archived"} />}
    {tab === "files" && <ProjectFileEditor key={project.projectId} projectId={project.projectId} taskId={task.taskId} taskRevision={task.revision} attached={attached} disabled={task.state === "archived"} />}
    {tab === "changes" && <section className="field" aria-label="Project changes">
      <p className="hint">Compared with the isolated checkout baseline. Refresh after editing. Binary content, ignored files and submodule contents are not shown.</p>
      <div className="row"><button className="btn sm" disabled={busy} onClick={() => void onInspect()}>{current ? "Refresh changes" : "Inspect checkout"}</button></div>
      {current ? <>
        {current.changes.error ? <p role="alert">{current.changes.error}</p> : current.changes.patch
          ? <pre role="group" className="project-diff" tabIndex={0} aria-label="Changes from saved commit">{current.changes.patch.split("\n").map((line, index) => <span key={index} className={line.startsWith("+") && !line.startsWith("+++") ? "diff-added" : line.startsWith("-") && !line.startsWith("---") ? "diff-removed" : line.startsWith("@@") ? "diff-location" : ""}>{line}{"\n"}</span>)}</pre>
          : <p className="hint">No tracked changes from the saved commit.</p>}
        {current.changes.untracked.length > 0 && <UntrackedFileReview key={`${current.project.projectId}:${current.inspectedAt}`} projectId={current.project.projectId} names={current.changes.untracked} />}
      </> : <p className="hint">Inspect the checkout to load the current diff.</p>}
    </section>}
    {tab === "console" && <section className="field" aria-label="Project console">
      <p className="hint">Command output, preview diagnostics and incident snapshots stay with this task. GitHub, Vercel and Sentry remain read-only. Closing Aux does not send these logs anywhere.</p>
      <ProjectCommandPanel key={`console:${project.projectId}`} surface="console" task={task} projectId={project.projectId} disabled={task.state === "archived"} />
      {attached && <CloudEnvironmentPanel task={task} projectId={project.projectId} onEvidenceImported={onEvidenceImported} />}
    </section>}
  </section>;
}
