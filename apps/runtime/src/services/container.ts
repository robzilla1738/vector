export type ServiceFactories<T extends object> = {
  [K in keyof T]-?: (services: T) => T[K];
};

export interface ServiceContainer<T extends object> {
  readonly services: T;
  get<K extends keyof T>(key: K): T[K];
  /** Read an existing instance without constructing it during shutdown. */
  peek<K extends keyof T>(key: K): T[K] | undefined;
  /** Includes factories whose initialized value is undefined. */
  has<K extends keyof T>(key: K): boolean;
}

/** Shared dependency getters preserve lazy construction through service graphs. */
export function createServiceContainer<T extends object>(
  factories: ServiceFactories<T>,
): ServiceContainer<T> {
  const values = new Map<keyof T, T[keyof T]>();
  const constructing: (keyof T)[] = [];
  const services = {} as T;
  const get = <K extends keyof T>(key: K): T[K] => {
    if (values.has(key)) return values.get(key) as T[K];
    if (constructing.includes(key)) {
      throw new Error(`Circular service dependency: ${[...constructing, key].map(String).join(" -> ")}`);
    }
    const factory = factories[key];
    if (!factory) throw new Error(`Unknown service: ${String(key)}`);
    constructing.push(key);
    try {
      const value = factory(services);
      values.set(key, value);
      return value;
    } finally {
      constructing.pop();
    }
  };
  for (const key of Reflect.ownKeys(factories) as (keyof T)[]) {
    Object.defineProperty(services, key, { enumerable: true, get: () => get(key) });
  }
  return {
    services,
    get,
    peek: (key) => values.get(key) as T[typeof key] | undefined,
    has: (key) => values.has(key),
  };
}
