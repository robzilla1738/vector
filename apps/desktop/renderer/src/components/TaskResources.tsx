import {LocalProjectResources} from "./LocalProjectResources";
import {useState} from "react";
import type {PageTarget, Task} from "@vector/contracts";
import {useStore, errToast} from "../store";
import {resourceWebUrl} from "../task-resource-url";

type Resource = Task["resources"][number];
export function TaskResources({task, pages, activePageId, attached, update, onEvidenceImported}: {
  task: Task; pages: PageTarget[]; activePageId: string | null; attached: boolean;
  update: (resources: Resource[]) => Promise<boolean>;
  onEvidenceImported?:()=>Promise<void>|void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const archived = task.state === "archived";
  async function addUrl() {
    const normalized = resourceWebUrl(url);
    if (!normalized) { setError("Enter an http or https URL without an embedded username or password."); return; }
    if (task.resources.some(item => item.kind === "url" && resourceWebUrl(item.locator) === normalized)) { setError("This URL is already attached."); return; }
    setError("");
    if (await update([...task.resources, {resourceId:crypto.randomUUID(), kind:"url", locator:normalized, label:new URL(normalized).hostname}])) setUrl("");
  }
  return <section className="field task-resources" aria-label="Task resources">
    <h4>Resources</h4>
    <span className="hint">Saved references describe task context. Reference-only never grants agent access. Read and write are Aux desktop controls, not MCP/CLI authority. Changes create a new task revision and require fresh evidence review.</span>
    {!task.resources.length && <p className="hint">No resources attached.</p>}
    {task.resources.map(resource => {
      const page = resource.kind === "page" ? pages.find(page => page.pageId === resource.locator && page.viewStatus !== "detached" && !page.ownedByRuntime) : undefined;
      const href = resource.kind === "url" ? resourceWebUrl(resource.locator) : null;
      return <article className="task-resource" key={resource.resourceId} aria-label={resource.label}>
        {editing === resource.resourceId ? <form className="row" onSubmit={event => { event.preventDefault(); void update(task.resources.map(item => item.resourceId === resource.resourceId ? {...item, label:label.trim()} : item)).then(ok => {if(ok) setEditing(null);}); }}>
          <input aria-label="Resource label" value={label} onChange={event => setLabel(event.target.value)} maxLength={200}/><button className="btn sm" disabled={!label.trim()}>Save label</button><button className="btn sm" type="button" onClick={() => setEditing(null)}>Cancel</button>
        </form> : <strong>{resource.label}</strong>}
        <span className="hint">{resource.kind === "page" ? page ? "Browser tab" : "Tab unavailable" : resource.kind} · {page?.url ?? resource.locator} · {(resource.access ?? (resource.kind === "repository" ? "write" : "reference")).replaceAll("_", " ")}</span>
        <div className="row">
          {page && <button className="btn sm" onClick={() => void useStore.getState().activate(page.pageId).catch(errToast)}>Open tab</button>}
          {href && <button className="btn sm" onClick={() => {
            const existing = pages.find(page => page.url === href && !page.ownedByRuntime && page.viewStatus !== "detached");
            void (existing ? useStore.getState().activate(existing.pageId) : useStore.getState().newTab(href)).catch(errToast);
          }}>Open URL</button>}
          <button className="btn sm" disabled={archived} onClick={() => {setEditing(resource.resourceId); setLabel(resource.label);}}>Rename</button>
          <label className="hint">Access<select aria-label={`${resource.label} access`} disabled={archived} value={resource.access ?? (resource.kind === "repository" ? "write" : "reference")} onChange={event => void update(task.resources.map(item => item.resourceId === resource.resourceId ? {...item, access: event.target.value as Resource["access"]} : item))}>
            <option value="reference">Reference only</option>
            <option value="read">Read</option>
            <option value="write">Write in Aux</option>
          </select></label>
          <button className="btn sm" disabled={archived} onClick={() => void update(task.resources.filter(item => item.resourceId !== resource.resourceId))}>Remove reference</button>
        </div>
      </article>;
    })}
    <span className="hint">{attached ? "Current tab is attached for evidence capture." : "Attach the current tab to capture page evidence without running an agent."}</span>
    <button className="btn sm" disabled={!activePageId || attached || archived || task.resources.length >= 100} onClick={() => {
      const page = pages.find(item => item.pageId === activePageId);
      if (page) void update([...task.resources, {resourceId:crypto.randomUUID(), kind:"page", locator:page.pageId, label:(page.title || page.url || "Browser tab").slice(0,200)}]);
    }}>Attach current tab</button>
    <form className="row" onSubmit={event => {event.preventDefault(); void addUrl();}}>
      <input aria-label="Resource URL" placeholder="https://example.com/reference" value={url} onChange={event => setUrl(event.target.value)} maxLength={4000}/>
      <button className="btn sm" disabled={archived || !url.trim() || task.resources.length >= 100}>Add URL</button>
    </form>
    <LocalProjectResources task={task} update={update} onEvidenceImported={onEvidenceImported}/>
    {error && <p role="alert">{error}</p>}
  </section>;
}
