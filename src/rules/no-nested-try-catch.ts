import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-nested-try-catch';

export function noNestedTryCatch(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    TryStatement(path) {
      let current: typeof path.parentPath = path.parentPath;
      while (current) {
        if (current.isTryStatement()) {
          results.push({
            rule: RULE_NAME,
            message:
              'Avoid nested try-catch blocks. Flatten with early returns, extract into separate functions, or use a Result type',
            line: path.node.loc?.start.line ?? 0,
            column: path.node.loc?.start.column ?? 0,
            severity: 'warning',
          });
          break;
        }
        if (
          current.isFunctionDeclaration() ||
          current.isFunctionExpression() ||
          current.isArrowFunctionExpression()
        ) {
          break;
        }
        current = current.parentPath as typeof current;
      }
    },
  });

  return results;
}
