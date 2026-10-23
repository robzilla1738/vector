# Tool readability successor

The four Python tools now use expanded statements, descriptive bindings and readable argument/list layouts. Native source, patch, manifest, compile inputs, command receipt and `evidence.json` remain byte-identical to `75d2401e4`.

`tooling-format-derivation.json` records historical/current hashes, the complete per-file identifier rename maps and normalized AST hashes. Equality is exact after applying only those listed `Name.id`, `arg.arg` and `FunctionDef.name` renames to the historical AST, excluding location attributes. All string constants, including captured C++ fixture source, are unchanged. This is explicitly **identifier-only alpha equivalence**, not a false claim that renamed ASTs are literally identical before normalization.

`current-tooling-pins.json` pins the formatted tools separately. Historical `evidence.json.checkSourcePins` continue to identify the tools that actually produced the native compile and 24-case results. Those executions were not repeated or relabeled as current-tool executions. Only syntax parsing and AST derivation checks ran for this readability successor.
