export function findChromium(env?: NodeJS.ProcessEnv): string | null;
export function withChromium<T extends NodeJS.ProcessEnv>(env?: T): T & { VECTOR_BROWSER_PATH?: string };
