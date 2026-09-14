import type { ChildProcess } from "node:child_process";
export const FIXTURES: { name: string; script: string; port: number }[];
export function startFixtures(env?: Record<string, string>): ChildProcess[];
export function waitForFixtures(timeoutMs?: number): Promise<void>;
export function startFixturesIfNeeded(env?: Record<string, string>): Promise<ChildProcess[]>;
