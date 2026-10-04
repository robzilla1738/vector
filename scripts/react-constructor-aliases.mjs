const importSource = "@aux/react-constructors";
const elementId = "\0aux-react-element-constructor";
const runtimeId = "\0aux-react-jsx-constructors";
const developmentId = "\0aux-react-jsx-development-constructors";

/** Bind the installed constructors once instead of repeating CJS property reads. */
export function reactConstructorAliases() {
  return {
    name: "aux-react-constructor-aliases",
    apply: "build",
    config: () => ({ esbuild: { jsxImportSource: importSource } }),
    resolveId(id) {
      if (id === importSource) return elementId;
      if (id === `${importSource}/jsx-runtime`) return runtimeId;
      if (id === `${importSource}/jsx-dev-runtime`) return developmentId;
    },
    load(id) {
      if (id === elementId)
        return 'import * as React from "react"; export const createElement = React.createElement;';
      if (id === runtimeId)
        return 'import * as runtime from "react/jsx-runtime"; export const jsx = runtime.jsx; export const jsxs = runtime.jsxs; export const Fragment = runtime.Fragment;';
      if (id === developmentId)
        return 'import * as runtime from "react/jsx-dev-runtime"; export const jsxDEV = runtime.jsxDEV; export const Fragment = runtime.Fragment;';
    },
  };
}
