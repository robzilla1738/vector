import ts from "typescript";

/** Follow the actual API handler/helper path for each method. Evaluate only
 * method-name conditions; unknown data/permission conditions keep both paths.
 */
export function windowOwnedHandlers(filename: string, text: string): string[] {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
  const functions = new Map<string, ts.FunctionDeclaration>();
  for (const node of source.statements)
    if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node);
  const methodName = (node: ts.Node) =>
    (ts.isIdentifier(node) && node.text === "method") ||
    (ts.isPropertyAccessExpression(node) && node.name.text === "method");
  function condition(node: ts.Expression, method: string): boolean | undefined {
    if (ts.isParenthesizedExpression(node)) return condition(node.expression, method);
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) {
      const value = condition(node.operand, method);
      return value === undefined ? undefined : !value;
    }
    if (!ts.isBinaryExpression(node)) return undefined;
    const left = condition(node.left, method),
      right = condition(node.right, method);
    if (node.operatorToken.kind === ts.SyntaxKind.BarBarToken)
      return left === true || right === true ? true : left === false && right === false ? false : undefined;
    if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken)
      return left === false || right === false ? false : left === true && right === true ? true : undefined;
    const literal =
      methodName(node.left) && ts.isStringLiteral(node.right)
        ? node.right.text
        : methodName(node.right) && ts.isStringLiteral(node.left)
          ? node.left.text
          : undefined;
    if (literal === undefined) return undefined;
    if (
      [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(
        node.operatorToken.kind,
      )
    )
      return method === literal;
    if (
      [ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(
        node.operatorToken.kind,
      )
    )
      return method !== literal;
    return undefined;
  }
  function owns(name: string, method: string, visiting = new Set<string>()): boolean {
    if (name === "normalWindowOwner" || name === "nativeDocumentSource") return true;
    const fn = functions.get(name);
    if (!fn?.body || visiting.has(name)) return false;
    const next = new Set(visiting).add(name);
    return scan(fn.body, method, next).owned;
  }
  function scan(node: ts.Node, method: string, visiting: Set<string>): { owned: boolean; exits: boolean } {
    if (ts.isPropertyAccessExpression(node) && node.name.text === "nativeTurnContext")
      return { owned: true, exits: false };
    if (ts.isBindingElement(node) && (node.propertyName ?? node.name).getText(source) === "nativeTurnContext")
      return { owned: true, exits: false };
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      owns(node.expression.text, method, visiting)
    )
      return { owned: true, exits: false };
    if (ts.isIfStatement(node)) {
      const value = condition(node.expression, method);
      if (value === true) return scan(node.thenStatement, method, visiting);
      if (value === false)
        return node.elseStatement
          ? scan(node.elseStatement, method, visiting)
          : { owned: false, exits: false };
      const yes = scan(node.thenStatement, method, visiting),
        no = node.elseStatement ? scan(node.elseStatement, method, visiting) : { owned: false, exits: false };
      return { owned: yes.owned || no.owned, exits: yes.exits && no.exits };
    }
    if (ts.isBlock(node)) {
      for (const child of node.statements) {
        const result = scan(child, method, visiting);
        if (result.owned || result.exits) return result;
      }
      return { owned: false, exits: false };
    }
    let owned = false;
    ts.forEachChild(node, (child) => {
      owned ||= scan(child, method, visiting).owned;
    });
    return { owned, exits: ts.isReturnStatement(node) || ts.isThrowStatement(node) };
  }
  const methods: string[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isStringLiteral(node.name) &&
      ts.isIdentifier(node.initializer) &&
      functions.has(node.initializer.text) &&
      owns(node.initializer.text, node.name.text)
    )
      methods.push(node.name.text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return [...new Set(methods)];
}
