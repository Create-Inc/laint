import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-inline-styles';

export function noInlineStyles(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    JSXAttribute(path) {
      // Check if the attribute name is "style"
      if (!t.isJSXIdentifier(path.node.name, { name: 'style' })) return;

      // Check if the value is an expression container with an object expression
      const value = path.node.value;
      if (!t.isJSXExpressionContainer(value)) return;
      if (!t.isObjectExpression(value.expression)) return;

      const { loc } = path.node;
      results.push({
        rule: RULE_NAME,
        message: 'Avoid inline styles. Use Tailwind CSS classes instead.',
        line: loc?.start.line ?? 0,
        column: loc?.start.column ?? 0,
        severity: 'warning',
      });
    },
  });

  return results;
}
