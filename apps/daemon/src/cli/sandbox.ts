import { setTimeout as delay } from 'node:timers/promises';
import { type Node, type Pattern, parse } from 'acorn';
import {
  getQuickJS,
  type QuickJSContext,
  type QuickJSDeferredPromise,
  type QuickJSHandle,
  type QuickJSRuntime,
} from 'quickjs-emscripten';

function compile(code: string) {
  const program = parse(code, {
    ecmaVersion: 2023,
    sourceType: 'script',
    allowAwaitOutsideFunction: true,
  });
  const raw = (node: Node) => code.slice(node.start, node.end);
  function binding(pattern: Pattern): string {
    switch (pattern.type) {
      case 'Identifier':
        return `globalThis.${pattern.name}`;
      case 'RestElement':
        return `...${binding(pattern.argument)}`;
      case 'AssignmentPattern':
        return `${binding(pattern.left)} = ${raw(pattern.right)}`;
      case 'ArrayPattern':
        return `[${pattern.elements.map((item) => (item ? binding(item) : '')).join(',')}]`;
      case 'ObjectPattern':
        return `{${pattern.properties
          .map((property) => {
            if (property.type === 'RestElement') return binding(property);
            const key = property.computed
              ? `[${raw(property.key)}]`
              : raw(property.key);
            return `${key}: ${binding(property.value)}`;
          })
          .join(',')}}`;
      default:
        throw new Error('Unsupported top-level binding.');
    }
  }
  function validate(value: unknown): void {
    if (!value || typeof value !== 'object') return;
    if (
      'type' in value &&
      [
        'ImportExpression',
        'ImportDeclaration',
        'ExportNamedDeclaration',
        'ExportDefaultDeclaration',
      ].includes(String(value.type))
    )
      throw new Error(
        'Imports and exports are unavailable in the browser sandbox.',
      );
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) child.forEach(validate);
      else if (child && typeof child === 'object') validate(child);
    }
  }
  validate(program);
  const declarations: string[] = [];
  const body = program.body
    .map((node, index) => {
      if (node.type === 'VariableDeclaration') {
        if (node.kind === 'using' || node.kind === 'await using')
          throw new Error('Resource bindings are unavailable in this sandbox.');
        return node.declarations
          .map((declaration) => {
            if (declaration.id.type === 'Identifier')
              declarations.push(declaration.id.name);
            return `(${binding(declaration.id)} = ${declaration.init ? raw(declaration.init) : 'undefined'});`;
          })
          .join('\n');
      }
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'ClassDeclaration'
      ) {
        if (!node.id) throw new Error('Top-level declarations need a name.');
        declarations.push(node.id.name);
        return `globalThis.${node.id.name} = (${raw(node)});`;
      }
      if (
        index === program.body.length - 1 &&
        node.type === 'ExpressionStatement'
      )
        return `return (${raw(node.expression)});`;
      return raw(node);
    })
    .join('\n');
  return { source: `(async () => {\n${body}\n})()`, declarations };
}

// QuickJS supplies an independent WebAssembly heap, with no Node globals or imports.
export class Sandbox {
  private deadline = 0;
  private signal: AbortSignal | undefined;
  private closed = false;
  private running = false;
  private output: string[] = [];
  private pending = new Set<QuickJSDeferredPromise>();
  private tasks = new Set<Promise<void>>();
  private bindings = new Set<string>();
  private constructor(
    readonly vm: QuickJSContext,
    readonly runtime: QuickJSRuntime,
    private invoke: (
      method: string,
      params: unknown,
      signal: AbortSignal,
    ) => Promise<unknown>,
  ) {}

