import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-inline-styles';

export function noInlineStyles(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    JSXAttribute(path) {
      const { name, loc } = path.node;

      // Check if the attribute name is "style"
      if (name.type !== 'JSXIdentifier' || name.name !== 'style') {
        return;
      }

      // Don't flag <style> elements (HTML style tags)
      const openingElement = path.parentPath?.parent;
      if (
        openingElement &&
        openingElement.type === 'JSXOpeningElement' &&
        openingElement.name.type === 'JSXIdentifier' &&
        openingElement.name.name === 'style'
      ) {
        return;
      }

      results.push({
        rule: RULE_NAME,
        message:
          'Avoid inline styles. Use Tailwind CSS classes (className) instead for consistency and maintainability',
        line: loc?.start.line ?? 0,
        column: loc?.start.column ?? 0,
        severity: 'warning',
      });
    },
  });

  return results;
}
