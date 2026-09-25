/** The same bounded search key is used by the shell and Profile store. */
export const normalizeCommandRankingQuery = (query: string) =>
  query.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase().slice(0, 160);
