import type { ConversationSource } from "@aux/contracts";
import { hostOf } from "../workspace";
import { shellIconGlobe, shellIconOpen } from "./icons";
import { ListRow } from "../ui";

export function sourceDescription(source: ConversationSource, profileNames: Record<string, string> = {}) {
  const origin = source.kind === "calendar" ? `Google Calendar · ${source.accountKey}` : `${source.kind === "memory" ? "Saved article · " : ""}${hostOf(source.url)}`;
  return `${origin}${source.profileId ? ` · ${profileNames[source.profileId] ?? "Unknown Profile"}` : ""} · ${new Date(source.observedAt).toLocaleString()}`;
}

/** Display only recorded provenance; never fetch a remote favicon or invent a snippet. */
export function SourceRow({ source, profileNames, onOpen }: { source: ConversationSource; profileNames?: Record<string, string>; onOpen(): void }) {
  return <ListRow title={source.title || hostOf(source.url)} description={sourceDescription(source, profileNames)} leading={shellIconGlobe} trailing={shellIconOpen} onOpen={onOpen} />;
}
