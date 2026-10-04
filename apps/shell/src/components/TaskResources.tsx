import { staticRowProps, staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import {memo,useRef,useState} from "react";
import {availableForFocus} from "../ui/focus";
import type {Task} from "@aux/contracts";
import {useStore, errToast} from "../store";
import {resourceWebUrl} from "../task-resource-url";

type Resource = Task["resources"][number];
const ResourceRow = memo(function ResourceRow({task, resource, archived, editing, label, setEditing, setLabel, update}: {
  task: Task; resource: Resource; archived: boolean; editing: string | null; label: string;
  setEditing(value: string | null): void; setLabel(value: string): void;
  update(resources: Resource[]): Promise<boolean>;
}) {
  const rename = useRef<HTMLButtonElement>(null);
  const page = useStore(state => resource.kind === "page" ? state.pages.find(item => item.pageId === resource.locator
    && item.viewStatus !== "detached" && !item.ownedByRuntime) : undefined);
  const href = resource.kind === "url" ? resourceWebUrl(resource.locator) : null;
  return <article className="task-resource" aria-label={resource.label}>
    {editing === resource.resourceId ? <form {...staticRowProps} onSubmit={event => { event.preventDefault(); void update(task.resources.map(item => item.resourceId === resource.resourceId ? {...item, label:label.trim()} : item)).then(ok => {if(ok) setEditing(null);}); }}>
      <input aria-label="Resource label" value={label} onChange={event => setLabel(event.target.value)} maxLength={200}/><button {...smallButtonProps} disabled={!label.trim()}>Save label</button><button {...smallButtonProps} type="button" onClick={event => { const ownedFocus = event.currentTarget.form?.contains(document.activeElement); setEditing(null); if (ownedFocus && rename.current && availableForFocus(rename.current)) rename.current.focus(); }}>Cancel</button>
    </form> : <strong>{resource.label}</strong>}
    <span {...staticHintProps}>{resource.kind === "page" ? page ? "Browser tab" : "Tab unavailable" : resource.kind} · {page?.url ?? resource.locator} · {(resource.access ?? (resource.kind === "repository" ? "write" : "reference")).replaceAll("_", " ")}</span>
    <div {...staticRowProps}>
      {page && <button {...smallButtonProps} onClick={() => void useStore.getState().activate(page.pageId).catch(errToast)}>Open tab</button>}
      {href && <button {...smallButtonProps} onClick={() => {
        const state = useStore.getState();
        const existing = state.pages.find(item => item.url === href && !item.ownedByRuntime && item.viewStatus !== "detached");
        void (existing ? state.activate(existing.pageId) : state.newTab(href)).catch(errToast);
      }}>Open URL</button>}
      <button ref={rename} {...smallButtonProps} disabled={archived} onClick={() => {setEditing(resource.resourceId); setLabel(resource.label);}}>Rename</button>
      <label {...staticHintProps}>Access<select aria-label={`${resource.label} access`} disabled={archived} value={resource.access ?? (resource.kind === "repository" ? "write" : "reference")} onChange={event => void update(task.resources.map(item => item.resourceId === resource.resourceId ? {...item, access: event.target.value as Resource["access"]} : item))}>
        <option value="reference">Reference only</option><option value="read">Read</option><option value="write">Write in Aux</option>
      </select></label>
      <button {...smallButtonProps} disabled={archived} onClick={() => void update(task.resources.filter(item => item.resourceId !== resource.resourceId))}>Remove reference</button>
    </div>
  </article>;
});

export function TaskResources({task, activePageId, attached, update}: {
  task: Task; activePageId: string | null; attached: boolean;
  update: (resources: Resource[]) => Promise<boolean>;
}) {
  const activePage = useStore(state => state.pages.find(page => page.pageId === activePageId));
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
    <span {...staticHintProps}>Saved references describe task context. Reference-only never grants agent access. Read and write are Aux desktop controls, not MCP/CLI authority. Changes create a new task revision and require fresh evidence review.</span>
    {!task.resources.length && <p {...staticHintProps}>No resources attached.</p>}
    {task.resources.map(resource => <ResourceRow key={resource.resourceId} task={task} resource={resource} archived={archived}
      editing={editing} label={label} setEditing={setEditing} setLabel={setLabel} update={update} />)}
    <span {...staticHintProps}>{attached ? "Current tab is attached for evidence capture." : "Attach the current tab to capture page evidence without running an agent."}</span>
    <button {...smallButtonProps} disabled={!activePageId || attached || archived || task.resources.length >= 100} onClick={() => {
      if (activePage) void update([...task.resources, {resourceId:crypto.randomUUID(), kind:"page", locator:activePage.pageId, label:(activePage.title || activePage.url || "Browser tab").slice(0,200)}]);
    }}>Attach current tab</button>
    <form {...staticRowProps} onSubmit={event => {event.preventDefault(); void addUrl();}}>
      <input aria-label="Resource URL" placeholder="https://example.com/reference" value={url} onChange={event => setUrl(event.target.value)} maxLength={4000}/>
      <button {...smallButtonProps} disabled={archived || !url.trim() || task.resources.length >= 100}>Add URL</button>
    </form>
    {error && <p role="alert">{error}</p>}
  </section>;
}
