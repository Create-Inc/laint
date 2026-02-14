import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-loose-equality';

export function noLooseEquality(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    BinaryExpression(path) {
      const { operator, left, right } = path.node;

      if (operator !== '==' && operator !== '!=') return;

      // Allow == null and != null (idiomatic null/undefined check)
      if (t.isNullLiteral(right) || t.isNullLiteral(left)) return;

      const strict = operator === '==' ? '===' : '!==';
      const { loc } = path.node;
      results.push({
        rule: RULE_NAME,
        message: `Use '${strict}' instead of '${operator}' for strict equality comparison.`,
        line: loc?.start.line ?? 0,
        column: loc?.start.column ?? 0,
        severity: 'warning',
      });
    },
  });

  return results;
}
