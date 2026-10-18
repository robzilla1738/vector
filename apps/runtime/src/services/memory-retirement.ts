import { AuxError, MemoryClaimSchema, type MemoryClaim } from "@aux/contracts";
import type { RecoverySpaceMemory } from "./memory-pipeline.js";

type Selection = {
  sourceRunId?: string;
  sourceRunIds?: ReadonlySet<string>;
  claimId?: string;
  all?: boolean;
  expiredBefore?: number;
  mode: "source" | "owner";
};

/** Reverse edges preserve the existing exact reference-marker policy without repeated fixed-point scans. */
export function selectMemoryRetirement(
  state: Pick<RecoverySpaceMemory, "claims" | "inbox" | "history">,
  selection: Selection,
  sourceConfigs: ReadonlyMap<string, { context?: string; contextRunIds?: string[] }>,
) {
  const universe = [...state.claims, ...state.inbox, ...state.history.flatMap((revision) => revision.claims)];
  const eligible = universe.filter((claim) => selection.mode !== "source" || !claim.sourceRetired);
  const sources = new Map<string, Set<string>>();
  const markers = new Map<string, Set<string>>();
  for (const claim of eligible) {
    const ids = sources.get(claim.sourceRunId) ?? new Set<string>();
    ids.add(claim.claimId);
    sources.set(claim.sourceRunId, ids);
    const marker =
      claim.source?.kind === "owner-paste"
        ? `[owner-pasted, unverified; import:${claim.source.importId}]`
        : `[run:${claim.sourceRunId}#${claim.source?.quoteSha256.slice(0, 12) ?? ""}]`;
    const marked = markers.get(marker) ?? new Set<string>();
    marked.add(claim.claimId);
    markers.set(marker, marked);
  }
  const edges = new Map<string, Set<string>>();
  let count = 0;
  const connect = (parents: ReadonlySet<string> | undefined, children: ReadonlySet<string>) => {
    for (const parent of parents ?? []) {
      const next = edges.get(parent) ?? new Set<string>();
      for (const child of children)
        if (!next.has(child)) {
          if (++count > 262144)
            throw new AuxError("conflict", "Memory retirement dependencies exceed their edge budget.");
          next.add(child);
        }
      edges.set(parent, next);
    }
  };
  for (const [runId, children] of sources) {
    const config = sourceConfigs.get(runId);
    for (const parent of config?.contextRunIds ?? []) connect(sources.get(parent), children);
    if (config?.context)
      for (const [marker, parents] of markers)
        if (config.context.includes(marker)) connect(parents, children);
  }
  const selected = new Set(
    eligible
      .filter((claim) =>
        selection.expiredBefore !== undefined
          ? claim.capturedAt <= selection.expiredBefore
          : selection.all ||
            (selection.claimId
              ? claim.claimId === selection.claimId
              : claim.sourceRunId === selection.sourceRunId ||
                selection.sourceRunIds?.has(claim.sourceRunId)),
      )
      .map((claim) => claim.claimId),
  );
  const queue = [...selected];
  for (let index = 0; index < queue.length; index++)
    for (const id of edges.get(queue[index]!) ?? []) {
      if (selected.has(id)) continue;
      selected.add(id);
      queue.push(id);
    }
  return selected;
}

