import {
  MentionRefSchema,
  type ConnectorCatalog,
  type MentionRef,
  type OrganizationSnapshot,
  type PageTarget,
  type Routine,
} from "@aux/contracts";
export interface MentionCandidate {
  id: string;
  section: "Tabs" | "Folders and groups" | "Spaces" | "Skills" | "Connectors";
  label: string;
  detail: string;
  ref: MentionRef;
}
export function mentionCandidates(input: {
  pages: readonly PageTarget[];
  organization?: OrganizationSnapshot;
  routines?: readonly Routine[];
  connectors?: ConnectorCatalog;
}): MentionCandidate[] {
  const candidates: MentionCandidate[] = [
    { id: "tabs", section: "Tabs", label: "Tabs", detail: "Titles and URLs only", ref: { kind: "tabs" } },
  ];
  const tabs = input.pages.flatMap((page) => {
    if (!page.sessionId || page.viewStatus === "detached" || page.viewStatus === "crashed") return [];
    const parsed = MentionRefSchema.safeParse({
      kind: "tab",
      pageId: page.pageId,
      url: page.url,
      title: page.title.slice(0, 500),
      documentEpoch: page.documentEpoch,
      sessionId: page.sessionId,
      access: "read",
    });
    return parsed.success && parsed.data.kind === "tab" ? [parsed.data] : [];
  });
  for (const tab of tabs) {
    candidates.push({
      id: `tab:${tab.pageId}:read`,
      section: "Tabs",
      label: tab.title || tab.url,
      detail: `Read · ${tab.url}`,
      ref: tab,
    });
    candidates.push({
      id: `tab:${tab.pageId}:act`,
      section: "Tabs",
      label: `${tab.title || tab.url} · interact`,
      detail: `Read and act · ${tab.url}`,
      ref: { ...tab, access: "act" },
    });
  }
  const organization = input.organization;
  const shared = organization?.layout?.shared;
  if (shared && organization) {
    const groups = [
      ...shared.folders.map((folder) => ({
        id: folder.id,
        label: folder.name,
        ids: tabs.filter((tab) => shared.tabFolder[tab.pageId] === folder.id).map((tab) => tab.pageId),
      })),
      ...shared.splitGroups.map((group) => ({ id: group.id, label: "Split group", ids: group.panes })),
    ];
    for (const group of groups) {
      if (!group.ids.length) continue;
      const members = group.ids.flatMap((id) => {
        const tab = tabs.find((value) => value.pageId === id);
        return tab
          ? [
              {
                pageId: tab.pageId,
                url: tab.url,
                title: tab.title,
                documentEpoch: tab.documentEpoch,
                sessionId: tab.sessionId,
                access: "read" as const,
              },
            ]
          : [];
      });
      if (members.length !== group.ids.length) continue;
      candidates.push({
        id: `group:${group.id}`,
        section: "Folders and groups",
        label: group.label,
        detail: `${members.length} pages · read only`,
        ref: { kind: "group", groupId: group.id, members },
      });
    }
    for (const space of shared.spaces)
      if (space.workspaceId && !space.archived)
        candidates.push({
          id: `space:${space.id}`,
          section: "Spaces",
          label: space.name,
          detail: "Read only",
          ref: {
            kind: "space",
            spaceId: space.id,
            workspaceId: space.workspaceId,
            revision: organization.revision,
          },
        });
  }
  for (const routine of input.routines ?? [])
    if (!routine.archivedAt)
      candidates.push({
        id: `skill:${routine.routineId}`,
        section: "Skills",
        label: routine.title,
        detail: "Available for this turn",
        ref: { kind: "skill", routineId: routine.routineId, revision: routine.revision },
      });
  for (const connector of input.connectors?.entries ?? [])
    if (connector.state === "active" && input.connectors?.bindings[connector.connectorId])
      candidates.push({
        id: `connector:${connector.connectorId}`,
        section: "Connectors",
        label: connector.label,
        detail: "Available for this turn · current permissions apply",
        ref: {
          kind: "connector",
          connectorId: connector.connectorId,
          authorityDigest: input.connectors.bindings[connector.connectorId],
        },
      });
  return candidates;
}
export function mentionChipStatus(
  ref: MentionRef,
  pages: readonly PageTarget[],
): "Available" | "Changed" | "Closed" {
  const members = ref.kind === "tab" ? [ref] : ref.kind === "group" ? ref.members : [];
  let changed = false;
  for (const member of members) {
    const current = pages.find((page) => page.pageId === member.pageId);
    if (!current || current.viewStatus === "detached" || current.viewStatus === "crashed") return "Closed";
    changed ||=
      current.sessionId !== member.sessionId ||
      current.documentEpoch !== member.documentEpoch ||
      current.url !== member.url;
  }
  return changed ? "Changed" : "Available";
}
