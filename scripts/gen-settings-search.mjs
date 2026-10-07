#!/usr/bin/env node
/** Derive search fields from the same JSX declarations that render Settings. */
import ts from "typescript";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../apps/shell/src");
const sections = {
  Labs: "Labs",
  Appearance: "Appearance",
  Permissions: "Permissions",
  PrivacySecurity: "Site permissions",
  PasswordsAutofill: "Passwords & Autofill",
  Models: "Models",
  CloudExecution: "Models",
  UsageBudgets: "Usage & Budgets",
  Automations: "Automations",
  Workspaces: "Projects",
  QuickAsk: "Quick Ask",
  SelectionCapture: "Selection & Capture",
  ArchivedChats: "Archived chats",
  General: "General",
  Profiles: "Profiles",
};
const components = {
  MemorySettings: "Memory",
  ExternalAgents: "External agents",
  PluginsPanel: "Connections",
  Extensions: "Extensions",
  VaultSettings: "Vault",
  CalendarConnections: "Connections",
  OutboundMcpSettings: "Connections",
  ReviewedConnectors: "Connections",
};
const fields = new Map();
function scan(file, category, seen, subview, feature) {
  if (seen.has(file)) return;
  seen.add(file);
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const fieldNames = new Set(["SettingsField", "SettingsRow"]),
    imports = [];
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const path = statement.moduleSpecifier.text;
    if (path.startsWith(".")) {
      const target = resolve(dirname(file), path + ".tsx");
      if (existsSync(target) && !target.includes("/ui/")) imports.push(target);
    }
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings))
      for (const element of bindings.elements) {
        if (["SettingsField", "SettingsRow"].includes(element.propertyName?.text ?? element.name.text))
          fieldNames.add(element.name.text);
      }
  }
  function literal(attribute) {
    const value = attribute?.initializer;
    if (value && ts.isStringLiteral(value)) return value.text;
    if (value && ts.isJsxExpression(value) && value.expression && ts.isStringLiteralLike(value.expression))
      return value.expression.text;
    return undefined;
  }
  function labels(attribute) {
    const text = literal(attribute);
    if (text !== undefined) return [text];
    const expression = attribute?.initializer?.expression;
    if (!expression) return [];
    if (!ts.isTemplateExpression(expression)) {
      if (category === "Labs" && ts.isIdentifier(expression) && expression.text === "label") return [];
      if (ts.isIdentifier(expression)) {
        let callback = attribute.parent;
        while (callback && !ts.isArrowFunction(callback)) callback = callback.parent;
        const binding = callback?.parameters[0]?.name;
        const call = callback?.parent;
        if (
          binding &&
          ts.isArrayBindingPattern(binding) &&
          call &&
          ts.isCallExpression(call) &&
          ts.isPropertyAccessExpression(call.expression) &&
          call.expression.name.text === "map"
        ) {
          const index = binding.elements.findIndex(
            (item) => ts.isBindingElement(item) && item.name.getText(source) === expression.text,
          );
          let rows = call.expression.expression;
          while (ts.isParenthesizedExpression(rows) || ts.isAsExpression(rows)) rows = rows.expression;
          if (index >= 0 && ts.isArrayLiteralExpression(rows))
            return rows.elements.flatMap((row) =>
              ts.isArrayLiteralExpression(row) && ts.isStringLiteralLike(row.elements[index])
                ? [row.elements[index].text]
                : [],
            );
        }
      }
      throw new Error(
        `Search metadata needs a static label declaration: ${file}: ${expression.getText(source)}`,
      );
    }
    let values = [expression.head.text];
    for (const span of expression.templateSpans) {
      const options = [];
      const pool = ts.isElementAccessExpression(span.expression)
        ? ts.createSourceFile(
            "providers.ts",
            readFileSync(resolve(root, "../../../packages/contracts/src/model-connections.ts"), "utf8"),
            ts.ScriptTarget.Latest,
            true,
          )
        : source;
      function collect(node) {
        if (
          ts.isPropertyAssignment(node) &&
          ts.isStringLiteralLike(node.initializer) &&
          (ts.isElementAccessExpression(span.expression) ||
            node.name.getText(pool) === span.expression.name?.text)
        )
          options.push(node.initializer.text);
        ts.forEachChild(node, collect);
      }
      if (ts.isElementAccessExpression(span.expression)) {
        function providerNames(node) {
          if (ts.isVariableDeclaration(node) && node.name.getText(pool) === "MODEL_PROVIDER_NAMES")
            collect(node.initializer);
          else ts.forEachChild(node, providerNames);
        }
        providerNames(pool);
      } else collect(pool);
      if (!options.length)
        throw new Error(`Cannot derive search label: ${file}: ${expression.getText(source)}`);
      values = values.flatMap((prefix) => options.map((value) => prefix + value + span.literal.text));
    }
    return [...new Set(values)];
  }
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const attrs = new Map(
        node.attributes.properties.filter(ts.isJsxAttribute).map((attr) => [attr.name.getText(source), attr]),
      );
      const field = fieldNames.has(node.tagName.getText(source));
      const names = field
        ? labels(attrs.get("label"))
        : [literal(attrs.get("data-settings-field")) ?? literal(attrs.get("data-setting"))].filter(Boolean);
      for (const label of names) {
        const entry = {
          category,
          label,
          description:
            literal(attrs.get("description")) ??
            literal(attrs.get("hint")) ??
            literal(attrs.get("data-settings-description")) ??
            "",
          target: literal(attrs.get("target")) ?? literal(attrs.get("data-setting")) ?? label,
          ...(subview ? { subview } : {}),
          ...(feature ? { feature } : {}),
        };
        const terms = attrs.get("searchTerms")?.initializer;
        if (
          terms &&
          ts.isJsxExpression(terms) &&
          terms.expression &&
          ts.isArrayLiteralExpression(terms.expression)
        )
          entry.searchTerms = terms.expression.elements
            .filter(ts.isStringLiteralLike)
            .map((value) => value.text);
        fields.set(`${category}\0${label}`, entry);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  for (const imported of imports) {
    const editor = imported.endsWith("/SearchEnginesSetting.tsx")
      ? "Keyword engines"
      : /\/(BackupSettings|RestoreBackupControls|RecoveryPackage)\.tsx$/.test(imported)
        ? "Task data backup"
        : subview;
    scan(imported, category, seen, editor, feature);
  }
}
for (const [file, category] of Object.entries(sections))
  scan(resolve(root, `settings/sections/${file}.tsx`), category, new Set());
