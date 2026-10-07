# Aux

Aux is a native Chromium browser with one shared execution runtime for its human interface, agent, CLI, SDK and MCP clients. It keeps browser sessions in the selected Profile and runtime state in that Profile’s Aux Runtime Data directory.

Read the [roadmap](docs/ROADMAP.md) for the product direction, [status](docs/STATUS.md) for current implementation and validation, and [architecture](docs/ARCHITECTURE.md) for the native host design. Native build instructions are in [chromium/BUILDING.md](chromium/BUILDING.md).

## Development

```bash
pnpm install
npm run check
export AUX_CHROMIUM_SRC="$HOME/aux-chromium-product/chromium/src"
node scripts/dev.mjs --temp-profile
```

The current native UI preview app is `~/aux-chromium-product/chromium/src/out/AuxFast/Aux.app`, with its runtime packaged. See [native build instructions](chromium/BUILDING.md) for the distinction between that app and the incremental AuxDev workflow.

The native launcher builds incrementally, stages the renderer and runtime, and opens Aux. Omit `--temp-profile` to use the persistent development Profile. `npm run dev` uses the same native launcher; `npm run dev:shell` opens the scripted renderer preview.

`npm run check` builds workspace packages, checks renderer types, runs lint and executes unit tests. Tests importing `@aux/runtime` resolve compiled `apps/runtime/dist` output; rebuild after runtime source changes before running focused tests directly.

```bash
npx tsc -b
npm test -- tests/unit/example.test.ts
```

Run `npm run format` on demand. `npm run size` and `npm run bridge:coverage` report advisory measurements. Development uses local checks without GitHub Actions, Dependabot or Git hooks.

## Runtime configuration

Use `AUX_*` environment variables; process environment overrides dotenv values. `AUX_DATA_DIR` selects the runtime data directory, and `AUX_RUNTIME_FILE` selects the connection descriptor. The runtime database is `aux-state.sqlite`. Native browser automation connects through the browser’s private CDP broker.

The product direction is vertical tabs by default, real browser sessions, user-controlled automation, and one coherent AI engine. Planned functionality and any remaining validation are recorded in the roadmap and status; release signing, notarization and distribution are later work.
