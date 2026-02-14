import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-any-type';

export function noAnyType(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    TSAnyKeyword(path) {
      const { loc } = path.node;
      results.push({
        rule: RULE_NAME,
        message: 'Avoid using "any" type. Use a specific type, "unknown", or a generic instead',
        line: loc?.start.line ?? 0,
        column: loc?.start.column ?? 0,
        severity: 'warning',
      });
    },
  });

  return results;
}