/** The same logical policy serves live erasure and detached ordinary-restore copies. */
export function projectMemoryRetirement(
  state: Pick<RecoverySpaceMemory, "claims" | "inbox" | "history" | "documents" | "dreams" | "activity">,
  forgottenIds: ReadonlySet<string>,
  selection: Selection & { at: number },
) {
  const { claims, inbox, history } = state;
  const documents = state.documents ?? [],
    dreams = state.dreams ?? [],
    activity = state.activity ?? [];
  const universe = [...claims, ...inbox, ...history.flatMap((revision) => revision.claims)];
  const selectedSources = new Set(selection.sourceRunIds ?? []);
  if (selection.sourceRunId) selectedSources.add(selection.sourceRunId);
  const { expiredBefore } = selection;
  const forgetAll = selection.all && expiredBefore === undefined;
  const keep = (claim: MemoryClaim) => !forgottenIds.has(claim.claimId);
  const preserved =
    selection.mode === "source"
      ? [...claims, ...inbox]
          .filter((claim) => forgottenIds.has(claim.claimId) && claim.ownerEdit)
          .map((claim) =>
            MemoryClaimSchema.parse({
              ...claim,
              text: "Original source retired.",
              source: undefined,
              sourceRetired: claim.sourceRetired ?? { at: selection.at },
              contradictionIds: undefined,
              mergedClaimIds: undefined,
            }),
          )
      : [];
  const remaining = [...claims.filter(keep), ...preserved];
  if (remaining.length > 200)
    throw new AuxError(
      "conflict",
      "Retained owner edits exceed the inspection document limit; no source retirement was committed.",
    );
  const pending = inbox.filter(keep);
  const retiredSourceRunIds = new Set(
    universe.filter((claim) => forgottenIds.has(claim.claimId)).map((claim) => claim.sourceRunId),
  );
  const forgottenRunIds = new Set([...retiredSourceRunIds, ...selectedSources]);
  const retainedActivity = activity.filter(
    (entry) =>
      (expiredBefore !== undefined ? entry.capturedAt > expiredBefore : !selection.all) &&
      !selectedSources.has(entry.sourceRunId) &&
      !entry.candidateIds.some((id) => forgottenIds.has(id) || id === selection.claimId),
  );
  for (const entry of activity)
    if (!retainedActivity.includes(entry)) retiredSourceRunIds.add(entry.sourceRunId);
  const affectedRef = (ref: { claimId: string; sourceRunId: string }) =>
    forgottenIds.has(ref.claimId) || selectedSources.has(ref.sourceRunId);
  const keptDocuments = documents.flatMap((document) => {
    const affected = document.sourceRefs.some(affectedRef);
    for (const ref of document.sourceRefs) if (affectedRef(ref)) retiredSourceRunIds.add(ref.sourceRunId);
    if (selection.mode === "source" && document.authoredBy === "owner")
      return [
        affected
          ? { ...document, sourceRefs: [], sourceRetired: document.sourceRetired ?? { at: selection.at } }
          : document,
      ];
    return !forgetAll && !affected ? [document] : [];
  });
  const keptDreams = dreams.filter(
    (operation) =>
      !forgetAll &&
      (expiredBefore === undefined || operation.startedAt > expiredBefore) &&
      !operation.sourceRunIds.some((id) => forgottenRunIds.has(id)) &&
      !operation.changes.some((change) =>
        change.sourceRefs.some(
          (ref) => forgottenIds.has(ref.claimId) || forgottenRunIds.has(ref.sourceRunId),
        ),
      ),
  );
  for (const operation of dreams)
    if (!keptDreams.includes(operation)) {
      for (const id of operation.sourceRunIds) if (forgottenRunIds.has(id)) retiredSourceRunIds.add(id);
      for (const change of operation.changes)
        for (const ref of change.sourceRefs)
          if (forgottenIds.has(ref.claimId) || forgottenRunIds.has(ref.sourceRunId))
            retiredSourceRunIds.add(ref.sourceRunId);
    }
  return {
    claims: remaining,
    inbox: pending,
    history: history.map((revision) => ({ ...revision, claims: revision.claims.filter(keep) })),
    documents: keptDocuments,
    dreams: keptDreams,
    activity: retainedActivity,
    forgottenRunIds,
    retiredSourceRunIds,
    forgotten: forgottenIds.size,
    activityRemoved:
      activity.length -
      retainedActivity.length +
      documents.length -
      keptDocuments.length +
      dreams.length -
      keptDreams.length,
  };
}
