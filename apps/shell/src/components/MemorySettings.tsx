import type { MemoryView } from "../settings/routes";
import "./MemorySettings.css";
import { staticFieldInputProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import type { WorkspaceMemory } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { MemorySettingsControl } from "./MemorySettingsControl";
import { SpaceMemoryEditor } from "./SpaceMemoryEditor";
import { SpaceMemory } from "../settings/sections/SpaceMemory";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

export function MemorySettings({ view = "overview" }: { view?: MemoryView }) {
  const layout = useStore((state) => state.layout);
  const spaces = [...layout.spaces, ...(layout.archivedSpaces ?? [])].filter((space) => space.workspaceId);
  const [spaceId, setSpaceId] = useState(
    () =>
      spaces.find((space) => space.workspaceId === useStore.getState().memoryWorkspaceId)?.id ??
      layout.activeSpaceId,
  );
  useEffect(() => {
    useStore.setState({ memoryWorkspaceId: null });
  }, []);
  const [query, setQuery] = useState("");
  const [memory, setMemory] = useState<WorkspaceMemory | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [matches, setMatches] = useState<
    { workspaceId: string; name: string; excerpt: string; enabled: boolean }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const space = spaces.find((space) => space.id === spaceId) ?? spaces[0];
  const selectedSpaceId = space?.id,
    selectedWorkspaceId = space?.workspaceId;
  const selectedWorkspace = useRef(space?.workspaceId);
  selectedWorkspace.current = space?.workspaceId;
  function currentSpace(id: string, workspaceId: string | undefined) {
    const current = useStore.getState().layout;
    if (
      bridge.privateMode ||
      !workspaceId ||
      ![...current.spaces, ...(current.archivedSpaces ?? [])].some(
        (item) => item.id === id && item.workspaceId === workspaceId,
      )
    )
      throw new Error("The Space changed. Choose its current memory control.");
  }
  const matchingSpaces =
    view === "overview" && query.trim()
      ? spaces.filter((item) => matches.some((match) => match.workspaceId === item.workspaceId))
      : spaces;
  useEffect(() => {
    if (bridge.privateMode || !query.trim()) {
      setMatches([]);
      setSearching(false);
      setSearchError("");
      return;
    }
    let live = true;
    setSearching(true);
    setSearchError("");
    const timer = window.setTimeout(() => {
      void call("workspaces.memory.search", { query: query.trim() })
        .then((items) => {
          if (live) setMatches(items);
        })
        .catch((reason) => {
          if (live) setSearchError(String(reason));
        })
        .finally(() => {
          if (live) setSearching(false);
        });
    }, 140);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [query, refresh]);
  useEffect(() => {
    if (bridge.privateMode || !space?.workspaceId) return;
    let live = true;
    setMemory((current) => (current?.workspaceId === space.workspaceId ? current : null));
    setError("");
    setLoading(true);
    void call("workspaces.memory.get", { workspaceId: space.workspaceId })
      .then((value) => {
        if (live) setMemory(value);
      })
      .catch((reason) => {
        if (live) setError(errorMessage(reason));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [space?.workspaceId, refresh]);
  useEffect(
    () =>
      bridge.onEvent((event) => {
        if (
          event.type === "workspace.memory.updated" &&
          event.payload.workspaceId === selectedWorkspace.current
        )
          setRefresh((value) => value + 1);
      }),
    [],
  );
  if (bridge.privateMode) return <p {...staticHintProps}>Space memory is unavailable in private browsing.</p>;
  return (
    <div className="memory-settings" data-memory-view={view}>
      <p {...staticHintProps}>
        {view === "overview"
          ? "Review saved preferences, project context and notes for this Space."
          : view === "history"
            ? "Review extraction activity and recover earlier memory revisions."
            : view === "context"
              ? "Choose which browsing information Aux can remember in this Space."
              : "Control how this Space saves memory and uses it in future replies."}
      </p>
      <div hidden={view !== "overview"}>
        <label className="memory-space-search" data-input-surface>
          Search saved memory
          <input
            {...staticFieldInputProps}
            aria-label="Search Space names and saved notes"
            value={query}
            placeholder="Search Space names and saved notes…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {searching && (
          <output {...staticHintProps} data-block>
            Searching saved notes…
          </output>
        )}
        {searchError && (
          <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
            {searchError}{" "}
            <MemorySettingsControl
              {...smallGhostButtonProps}
              command="retry-memory-search"
              scopeId={query}
              invoke={() => {
                if (selectedSpaceId) currentSpace(selectedSpaceId, selectedWorkspaceId);
                setRefresh((value) => value + 1);
              }}
            >
              Retry
            </MemorySettingsControl>
          </p>
        )}
      </div>
      <div
        className={`memory-space-list ${view === "overview" && query.trim() ? "memory-search-results" : ""}`}
        role="group"
        hidden={spaces.length < 2 && !query.trim()}
        aria-label="Space memory selection"
      >
        {matchingSpaces.map((item) => {
          const { id, workspaceId } = item;
          return (
            <MemorySettingsControl
              key={item.id}
              {...smallButtonProps}
              aria-pressed={item.id === space?.id}
              command="select-memory-space"
              scopeId={item.id}
              invoke={() => {
                currentSpace(id, workspaceId);
                setSpaceId(id);
              }}
            >
              <span>
                {item.name}
                {layout.archivedSpaces?.some((archived) => archived.id === item.id) ? " · Archived" : ""}
              </span>
              {view === "overview" && query.trim() && (
                <small>
                  {matches.find((match) => match.workspaceId === item.workspaceId)?.excerpt ||
                    "No saved notes"}
                  {matches.find((match) => match.workspaceId === item.workspaceId)?.enabled === false
                    ? " · Paused"
                    : ""}
                </small>
              )}
            </MemorySettingsControl>
          );
        })}
        {!!spaces.length && !matchingSpaces.length && !searching && !searchError && (
          <output {...staticHintProps} data-block>
            No saved memory matches “{query.trim()}”.
          </output>
        )}
      </div>
      {space && <h4>{space.name}</h4>}
      {loading && !memory && (
        <output {...staticHintProps} data-block>
          Loading saved notes…
        </output>
      )}
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error}{" "}
          <MemorySettingsControl
            {...smallButtonProps}
            command="retry-memory-load"
            scopeId={selectedWorkspaceId ?? ""}
            invoke={() => {
              if (!selectedSpaceId) throw new Error("Choose a Space.");
              currentSpace(selectedSpaceId, selectedWorkspaceId);
              setRefresh((value) => value + 1);
            }}
          >
            Retry
          </MemorySettingsControl>
        </p>
      )}
      {memory && (
        <SpaceMemoryEditor
          key={`editor:${memory.workspaceId}`}
          memory={memory}
          view={view}
          onSaved={(value) => {
            if (value.workspaceId !== selectedWorkspace.current) return;
            setMemory(value);
            if (query.trim()) setRefresh((current) => current + 1);
          }}
        />
      )}
      {space?.workspaceId && (
        <div hidden={view === "context"}>
          <SpaceMemory key={`pipeline:${space.workspaceId}`} workspaceId={space.workspaceId} view={view} />
        </div>
      )}
      {!spaces.length && <p {...staticHintProps}>Create a Space to save shared notes.</p>}
    </div>
  );
}
