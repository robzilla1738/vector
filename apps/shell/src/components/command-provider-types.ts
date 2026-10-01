import type { CommandRankingSource } from "@aux/contracts";
import type { AutocompleteMatch } from "../bridge";
import type { ReactNode } from "react";

interface SuggestionBase {
  id: string;
  pinned?: boolean;
  url?: string;
  providerType?: AutocompleteMatch["type"];
  icon: ReactNode;
  title: string;
  detail?: string;
  hint?: string;
  run: () => unknown | Promise<unknown>;
}
export type ProviderSuggestion = SuggestionBase & { section: CommandRankingSource };
export type Suggestion = SuggestionBase & ({ section: "intent" } | { section: CommandRankingSource });
