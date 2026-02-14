import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-floating-promises';

// Known async functions/methods that return promises
const KNOWN_ASYNC_FUNCTIONS = new Set(['fetch']);

const KNOWN_ASYNC_METHODS = new Set(['json', 'text', 'blob', 'arrayBuffer', 'formData']);

export function noFloatingPromises(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    ExpressionStatement(path) {
      const { expression, loc } = path.node;

      if (expression.type !== 'CallExpression') return;

      // Check for: fetch(...) as a standalone statement
      if (
        expression.callee.type === 'Identifier' &&
        KNOWN_ASYNC_FUNCTIONS.has(expression.callee.name)
      ) {
        results.push({
          rule: RULE_NAME,
          message: `"${expression.callee.name}()" returns a Promise. Use "await" or handle the Promise`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
        return;
      }

      // Check for: foo.json(), foo.text() etc. as standalone statements
      if (
        expression.callee.type === 'MemberExpression' &&
        expression.callee.property.type === 'Identifier' &&
        KNOWN_ASYNC_METHODS.has(expression.callee.property.name)
      ) {
        results.push({
          rule: RULE_NAME,
          message: `".${expression.callee.property.name}()" returns a Promise. Use "await" or handle the Promise`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
        return;
      }

      // Check for: calling an async arrow/function expression without await
      // e.g., (async () => { ... })()
      if (
        expression.callee.type === 'ArrowFunctionExpression' ||
        expression.callee.type === 'FunctionExpression'
      ) {
        if (expression.callee.async) {
          results.push({
            rule: RULE_NAME,
            message:
              'Immediately-invoked async function returns a Promise. Use "await" or handle the Promise',
            line: loc?.start.line ?? 0,
            column: loc?.start.column ?? 0,
            severity: 'warning',
          });
        }
      }
    },
  });

  return results;
}
