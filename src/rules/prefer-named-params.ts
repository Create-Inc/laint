import traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'prefer-named-params';

function isCallbackArg(path: NodePath<t.Function>): boolean {
  // Any function passed as an argument to a call is a callback
  return t.isCallExpression(path.parent);
}

function isReactComponent(path: NodePath<t.Function>): boolean {
  const parent = path.parent;
  if (!t.isCallExpression(parent)) return false;

  const callee = parent.callee;

  // forwardRef((props, ref) => ...) or memo((props, prevProps) => ...)
  if (t.isIdentifier(callee) && (callee.name === 'forwardRef' || callee.name === 'memo')) {
    return true;
  }

  // React.forwardRef(...) or React.memo(...)
  if (
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.property) &&
    (callee.property.name === 'forwardRef' || callee.property.name === 'memo')
  ) {
    return true;
  }

  return false;
}

export function preferNamedParams(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path: NodePath<t.Function>) {
      const { params, loc } = path.node;

      // Only flag when there are 2+ params
      if (params.length < 2) return;

      // Skip if first param is already destructured (object pattern)
      if (t.isObjectPattern(params[0])) return;

      // Skip callbacks passed as arguments
      if (isCallbackArg(path)) return;

      // Skip React.forwardRef / React.memo
      if (isReactComponent(path)) return;

      // Skip class methods and object methods
      if (t.isClassMethod(path.parent) || t.isObjectMethod(path.parent)) return;

      results.push({
        rule: RULE_NAME,
        message:
          'Prefer named parameters using object destructuring instead of positional parameters',
        line: loc?.start.line ?? 0,
        column: loc?.start.column ?? 0,
        severity: 'warning',
      });
    },
  });

  return results;
}
