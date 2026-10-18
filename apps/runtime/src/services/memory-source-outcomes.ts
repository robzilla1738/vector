/** Exact producer-owned diagnostics that contain no recalled source text. */
export const memoryReadNoContentErrors = {
  changed: "This Memory source changed or is no longer eligible. Search again.",
  outside: "The requested line is outside this source.",
  retired: "The source changed while reading.",
} as const;
export const memorySearchFallbackReasons = {
  partial:
    "Local semantic ranking covers up to 256 diversified chunks; remaining eligible sources retain keyword ranking.",
  deadline:
    "Installed local embeddings are unavailable or exceeded the search deadline. Showing keyword matches.",
} as const;