for (const [file, category] of Object.entries(components))
  scan(resolve(root, `components/${file}.tsx`), category, new Set());
for (const [file, category, feature] of [
  ["features/apple-script/preference.tsx", "Advanced", "appleScript"],
  ["settings/sections/LinkRouting.tsx", "Link Routing", "linkRouting"],
  ["features/morning-review/NightSettings.tsx", "Automations", "overnightReview"],
  ["features/download-naming/Settings.tsx", "Downloads", "smartDownloadNames"],
  ["features/little-window/ExternalLinksSetting.tsx", "General", "littleWindow"],
])
  scan(resolve(root, file), category, new Set(), undefined, feature);
const featureSource = ts.createSourceFile(
  "features.ts",
  readFileSync(resolve(root, "../../../packages/contracts/src/aux-features.ts"), "utf8"),
  ts.ScriptTarget.Latest,
  true,
);
function labs(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(featureSource) === "AUX_FEATURES") {
    let value = node.initializer;
    while (ts.isAsExpression(value) || ts.isSatisfiesExpression(value)) value = value.expression;
    for (const property of value.properties) {
      const feature = property.name.getText(featureSource);
      const label = feature.replace(/([A-Z])/g, " $1").replace(/^./, (first) => first.toUpperCase());
      fields.set(`Labs\0${label}`, {
        category: "Labs",
        label,
        description: "Show this feature in Aux.",
        target: label,
        feature,
      });
    }
  }
  ts.forEachChild(node, labs);
}
labs(featureSource);
const output =
  '// Generated by scripts/gen-settings-search.mjs from Settings field declarations.\nimport type { SettingsSearchItem } from "./search";\nexport const generatedSettingsFields: SettingsSearchItem[] = ' +
  JSON.stringify([...fields.values()], null, 2) +
  ";\n";
const { format } = await import("prettier");
writeFileSync(
  resolve(root, "settings/search.generated.ts"),
  await format(output, { parser: "typescript", printWidth: 100 }),
);
console.log(`Generated ${fields.size} Settings search fields.`);
