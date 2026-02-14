import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-optional-props';

export function noOptionalProps(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    TSPropertySignature(path) {
      if (path.node.optional) {
        const { loc } = path.node;
        results.push({
          rule: RULE_NAME,
          message:
            'Avoid optional properties (?:). Use an explicit union with null instead (e.g. prop: string | null)',
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },
  });

  return results;
}
