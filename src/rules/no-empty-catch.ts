import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-empty-catch';

export function noEmptyCatch(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    CatchClause(path) {
      const { body, loc } = path.node;

      // Check if the catch block is completely empty
      if (body.body.length === 0) {
        results.push({
          rule: RULE_NAME,
          message:
            'Empty catch block silently swallows errors. Handle the error or add a comment explaining why it is ignored',
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },
  });

  return results;
}
