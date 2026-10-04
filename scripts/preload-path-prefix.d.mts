import type { Plugin } from 'vite';
export function factorPreloadPathPrefix(code: string, parse: (code: string) => unknown): { code: string; urls: string[]; savedBytes: number } | null;
export function preloadPathPrefix(): Plugin;
