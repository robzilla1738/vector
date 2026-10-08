import type { EventBus } from "../events.js";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";
import { SpaceService } from "./spaces.js";

/** Publish native memory provenance without putting runtime work on human tab opens. */
export async function installNativeSpaceBindings(
  repo: Repo,
  events: EventBus,
  native: Required<Pick<NativeBridge, "spaceBindingsSet">>,
  onError: (error: unknown) => void,
): Promise<() => Promise<void>> {
  const spaces = new SpaceService(repo, events);
  let tail = Promise.resolve();
  const publish = () => {
    const work = tail.then(async () => {
      const workspaces = new Set(repo.listWorkspaces().map((workspace) => workspace.workspaceId));
      const bindings = spaces
        .list()
        .filter((space) => !space.archived && workspaces.has(space.workspaceId))
        .map((space) => ({ spaceId: space.id, workspaceId: space.workspaceId }));
      await native.spaceBindingsSet({ bindings });
    });
    tail = work.catch(onError);
    return work;
  };
  const stop = events.subscribe((event) => {
    if (event.type === "spaces.updated" || event.type === "workspace.created") publish();
  });
  try {
    await publish();
  } catch (error) {
    stop();
    throw error;
  }
  return async () => {
    stop();
    await tail;
  };
}
