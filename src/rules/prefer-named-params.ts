import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'prefer-named-params';

// Callback-style methods where positional params are natural
const CALLBACK_METHODS = new Set([
  'map',
  'forEach',
  'filter',
  'find',
  'findIndex',
  'some',
  'every',
  'reduce',
  'reduceRight',
  'flatMap',
  'sort',
  'then',
  'catch',
  'on',
  'once',
  'addEventListener',
  'removeEventListener',
  'subscribe',
  'pipe',
  'use',
]);

function isCallbackArg(path: traverse.NodePath<t.Function>): boolean {
  const parent = path.parent;

  // fn passed as argument to a function call: foo((a, b) => ...)
  if (t.isCallExpression(parent)) {
    return true;
  }

  // fn passed as argument to a method call: arr.map((item, index) => ...)
  if (
    t.isCallExpression(parent) &&
    t.isMemberExpression(parent.callee) &&
    t.isIdentifier(parent.callee.property) &&
    CALLBACK_METHODS.has(parent.callee.property.name)
  ) {
    return true;
  }

  return false;
}

function isReactComponent(path: traverse.NodePath<t.Function>): boolean {
  // React components have (props) or () — single param at most
  // But check for forwardRef((props, ref) => ...) pattern
  const parent = path.parent;
  if (
    t.isCallExpression(parent) &&
    t.isIdentifier(parent.callee) &&
    (parent.callee.name === 'forwardRef' || parent.callee.name === 'memo')
  ) {
    return true;
  }
  if (
    t.isCallExpression(parent) &&
    t.isMemberExpression(parent.callee) &&
    t.isIdentifier(parent.callee.property) &&
    (parent.callee.property.name === 'forwardRef' ||
      parent.callee.property.name === 'memo')
  ) {
    return true;
  }
  return false;
}

export function preferNamedParams(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(
      path: traverse.NodePath<t.Function>,
    ) {
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