  static async create(
    invoke: (
      method: string,
      params: unknown,
      signal: AbortSignal,
    ) => Promise<unknown>,
  ) {
    const module = await getQuickJS();
    const runtime = module.newRuntime();
    runtime.setMemoryLimit(64 * 1024 * 1024);
    runtime.setMaxStackSize(1024 * 1024);
    const vm = runtime.newContext();
    const sandbox = new Sandbox(vm, runtime, invoke);
    runtime.setInterruptHandler(
      () =>
        sandbox.closed ||
        Boolean(sandbox.signal?.aborted) ||
        (sandbox.deadline > 0 && Date.now() > sandbox.deadline),
    );
    const log = vm.newFunction('log', (...args) => {
      const value = args
        .map((argument) => JSON.stringify(vm.dump(argument)))
        .join(' ');
      if (sandbox.output.join('\n').length + value.length > 65_536)
        throw new Error('Sandbox console output exceeded 64 KiB.');
      sandbox.output.push(value);
      return vm.undefined;
    });
    const consoleObject = vm.newObject();
    for (const name of ['log', 'warn', 'error', 'info'])
      vm.setProp(consoleObject, name, log);
    vm.setProp(vm.global, 'console', consoleObject);
    consoleObject.dispose();
    log.dispose();
    const rpc = vm.newFunction('__auxRpc', (methodHandle, paramsHandle) => {
      if (!methodHandle || !paramsHandle || !sandbox.signal)
        return { error: vm.newError('Sandbox evaluation is not active.') };
      const method = vm.getString(methodHandle),
        params: unknown = vm.dump(paramsHandle);
      const promise = vm.newPromise();
      sandbox.pending.add(promise);
      const task = sandbox
        .invoke(method, params, sandbox.signal)
        .then((value) => {
          if (sandbox.closed || !promise.alive) return;
          const json = JSON.stringify(value ?? null);
          if (json.length > 4_194_304)
            throw new Error('Browser result exceeded 4 MiB.');
          const result = vm.unwrapResult(
            vm.evalCode(`JSON.parse(${JSON.stringify(json)})`),
          );
          promise.resolve(result);
          result.dispose();
        })
        .catch((error: unknown) => {
          if (sandbox.closed || !promise.alive) return;
          const result = vm.newError(
            error instanceof Error
              ? error.message
              : 'Browser operation failed.',
          );
          promise.reject(result);
          result.dispose();
        })
        .finally(() => {
          sandbox.pending.delete(promise);
          sandbox.tasks.delete(task);
          promise.dispose();
        });
      sandbox.tasks.add(task);
      return promise.handle;
    });
    vm.setProp(vm.global, '__auxRpc', rpc);
    rpc.dispose();
    vm.unwrapResult(
      vm.evalCode(`
      globalThis.browser = {
        getTabs: () => __auxRpc('tabs', {}),
        openTab: (url) => __auxRpc('open', {url}),
        closeTab: (tabId) => __auxRpc('close', {tabId}),
        attachTab: (targetId) => {
          if (typeof targetId !== 'string' || !targetId) throw new Error('A stable target identity is required.');
          return {
            targetId,
            snapshot: () => __auxRpc('snapshot', {targetId}),
            screenshot: () => __auxRpc('screenshot', {targetId}),
            navigate: (url) => __auxRpc('navigate', {targetId, url}),
            click: (ref, documentUrl) => __auxRpc('click', {targetId, ref, documentUrl}),
            type: (ref, text, documentUrl) => __auxRpc('type', {targetId, ref, text, documentUrl}),
            scroll: (x,y) => __auxRpc('scroll', {targetId, x,y}),
          };
        },
      };
      globalThis.display = (value) => console.log(value);
    `),
    ).dispose();
    return sandbox;
  }

  async run(code: string, signal: AbortSignal, timeoutMs = 120_000) {
    if (this.closed) throw new Error('Sandbox is closed.');
    if (this.running) throw new Error('Sandbox evaluation is already running.');
    const compiled = compile(code);
    for (const name of compiled.declarations)
      if (this.bindings.has(name))
        throw new Error(`Binding is already declared: ${name}`);
    this.running = true;
    this.output = [];
    this.signal = signal;
    this.deadline = Date.now() + timeoutMs;
    const startedAt = Date.now();
    let result: QuickJSHandle | undefined;
    try {
      signal.throwIfAborted();
      result = this.vm.unwrapResult(
        this.vm.evalCode(compiled.source, 'aux-repl.js'),
      );
      for (const name of compiled.declarations) this.bindings.add(name);
      while (true) {
        signal.throwIfAborted();
        if (Date.now() > this.deadline)
          throw new Error('Sandbox evaluation timed out.');
        const jobs = this.runtime.executePendingJobs(100);
        if (jobs.error) {
          const error: unknown = this.vm.dump(jobs.error);
          jobs.error.dispose();
          throw new Error(JSON.stringify(error));
        }
        const state = this.vm.getPromiseState(result);
        if (state.type === 'fulfilled') {
          try {
            return {
              output: this.output.join('\n'),
              result: this.vm.dump(state.value) as unknown,
              artifacts: [],
              elapsedMs: Date.now() - startedAt,
            };
          } finally {
            state.value.dispose();
          }
        }
        if (state.type === 'rejected') {
          const error: unknown = this.vm.dump(state.error);
          state.error.dispose();
          throw new Error(JSON.stringify(error));
        }
        await delay(5);
      }
    } catch (error) {
      // An abandoned async job cannot run later with a different account/tool boundary.
      this.closed = true;
      throw error;
    } finally {
      result?.dispose();
      this.running = false;
      this.deadline = 0;
      this.signal = undefined;
      if (this.closed) this.dispose();
    }
  }
  private dispose() {
    for (const promise of this.pending) promise.dispose();
    this.pending.clear();
    this.vm.dispose();
    this.runtime.dispose();
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    if (!this.running) this.dispose();
  }
}
