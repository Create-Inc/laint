import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-type-assertion';

export function noTypeAssertion(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    TSAsExpression(path) {
      const { loc } = path.node;
      results.push({
        rule: RULE_NAME,
        message:
          'Avoid type assertions with "as". Use type narrowing, type guards, or proper typing instead',
        line: loc?.start.line ?? 0,
        column: loc?.start.column ?? 0,
        severity: 'warning',
      });
    },

    TSTypeAssertion(path) {
      const { loc } = path.node;
      results.push({
        rule: RULE_NAME,
        message:
          'Avoid angle-bracket type assertions. Use type narrowing, type guards, or proper typing instead',
        line: loc?.start.line ?? 0,
        column: loc?.start.column ?? 0,
        severity: 'warning',
      });
    },
  });

  return results;
}
