import { realpathSync } from "node:fs";
import { relative, isAbsolute } from "node:path";
const source = "@aux/react-named-values";
const virtual = "\0aux-react-named-values";
const names = new Set([
  "Children",
  "Component",
  "Fragment",
  "Profiler",
  "PureComponent",
  "StrictMode",
  "Suspense",
  "createContext",
  "createElement",
  "createRef",
  "forwardRef",
  "isValidElement",
  "lazy",
  "memo",
  "startTransition",
  "use",
  "useActionState",
  "useCallback",
  "useContext",
  "useDebugValue",
  "useDeferredValue",
  "useEffect",
  "useEffectEvent",
  "useId",
  "useImperativeHandle",
  "useInsertionEffect",
  "useLayoutEffect",
  "useMemo",
  "useOptimistic",
  "useReducer",
  "useRef",
  "useState",
  "useSyncExternalStore",
  "useTransition",
  "version",
]);
export function reactNamedValueAliases(root) {
  const originalRoot = realpathSync(root);
  return {
    name: "aux-react-named-value-aliases",
    apply: "build",
    enforce: "post",
    resolveId(id) {
      if (id === source) return virtual;
    },
    load(id) {
      if (id === virtual)
        return (
          'import * as original from "react";' +
          [...names].map((n) => `export const ${n}=original.${n};`).join("")
        );
    },
    transform(code, id) {
      if (id.startsWith("\0")) return;
      const file = id.split("?")[0];
      if (!/\.[jt]sx?$/.test(file)) return;
      let actual;
      try {
        actual = realpathSync(file);
      } catch {
        return;
      }
      const path = relative(originalRoot, actual);
      if (path === ".." || path.startsWith("../") || isAbsolute(path)) return;
      const ast = this.parse(code);
      const edits = [];
      for (const node of ast.body) {
        if (node.type !== "ImportDeclaration" || node.source.value !== "react" || !node.specifiers.length)
          continue;
        if (
          !node.specifiers.every(
            (s) => s.type === "ImportSpecifier" && names.has(s.imported.name ?? s.imported.value),
          )
        )
          continue;
        edits.push([node.source.start, node.source.end]);
      }
      if (!edits.length) return;
      for (const [start, end] of edits.reverse())
        code = code.slice(0, start) + JSON.stringify(source) + code.slice(end);
      return { code, map: null };
    },
  };
}
