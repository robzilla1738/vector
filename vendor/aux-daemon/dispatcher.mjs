/** Routes the daemon's tRPC namespaces: those in the registry to Aux's implementations, the rest
 * to the supplied routers. A namespace is a root router (`inbox`) or one nested in it
 * (`sessions.tabs`). The composed daemon entry loads this module before any router exists and
 * calls `compose` where it builds `auxRouter` (integration.mjs). */
import {NAMESPACES, STORES} from './registry.mjs';

/** A router's procedures and nested routers; nested routers are plain records already. */
const recordOf = value => value?._def?.record ?? (value && !value._def ? value : undefined);

/** Each owned procedure must replace a supplied one of the same kind, so clients see one API. A
 * plain record in `owned` replaces procedures of the supplied nested router of that name. */
function replaceProcedures(namespace, record, owned) {
  for (const [name, procedure] of Object.entries(owned)) {
    const original = record[name], path = `${namespace}.${name}`;
    if (!procedure._def) {
      if (!original || original._def) throw Error(`Aux daemon: ${path} is not a supplied router`);
      replaceProcedures(path, record[name] = {...original}, procedure);
      continue;
    }
    if (!original?._def) throw Error(`Aux daemon: ${path} is not a supplied procedure`);
    if (procedure._def.type !== original._def.type) throw Error(`Aux daemon: ${path} is a ${procedure._def.type}, the supplied one a ${original._def.type}`);
    // Meta mounts some procedures as plain HTTP routes as well.
    if (JSON.stringify(procedure._def.meta) !== JSON.stringify(original._def.meta)) throw Error(`Aux daemon: ${path} must keep the supplied HTTP route meta`);
    record[name] = procedure;
  }
}

const leafNames = (procedures, prefix = '') => Object.entries(procedures)
  .flatMap(([name, procedure]) => procedure._def ? [prefix + name] : leafNames(procedure, `${prefix}${name}.`));

const load = async files => Object.fromEntries(await Promise.all(Object.entries(files).map(async ([name, file]) => [name, await import(new URL(file, import.meta.url))])));

export async function createAuxOwnedDaemon(namespaces = NAMESPACES, storeFiles = STORES) {
  const modules = await load(namespaces), storeModules = await load(storeFiles);
  const owned = {}, stores = {};
  return {
    /** A store Aux implements, created on first use; `bindings` returns the bundle's bindings. */
    store(name, bindings) {
      if (!storeModules[name]) throw Error(`Aux daemon: no ${name} store`);
      return stores[name] ??= storeModules[name].create(bindings());
    },
    /** The stores the bundle has reached so far. */
    storesInUse: () => Object.keys(stores).sort(),
    /** The root router record with every registered namespace's procedures replaced by Aux's. */
    compose(supplied, bindings) {
      const records = {};
      for (const [namespace, module] of Object.entries(modules)) {
        const [root, ...nested] = namespace.split('.');
        let record = records[root] ??= {...recordOf(supplied[root])};
        for (const name of nested) record = record[name] = {...recordOf(record[name])};
        if (!Object.keys(record).length) throw Error(`Aux daemon: the supplied daemon has no ${namespace} router`);
        const procedures = module.create(bindings);
        replaceProcedures(namespace, record, procedures);
        owned[namespace] = leafNames(procedures);
      }
      return {...supplied, ...Object.fromEntries(Object.entries(records).map(([root, record]) => [root, bindings.router(record)]))};
    },
    /** Namespace → procedure names (dotted below nested routers) Aux serves, once composed. */
    owned: () => structuredClone(owned),
  };
}
