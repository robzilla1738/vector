import { orderedPages } from "../store/pages";
import { staticRowProps, staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { memo, useId, useLayoutEffect, useMemo, useRef, useState, type ButtonHTMLAttributes } from "react";
import { availableForFocus } from "../ui/focus";
import type { Task, PageTarget } from "@aux/contracts";
import { useStore, errToast } from "../store";
import { bridge } from "../bridge";
import { guardCommandCompletion } from "../command-completion";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { resourceWebUrl } from "../task-resource-url";

type Resource = Task["resources"][number];
type Current = () => boolean;
type Mutation = (
  resources: Resource[],
  deliver?: () => void,
  current?: Current,
  release?: () => void,
) => Promise<boolean>;
function pageIdentity(page: PageTarget) {
  return JSON.stringify([
    page.pageId,
    page.backend,
    page.targetId,
    page.sessionId,
    page.windowId,
    page.windowKind,
    page.documentEpoch,
    page.controllerEpoch,
    page.ownedByRuntime,
    page.url,
  ]);
}
function pageCurrent(page: PageTarget, identity: string) {
  const current = useStore.getState().pages.byId[page.pageId];
  return (
    !!current &&
    !current.ownedByRuntime &&
    current.viewStatus !== "detached" &&
    pageIdentity(current) === identity
  );
}
function retainPage(page: PageTarget, identity: string) {
  let active = true;
  const current = () => {
    if (active && pageCurrent(page, identity)) return true;
    active = false;
    return false;
  };
  const release = useStore.subscribe(() => {
    current();
  });
  return { current, release };
}
class ResourceOwner {
  active = true;
  pending = false;
  constructor(
    readonly identity: object,
    readonly snapshot: string,
    readonly windowId: string,
    readonly privateMode: boolean,
    readonly windowKind: typeof bridge.windowKind,
    readonly connected: boolean,
  ) {}
  retire() {
    this.active = false;
  }
  current() {
    if (
      this.active &&
      bridge.windowId === this.windowId &&
      bridge.privateMode === this.privateMode &&
      bridge.windowKind === this.windowKind &&
      useStore.getState().connected === this.connected &&
      !this.privateMode &&
      this.windowKind === "normal"
    )
      return true;
    this.retire();
    return false;
  }
  reserve() {
    if (this.pending) return false;
    this.pending = true;
    return true;
  }
  finish() {
    this.pending = false;
  }
}
function ResourceAction({
  command,
  current,
  invoke,
  originalRef,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: string;
  current: Current;
  invoke(original: HTMLButtonElement): unknown;
  originalRef?: (node: HTMLButtonElement | null) => void;
}) {
  const scopeId = useId();
  const [ref, run] = usePreferenceCommand<HTMLButtonElement>(
    command,
    scopeId,
    (original) => {
      if (!current()) throw new Error("Choose the original task resource.");
      return invoke(original);
    },
    (reason) => {
      if (current()) errToast(reason);
    },
  );
  return (
    <button
      {...props}
      ref={(node) => {
        ref(node);
        originalRef?.(node);
      }}
      data-command-id={command}
      onClick={run}
    />
  );
}
const ResourceRow = memo(function ResourceRow({
  task,
  resource,
  archived,
  editing,
  label,
  setEditing,
  setLabel,
  mutate,
  current: ownerCurrent,
  capture,
  draftVersion,
}: {
  task: Task;
  resource: Resource;
  archived: boolean;
  editing: string | null;
  label: string;
  setEditing(value: string | null): void;
  setLabel(value: string): void;
  mutate: Mutation;
  current: Current;
  capture(): Current;
  draftVersion(): number;
}) {
  const current = () =>
    ownerCurrent() &&
    task.resources.filter((item) => item.resourceId === resource.resourceId).length === 1 &&
    task.resources.find((item) => item.resourceId === resource.resourceId) === resource;
  const rename = useRef<HTMLButtonElement>(null),
    scopeId = useId();
  const page = useStore((state) => {
    const target = resource.kind === "page" ? state.pages.byId[resource.locator] : undefined;
    return target && target.viewStatus !== "detached" && !target.ownedByRuntime ? target : undefined;
  });
  const originalPage = page ? pageIdentity(page) : null;
  const href = resource.kind === "url" ? resourceWebUrl(resource.locator) : null;
  const [formRef, save] = usePreferenceCommand<HTMLFormElement>(
    "save-task-resource-label",
    scopeId,
    (form) => {
      if (!current() || archived) throw new Error("Choose the original task resource.");
      const input = form.elements.namedItem("resourceLabel");
      if (!(input instanceof HTMLInputElement) || !input.value.trim() || input.value.length > 200)
        throw new Error("Enter a resource label.");
      const savedLabel = input.value,
        savedVersion = draftVersion();
      return mutate(
        task.resources.map((item) =>
          item.resourceId === resource.resourceId ? { ...item, label: savedLabel.trim() } : item,
        ),
        () => setEditing(null),
        () => input.isConnected && input.value === savedLabel && draftVersion() === savedVersion,
      );
    },
    (reason) => {
      if (current()) errToast(reason);
    },
  );
  const [accessRef, changeAccess] = usePreferenceCommand<HTMLSelectElement>(
    "set-task-resource-access",
    scopeId,
    (select) => {
      if (!current() || archived || !["reference", "read", "write"].includes(select.value))
        throw new Error("Choose the original resource access.");
      return mutate(
        task.resources.map((item) =>
          item.resourceId === resource.resourceId
            ? { ...item, access: select.value as Resource["access"] }
            : item,
        ),
      );
    },
    (reason) => {
      if (current()) errToast(reason);
    },
  );
  function open() {
    if (!current()) throw new Error("Choose the original task resource.");
    const originalCurrent = capture(),
      state = useStore.getState();
    if (page) {
      if (!pageCurrent(page, originalPage!)) throw new Error("Choose the original browser tab.");
      const lease = retainPage(page, originalPage!);
      try {
        return guardCommandCompletion(
          state.activate(page.pageId).finally(lease.release),
          () => originalCurrent() && lease.current(),
        );
      } catch (reason) {
        lease.release();
        throw reason;
      }
    }
    if (!href) throw new Error("Choose the original resource URL.");
    const existing = orderedPages(state.pages).find(
      (item) => item.url === href && !item.ownedByRuntime && item.viewStatus !== "detached",
    );
    const existingIdentity = existing ? pageIdentity(existing) : null;
    const lease = existing ? retainPage(existing, existingIdentity!) : null;
    try {
      return guardCommandCompletion<unknown>(
        (existing ? state.activate(existing.pageId) : state.newTab(href)).finally(() => lease?.release()),
        () => originalCurrent() && (!lease || lease.current()),
      );
    } catch (reason) {
      lease?.release();
      throw reason;
    }
  }
  return (
    <article className="task-resource" aria-label={resource.label}>
      {editing === resource.resourceId ? (
        <form
          {...staticRowProps}
          ref={formRef}
          data-command-id="save-task-resource-label"
          onSubmit={(event) => {
            event.preventDefault();
            save(event);
          }}
        >
          <input
            name="resourceLabel"
            aria-label="Resource label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={200}
          />
          <button {...smallButtonProps} disabled={!label.trim()}>
            Save label
          </button>
          <ResourceAction
            {...smallButtonProps}
            type="button"
            command="cancel-task-resource-label"
            current={current}
            invoke={(original) => {
              const ownedFocus = original.form?.contains(document.activeElement);
              setEditing(null);
              if (ownedFocus && rename.current && availableForFocus(rename.current)) rename.current.focus();
            }}
          >
            Cancel
          </ResourceAction>
        </form>
      ) : (
        <strong>{resource.label}</strong>
      )}
      <span {...staticHintProps}>
        {resource.kind === "page" ? (page ? "Browser tab" : "Tab unavailable") : resource.kind} ·{" "}
        {page?.url ?? resource.locator} ·{" "}
        {(resource.access ?? (resource.kind === "repository" ? "write" : "reference")).replaceAll("_", " ")}
      </span>
      <div {...staticRowProps}>
        {page && (
          <ResourceAction {...smallButtonProps} command="open-task-resource" current={current} invoke={open}>
            Open tab
          </ResourceAction>
        )}
        {href && (
          <ResourceAction {...smallButtonProps} command="open-task-resource" current={current} invoke={open}>
            Open URL
          </ResourceAction>
        )}
        <ResourceAction
          {...smallButtonProps}
          command="rename-task-resource"
          originalRef={(node) => {
            rename.current = node;
          }}
          disabled={archived}
          current={current}
          invoke={() => {
            setEditing(resource.resourceId);
            setLabel(resource.label);
          }}
        >
          Rename
        </ResourceAction>
        <label {...staticHintProps}>
          Access
          <select
            ref={accessRef}
            data-command-id="set-task-resource-access"
            aria-label={`${resource.label} access`}
            disabled={archived}
            value={resource.access ?? (resource.kind === "repository" ? "write" : "reference")}
            onChange={changeAccess}
          >
            <option value="reference">Reference only</option>
            <option value="read">Read</option>
            <option value="write">Write in Aux</option>
          </select>
        </label>
        <ResourceAction
          {...smallButtonProps}
          disabled={archived}
          command="remove-task-resource-reference"
          current={current}
          invoke={() => mutate(task.resources.filter((item) => item.resourceId !== resource.resourceId))}
        >
          Remove reference
        </ResourceAction>
      </div>
    </article>
  );
});

export function TaskResources({
  task,
  activePageId,
  attached,
  update,
}: {
  task: Task;
  activePageId: string | null;
  attached: boolean;
  update: (resources: Resource[]) => Promise<boolean>;
}) {
  const activePage = useStore((state) => state.pages.byId[activePageId ?? ""]);
  const activeIdentity = activePage ? pageIdentity(activePage) : null;
  const connected = useStore((state) => state.connected),
    windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    windowKind = bridge.windowKind;
  const snapshot = JSON.stringify(task);
  const identity = useMemo(
    () => [snapshot, windowId, privateMode, windowKind, connected],
    [snapshot, windowId, privateMode, windowKind, connected],
  );
  const owner = useRef<ResourceOwner | null>(null);
  useLayoutEffect(() => {
    const original = new ResourceOwner(identity, snapshot, windowId, privateMode, windowKind, connected);
    owner.current = original;
    return () => original.retire();
  }, [identity, snapshot, windowId, privateMode, windowKind, connected]);
  const current = () => owner.current?.identity === identity && owner.current.current();
  const capture = () => {
    const original = owner.current;
    return () =>
      !!original && original === owner.current && original.identity === identity && original.current();
  };
  const draftRevision = useRef(0);
  const draftVersion = () => draftRevision.current;
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const archived = task.state === "archived",
    scopeId = useId();
  function mutate(
    resources: Resource[],
    deliver?: () => void,
    extra: Current = () => true,
    release?: () => void,
  ): Promise<boolean> {
    const original = owner.current;
    if (!current() || !original || archived || resources.length > 100 || !original.reserve())
      throw new Error("Choose the original editable task resources.");
    const originalCurrent = capture(),
      delivering = () => originalCurrent() && extra();
    let result: Promise<boolean>;
    try {
      result = update(resources);
    } catch (reason) {
      result = Promise.reject(reason);
    }
    return guardCommandCompletion(
      result
        .then((ok) => {
          if (ok && delivering()) deliver?.();
          return ok;
        })
        .finally(() => {
          original.finish();
          release?.();
        }),
      delivering,
    );
  }
  const [urlRef, addUrl] = usePreferenceCommand<HTMLFormElement>(
    "add-task-resource-url",
    scopeId,
    (form) => {
      if (!current() || archived) throw new Error("Choose the original task resources.");
      const input = form.elements.namedItem("resourceUrl");
      if (!(input instanceof HTMLInputElement)) throw new Error("Choose the original resource URL.");
      if (!input.value.trim() || input.value.length > 4000) throw new Error("Enter a resource URL.");
      const savedUrl = input.value,
        savedVersion = draftVersion(),
        normalized = resourceWebUrl(savedUrl);
      if (!normalized) {
        setError("Enter an http or https URL without an embedded username or password.");
        return;
      }
      if (task.resources.some((item) => item.kind === "url" && resourceWebUrl(item.locator) === normalized)) {
        setError("This URL is already attached.");
        return;
      }
      setError("");
      return mutate(
        [
          ...task.resources,
          {
            resourceId: crypto.randomUUID(),
            kind: "url",
            locator: normalized,
            label: new URL(normalized).hostname,
          },
        ],
        () => setUrl(""),
        () => input.isConnected && input.value === savedUrl && draftVersion() === savedVersion,
      );
    },
    (reason) => {
      if (current()) errToast(reason);
    },
  );
  return (
    <section className="field task-resources" aria-label="Task resources">
      <h4>Resources</h4>
      <span {...staticHintProps}>
        Saved references describe task context. Reference-only never grants agent access. Read and write are
        Aux desktop controls, not MCP/CLI authority. Changes create a new task revision and require fresh
        evidence review.
      </span>
      {!task.resources.length && <p {...staticHintProps}>No resources attached.</p>}
      {task.resources.map((resource) => (
        <ResourceRow
          key={resource.resourceId}
          task={task}
          resource={resource}
          archived={archived}
          editing={editing}
          label={label}
          setEditing={(value) => {
            draftRevision.current++;
            setEditing(value);
          }}
          setLabel={(value) => {
            draftRevision.current++;
            setLabel(value);
          }}
          mutate={mutate}
          current={current}
          capture={capture}
          draftVersion={draftVersion}
        />
      ))}
      <span {...staticHintProps}>
        {attached
          ? "Current tab is attached for evidence capture."
          : "Attach the current tab to capture page evidence without running an agent."}
      </span>
      <ResourceAction
        {...smallButtonProps}
        command="attach-task-resource-page"
        current={current}
        disabled={!activePageId || attached || archived || task.resources.length >= 100}
        invoke={() => {
          if (!activePage || !pageCurrent(activePage, activeIdentity!))
            throw new Error("Choose the original current tab.");
          const lease = retainPage(activePage, activeIdentity!);
          try {
            return mutate(
              [
                ...task.resources,
                {
                  resourceId: crypto.randomUUID(),
                  kind: "page",
                  locator: activePage.pageId,
                  label: (activePage.title || activePage.url || "Browser tab").slice(0, 200),
                },
              ],
              undefined,
              lease.current,
              lease.release,
            );
          } catch (reason) {
            lease.release();
            throw reason;
          }
        }}
      >
        Attach current tab
      </ResourceAction>
      <form
        {...staticRowProps}
        ref={urlRef}
        data-command-id="add-task-resource-url"
        onSubmit={(event) => {
          event.preventDefault();
          addUrl(event);
        }}
      >
        <input
          name="resourceUrl"
          aria-label="Resource URL"
          placeholder="https://example.com/reference"
          value={url}
          onChange={(event) => {
            draftRevision.current++;
            setUrl(event.target.value);
          }}
          maxLength={4000}
        />
        <button {...smallButtonProps} disabled={archived || !url.trim() || task.resources.length >= 100}>
          Add URL
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
