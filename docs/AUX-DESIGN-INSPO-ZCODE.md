# ZCode design inspiration — Aux mapping

Source: [ZCode DESIGN.md](https://github.com/zai-org/ZCode/blob/main/DESIGN.md) and the referenced UI patterns, reviewed 2026-09-21.
Aux remains its own product. Tokens, conversation cards, and sidebar collapse are adapted into Aux names. Aux mark, Inter, and Lucide stay.

## Palette (use Zai Light / Zai Dark roles)

Map Zai semantic values onto Aux CSS variables. Do not import ZCode CSS or their logo.

| Zai role | Aux token | Dark | Light |
| --- | --- | --- | --- |
| background | `--bg-window` / `--surface-window` / `--surface-canvas` | `#161616` | `#f8f8f8` |
| header / panel | `--bg-1` / `--surface-panel` | `#202020` | `#ffffff` |
| sidebar | `--sb-bg` / `--surface-sidebar` | `#161616` | `#f0f0f0` |
| card / popover / menu / input | `--bg-2` / `--surface-card` / `--surface-popover` / `--surface-menu` / `--surface-input` | `#2b2b2b` | `#ffffff` |
| secondary / hover | `--bg-3` | `#363636` | `#e6e6e6` |
| brand (primary fill) | `--accent` inverse ink | `#f8f8f8` on charcoal | `#0d0d0d` on paper |
| icon-blue / links | `--link` / `--accent-blue` / `--icon-blue` | `#4099ff` | `#0b7fff` |
| accent surface | `--accent-blue-soft` only | never a page fill | never a page fill |
| success / warning / destructive | `--ok` / `--warn` / `--err` | `#46bf72` / `#ff8a30` / `#ff5c5c` | `#1e8a3e` / `#e07b00` / `#e03131` |
| confirmation waiting | `--wait` | `#87d9a4` on `rgba(70,191,114,.16)` | `#166b32` on `#eaf7ee` |
| diff added / removed | `--diff-add` / `--diff-remove` | not `--ok` / `--err` | not `--ok` / `--err` |
| find highlight | `--find-match` / `--find-active` | `#542500` / `#ff8a30` | `#fff4eb` / `#ffb26b` |

Idle-task purple and workflow-timeline colors stay out of Aux chrome.

## Tool-call presentation (conversation + agent rail)

Port interaction patterns, not `packages/ui`.

- Compact step cards with running / done / failed labels. Human op names, not raw JSON by default.
- Summary first; expand for chips, error codes, and redacted input.
- `fillCredential` nests under the previous step with a left-border rail. Secrets never render; only opaque `cref_` ids.
- URL / path / target chips when those artifacts already exist on the step.
- Entrance fade once per `stepId` while a run is live. Remount does not replay it.
- Assistant markdown uses the type scale. Tool chrome stays operational and separate.
- Takeover, needs-input, permission wait, and uncertain receipts share `--wait`.

## Sidebar open / close

- `⌘S` toggles expanded ↔ slim rail. The rail is outside the aside so collapse cannot strand the user.
- Collapsed rail shows the Aux mark; hover/focus reveals PanelLeftOpen plus the `⌘S` tooltip.
- Fully hidden remains a palette action and keeps the 7px edge hit-target.
- Width still persists. Collapse still uses the 240ms width transition.
- The only collapse control is not inside content that disappears.

## Type, radius, spacing

- `--ui-font-size` default 13px (12/13/14 in Appearance → Interface text). Never `html { font-size }`.
- Scale: xl +4 / lg +2 / base / caption -1 / sm -2 / xs -2 for chrome density.
- Radius nest xl → lg → md → sm. Menus lg/md. Dialogs and the chat input shell 2xl.
- 4px spacing rhythm.

## Do not use

- ZCode logo/mark, `packages/ui` imports, IDE/workbench chrome, TUI/CLI product shape
- Workflow timeline or idle-task colors as Aux chrome
- Claiming Chrome Web Store, 1Password, Apple Passwords, or passkey parity via polish
- Bright full-surface brand fills, playful gradients, casual `rounded-full` chips
- Success color as the waiting-chip fill (`--wait` is confirmation, not `--ok`)

## How to know this pass is done

- Tokens live in `apps/desktop/renderer/src/tokens.css`. `styles.css` consumes them.
- Conversation, agent rail, Connections, and Preview/Changes use the surface and type scales.
- Waiting copy that means “needs you” shares `--wait`.
- Diff hunks and find matches do not reuse status green/red.
- Interface text 12/13/14 updates `--ui-font-size` only.
- Collapsed sidebar is a reopenable rail, not a missing control.
- Visual founder acceptance and VoiceOver remain separate (B4).
