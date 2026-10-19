# Generated results

Aux can save CSV, XLSX, DOCX, PPTX and chart PNG files as immutable conversation artifacts. The agent API exposes `aux.results.generate` to a task-scoped caller. The desktop uses the same typed `results.generate` RPC. A request supplies the owning conversation, filename and structured `spec`; agent calls also supply the authorized task ID and current task revision.

To revise a file, send the new complete `spec` with `sourceArtifactId`. The source must belong to the same conversation and have the same file kind. Revisions have durable parent and root artifact IDs, up to 20 versions. The selected revision enters conversation context as a bounded inert summary. Original bytes and source specs remain available for earlier versions.

The schemas in `packages/contracts/src/generated-results.ts` are the source of truth. Example requests:

```json
{"chatId":"chat-id","taskId":"task-id","expectedRevision":1,"filename":"sales.xlsx","spec":{"kind":"xlsx","sheets":[{"name":"Sales","rows":[["Month","Revenue"],["Jan",4200],["Feb",4800]]}]}}
```

```json
{"chatId":"chat-id","taskId":"task-id","expectedRevision":1,"filename":"trend.png","spec":{"kind":"chart","title":"Revenue trend","mark":"line","x":"Month","y":"Revenue","data":[{"Month":"Jan","Revenue":4200},{"Month":"Feb","Revenue":4800}]}}
```

Generation accepts at most 500 KB of structured source, with per-format row, slide and text bounds, and refuses output over 20 MB. CSV escapes leading spreadsheet formula characters. XLSX cells are literal values. Charts use an internally constructed Vega-Lite spec with inline data and become PNG bytes. Document and slide text stays plain text. Preview metadata is rendered as text; office files are never embedded as active HTML. Export writes the exact stored artifact bytes through the desktop save dialog. Each result records a SHA-256 digest, source turn, file kind, filename and revision lineage.

A plain chat request can also return `result.file` from the built-in planner. Aux validates and grounds its substantive values against the same observed sources as the answer, then awaits file storage before marking the turn complete. A failed save leaves the turn partially completed with an explicit error. Completed run metadata points to the saved artifact instead of duplicating the full file source. Chart rendering in packaged Aux uses a staged, platform-specific resvg binding; the package build renders a PNG as a release smoke check.
