/** Test harness: evaluates an extension chunk in a VM with every import stubbed, renders its exported
 * components under scripted scenarios, and serializes what they render and what their effects and
 * handlers do. Two chunks that serialize the same render the same tree from the same props and
 * call the same things in the same order. Needs node --experimental-vm-modules. */
import vm from 'node:vm';
import {createHash} from 'node:crypto';

const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 12);
const LABEL = Symbol('label');
/** Where a spread stub came from: `options[STUB_PATH]` (see the stub's ownKeys). */
export const STUB_PATH = Symbol.for('aux.stub.path');

/** One stub world, shared by the chunks being compared, so an imported value is the same object in each. */
// Chunk code under stubs may start async work that fails (an effect's fire-and-forget fetch); that
// outcome is not part of a render, so such rejections are dropped rather than failing the run.
let rejectionsHandled = false;
const chunkIdentifiers = new Set();
function ignoreChunkRejections() {
  if (rejectionsHandled) return;
  rejectionsHandled = true;
  process.on('unhandledRejection', reason => {
    const stack = String(reason?.stack);
    if (![...chunkIdentifiers].some(id => stack.includes(`(${id}:`) || stack.includes(`at ${id}:`))) throw reason;
  });
}

/** `constants` gives imports that are plain values: {'./chunk.js#name': value}. */
export function createWorld(constants = {}) {
  ignoreChunkRejections();
  const log = [];
  const proxies = new Map();
  const label = value => (value && value[LABEL]) || undefined;
  // Any import we do not model: a callable, constructible, indexable, iterable stand-in that answers
  // every question deterministically. A call's result is named after its arguments, so passing
  // different arguments to a stub shows up downstream.
  const stub = path => {
    if (proxies.has(path)) return proxies.get(path);
    const target = function () {};
    const proxy = new Proxy(target, {
      get(_, key) {
        if (key === LABEL || key === STUB_PATH) return path;
        if (key === Symbol.toPrimitive) return hint => (hint === 'number' ? 1 : path);
        if (key === Symbol.iterator) return function* () { yield stub(`${path}[0]`); yield stub(`${path}[1]`); };
        if (key === 'then') return undefined;
        if (key === 'prototype') return target.prototype;
        if (typeof key === 'symbol') return undefined;
        return stub(`${path}.${key}`);
      },
      apply: (_, __, args) => {
        const named = `${path}(${signature(args)})`;
        log.push(['call', named]);
        // A scene can say what an import returns, to drive the branches a component takes. A key
        // that starts with * matches by suffix, for values a chunk builds at load (a schema's safeParse).
        const imports = scenario.imports;
        const key = imports && (path in imports ? path : Object.keys(imports).find(name => name.startsWith('*') && path.endsWith(name.slice(1))));
        if (key) {
          const value = imports[key];
          return typeof value === 'function' && !label(value) ? value(...args) : value;
        }
        return stub(named);
      },
      construct: (_, args) => (scenario.imports?.[`new ${path}`]?.(...args) ?? stub(`new ${path}(${signature(args)})`)),
      has: () => false,
      // Spreading a stub ({...trpc.x.queryOptions(), retry: false}) keeps its path under STUB_PATH,
      // so a scene can still tell which query it is.
      ownKeys: target => [...Reflect.ownKeys(target), STUB_PATH],
      getOwnPropertyDescriptor: (target, key) => (key === STUB_PATH ? {value: path, enumerable: true, configurable: true}
        : Reflect.getOwnPropertyDescriptor(target, key)),
    });
    proxies.set(path, proxy);
    return proxy;
  };

  const signature = args => (args.length ? hash(JSON.stringify(shallow(args, 0))) : '');
  function shallow(value, depth) {
    if (value === null || typeof value !== 'object' && typeof value !== 'function') return value;
    if (label(value)) return `stub:${label(value)}`;
    if (depth > 8) return '…';
    if (typeof value === 'function') return `fn(${value.length})`;
    if (Array.isArray(value)) return value.map(item => shallow(item, depth + 1));
    if (value.$element) return {type: shallow(value.type, depth + 1), props: shallow(value.props, depth + 1)};
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shallow(item, depth + 1)]));
  }

  // Errors code throws keep their message; engine errors quote source text (local names), so only their kind.
  const thrown = error => (error?.name === 'Error' ? String(error.message).slice(0, 80) : String(error?.name));

  const scenario = {context: undefined, state: undefined};
  let stateCalls = 0;
  const element = (type, props, key) => ({$element: true, type, props: props ?? {}, key});
  const jsxRuntime = {jsx: element, jsxs: element, Fragment: 'Fragment'};
  const forwardRefs = new WeakSet();
  const lazies = new WeakSet();
  const React = new Proxy({
    forwardRef: render => { const value = {$forwardRef: render}; forwardRefs.add(value); return value; },
    memo: value => value,
    // A lazy component is named by what its loader asks the preload helper for (the chunk and its deps).
    lazy: loader => { const value = {$lazy: loader}; lazies.add(value); return value; },
    createContext: value => ({$context: true, Provider: 'Context.Provider', Consumer: 'Context.Consumer', value}),
    useContext: () => scenario.context,
    use: () => scenario.context,
    // A scene's `state` sets every useState: one value, or a list taken in call order, where an
    // undefined entry keeps the component's own initial value. `onSetState(slot, next)` hears every
    // write, so a test can apply them; `timers` collects setTimeout's [callback, delay]; `socket`
    // builds what `new WebSocket` returns.
    useState: init => {
      const slot = stateCalls++;
      const value = Array.isArray(scenario.state) ? scenario.state[slot % scenario.state.length] : scenario.state;
      return [value === undefined ? typeof init === 'function' ? init() : init : value, next => { log.push(['setState', describe(next)]); scenario.onSetState?.(slot, next); }];
    },
    useReducer: (_, init) => [init, value => log.push(['dispatch', describe(value)])],
    // `domRef` stands in for the element a ref (initially null) is attached to.
    useRef: value => ({current: value === null && scenario.domRef ? scenario.domRef : value}),
    useId: () => ':r0:',
    useMemo: make => make(),
    useCallback: fn => fn,
    useEffect: run => effects.push(run),
    useLayoutEffect: run => effects.push(run),
    useInsertionEffect: () => {},
    useEffectEvent: fn => fn,
    useSyncExternalStore: (_, get) => get(),
    // Handlers a component exposes on its ref run like its effects, each with the scene's event.
    useImperativeHandle: (_, make) => effects.push(() => Object.fromEntries(Object.entries(make() ?? {}).map(([key, value]) => [key, describeProp(key, value, 0)]))),
    useTransition: () => [false, fn => fn()],
    useDeferredValue: value => value,
    isValidElement: value => Boolean(value?.$element),
    Children: {forEach: (children, fn) => [children].flat(Infinity).forEach(fn), map: (children, fn) => [children].flat(Infinity).map(fn),
      toArray: children => [children].flat(Infinity), count: children => [children].flat(Infinity).length, only: children => children},
    Fragment: 'Fragment',
    cloneElement: (el, props) => ({...el, props: {...el.props, ...props}}),
    createElement: (type, props, ...children) => element(type, {...props, children}),
  }, {get: (target, key) => (key in target ? target[key] : stub(`React.${String(key)}`))});
  let effects = [];

  // Like clsx: strings, and an object's keys whose values are truthy.
  const cn = (...parts) => parts.flat(Infinity).flatMap(part => (part && typeof part === 'object' && !label(part)
    ? Object.keys(part).filter(key => part[key]) : [part])).filter(part => typeof part === 'string' && part).join(' ');
  const cva = (base, config = {}) => (props = {}) => {
    const out = [base];
    for (const [name, options] of Object.entries(config.variants ?? {})) {
      const value = props[name] ?? config.defaultVariants?.[name];
      if (value !== undefined && options[value] !== undefined) out.push(options[value]);
    }
    return cn(out, props.className, props.class);
  };
  const MODELLED = {A: module => module, E: () => React, w: () => jsxRuntime, C: cn, u: cva};

  // Functions found in a render (callbacks in props and objects) are called once to compare what they do.
  const calling = new Set();
  function describe(value, depth = 0) {
    if (depth > 150) return '…';
    if (value === null || typeof value !== 'object' && typeof value !== 'function') return value;
    if (label(value)) return `stub:${label(value)}`;
    if (Array.isArray(value)) return value.map(item => describe(item, depth + 1));
    if (value.$element) return renderElement(value, depth + 1);
    // An async function rendered as a component: its outcome is not part of the render.
    if (typeof value.then === 'function' && value.constructor?.name === 'Promise') return value.catch(() => {}), 'promise';
    if (value.$context) return 'context';
    if (forwardRefs.has(value)) return `forwardRef:${hash(String(value.$forwardRef))}`;
    if (lazies.has(value)) { let named; try { named = describe(value.$lazy(), depth + 1); } catch (error) { named = `threw:${thrown(error)}`; } return {lazy: named}; }
    if (typeof value === 'function') {
      if (calling.has(value) || calling.size > 4) return `fn(${value.length})`;
      calling.add(value);
      const before = log.length;
      const returns = call(value, stub('argument'));
      calling.delete(value);
      return {fn: value.length, returns, log: log.splice(before)};
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, describe(item, depth + 1)]));
  }

  // A render: string and stub types stay as they are; a component of the chunk is called with its
  // props and its output rendered in its place, so local helpers may differ in name and shape.
  function renderElement({type, props, key}, depth) {
    let name = typeof type === 'string' ? type : label(type) ? `stub:${label(type)}` : undefined;
    const component = !name && (typeof type === 'function' ? type : forwardRefs.has(type) ? type.$forwardRef : undefined);
    if (component) {
      try { return describe(component(props, props.ref ?? null), depth); } catch (error) { name = `component threw ${thrown(error)}`; }
    }
    name ??= describe(type, depth);
    const shown = {};
    for (const [prop, value] of Object.entries(props)) shown[prop] = describeProp(prop, value, depth);
    return {type: name, key, props: shown};
  }

  function call(component, ...args) {
    try {
      const result = component(...args);
      // An async effect or handler: its outcome is not part of the render; keep it from going unhandled.
      if (result instanceof Promise || result?.constructor?.name === 'Promise') return result.catch(() => {}), 'promise';
      return describe(result);
    } catch (error) { return `threw:${thrown(error)}`; }
  }

  // Render props are called with stub arguments; handlers are fired with a stub event and their log kept.
  function describeProp(prop, value, depth) {
    if (typeof value !== 'function' || label(value)) return describe(value, depth + 1);
    if (prop === 'render' || prop === 'children') return {renderProp: call(value, scenario.renderProps ?? stub('renderProps'), scenario.renderState ?? stub('renderState'))};
    if (/^on[A-Z]/.test(prop)) {
      const before = log.length;
      const result = call(value, ...(scenario.args ?? [scenario.event ?? stub(`event:${prop}`)]));
      return {handler: result, log: log.splice(before)};
    }
    return describe(value, depth + 1);
  }

  /** Sets the scene that stubs answer by, for calls made outside a render (a helper called directly). */
  function enter(scene = {}) {
    Object.assign(scenario, {context: undefined, state: undefined, event: undefined, renderProps: undefined, renderState: undefined, imports: undefined, frames: false, window: undefined, args: undefined,
      onSetState: undefined, timers: undefined, socket: undefined, liveEffects: false, domRef: undefined, chrome: undefined}, scene);
  }

  /** Renders `component` with `props` under `scene`, then runs the effects it registered. */
  function render(component, props, scene = {}) {
    enter(scene);
    log.length = 0;
    stateCalls = 0;
    seed = 1;
    effects = [];
    const tree = describe(component.$forwardRef ? {$element: true, type: component, props} : {$element: true, type: component, props});
    // An effect's cleanup is a function in its result, so comparing it runs it; `liveEffects` leaves effects running.
    const ran = effects.map(run => { const before = log.length; const cleanup = scenario.liveEffects ? void run() : call(run); return {cleanup, log: log.splice(before)}; });
    return {tree, effects: ran, log: log.splice(0)};
  }

  // A document whose canvases really draw, so pixel work (the switch's lens map) is compared too.
  const canvas = () => {
    let painted = '';
    const element = {width: 0, height: 0,
      getContext: () => ({
        createImageData: (width, height) => ({width, height, data: new Uint8ClampedArray(width * height * 4)}),
        putImageData: image => { painted = hash(Buffer.from(image.data).toString('base64')); },
      }),
      toDataURL: type => `data:${type};painted=${painted}`};
    return element;
  };
  const document = new Proxy({createElement: tag => (tag === 'canvas' ? canvas() : stub(`document.createElement(${tag})`))},
    {get: (target, key) => (key in target ? target[key] : stub(`document.${String(key)}`))});

  // The clock stands still, so "since" and "worked for" values compare equal between the two runs.
  const NOW = Date.UTC(2026, 9, 30, 12);
  const FixedDate = class extends Date {
    constructor(...args) { if (args.length) super(...args); else super(NOW); }
    static now() { return NOW; }
  };
  // Math.random repeats the same sequence on every render, so random skeleton widths compare equal.
  let seed = 1;
  const seededMath = Object.assign(Object.create(Math), {random: () => (seed = (seed * 16807) % 2147483647) / 2147483647});

  /** Evaluates a chunk's text as a module; resolves with its namespace. */
  async function evaluate(text, identifier) {
    const context = vm.createContext({
      // A scene can give the window's values, and `frames: true` runs animation frames at once.
      window: new Proxy(stub('window'), {get: (target, key) => (scenario.window && key in scenario.window ? scenario.window[key] : target[key])}),
      document, navigator: stub('navigator'), globalThis: undefined,
      requestAnimationFrame: fn => (log.push(['requestAnimationFrame']), scenario.frames && fn(NOW), 1), cancelAnimationFrame: () => log.push(['cancelAnimationFrame']),
      setTimeout: (fn, delay) => (log.push(['setTimeout', delay]), scenario.timers?.push([fn, delay]), 1), clearTimeout: () => log.push(['clearTimeout']),
      setInterval: (fn, delay) => (log.push(['setInterval', delay]), scenario.timers?.push([fn, delay]), 1), clearInterval: () => log.push(['clearInterval']),
      ResizeObserver: stub('ResizeObserver'), MutationObserver: stub('MutationObserver'), matchMedia: stub('matchMedia'),
      getComputedStyle: stub('getComputedStyle'), queueMicrotask: () => {}, console, Math: seededMath, JSON, Object, Array, Map, Set, WeakMap, WeakSet,
      Symbol, Promise, Error, TypeError, Number, String, Boolean, RegExp, Date: FixedDate, Reflect, Proxy, URL, parseFloat, parseInt, isNaN, Infinity, NaN,
      File, Blob, FormData, URLSearchParams, Intl, TextEncoder, TextDecoder, AbortController, Event, EventTarget, structuredClone, atob, btoa,
      encodeURIComponent, decodeURIComponent, isFinite, Uint8Array, Uint8ClampedArray, ArrayBuffer, DataView, BigInt, WeakRef,
      CSS: stub('CSS'), crypto: stub('crypto'), location: stub('location'), history: stub('history'), localStorage: stub('localStorage'),
      sessionStorage: stub('sessionStorage'), fetch: stub('fetch'), self: undefined,
      // A scene can give the extension API's values too.
      chrome: new Proxy(stub('chrome'), {get: (target, key) => (scenario.chrome && key in scenario.chrome ? scenario.chrome[key] : target[key])}), global: undefined,
      HTMLElement: stub('HTMLElement'), Audio: stub('Audio'), FileReader: stub('FileReader'), Element: stub('Element'), Node: stub('Node'), CustomEvent: stub('CustomEvent'),
      performance: {now: () => NOW}, IntersectionObserver: stub('IntersectionObserver'), customElements: stub('customElements'), CSSStyleSheet: stub('CSSStyleSheet'),
      ClipboardItem: stub('ClipboardItem'), WebSocket: Object.assign(function WebSocket(url, protocols) { return scenario.socket(url, protocols); }, {OPEN: 1}), Worker: stub('Worker'), SVGElement: stub('SVGElement'), DOMParser: stub('DOMParser'),
      InputEvent: class InputEvent extends Event { constructor(type, init = {}) { super(type, init); this.data = init.data ?? null; this.inputType = init.inputType ?? ''; } },
    });
    context.globalThis = context;
    chunkIdentifiers.add(identifier);
    const module = new vm.SourceTextModule(text, {identifier, context});
    await module.link(async (specifier, referencing) => {
      const imported = [...text.matchAll(/import\{([^}]*)\}from"([^"]+)"/g)].filter(([, , from]) => from === specifier)
        .flatMap(([, list]) => list.split(',').map(entry => entry.trim().split(/\s+as\s+/)[0]));
      const exports = [...new Set(imported)];
      const synthetic = new vm.SyntheticModule(exports, function () {
        for (const name of exports) {
          const modelled = specifier.startsWith('./browser-color-scheme-') && MODELLED[name];
          this.setExport(name, modelled || constants[`${specifier}#${name}`] || stub(`${specifier}#${name}`));
        }
      }, {identifier: specifier, context});
      return synthetic;
    });
    await module.evaluate();
    return module.namespace;
  }

  return {enter, evaluate, render, stub};
}
