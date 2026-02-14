import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-new-error-in-err';

export function noNewErrorInErr(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    CallExpression(path) {
      const { callee, arguments: args } = path.node;

      // Match err(...) calls
      if (!t.isIdentifier(callee, { name: 'err' })) return;
      if (args.length === 0) return;

      const firstArg = args[0];

      // Flag err(new Error(...))
      if (t.isNewExpression(firstArg) && t.isIdentifier(firstArg.callee, { name: 'Error' })) {
        const { loc } = path.node;
        results.push({
          rule: RULE_NAME,
          message:
            'Avoid constructing Error objects inside err(). Use a plain object or custom error type instead (e.g. err({ message: "...", cause: error })).',
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },
  });

  return results;
}
