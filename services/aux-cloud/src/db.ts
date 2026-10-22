import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false,false> | undefined;
function database() {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

// Delay reading server credentials until a request or migration needs the DB.
export const sql: NeonQueryFunction<false,false> = new Proxy((() => {}) as unknown as NeonQueryFunction<false,false>, {
  apply: (_target, _self, args) => Reflect.apply(database(), undefined, args),
  get: (_target, key) => {
    const value = Reflect.get(database(), key);
    return typeof value === 'function' ? value.bind(database()) : value;
  },
});
