import type { Plugin } from "vite";
export function annotateContractSchemaFactories(
  code: string,
  filename?: string,
): {
  code: string;
  map: {
    version: 3;
    file: string;
    sources: string[];
    sourcesContent: string[];
    names: string[];
    mappings: string;
  };
  annotatedCalls: number;
} | null;
export function contractSchemaPurityPlugin(directory: string): Plugin;
