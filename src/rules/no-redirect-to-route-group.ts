import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-redirect-to-route-group';

/**
 * In Expo Router, segments wrapped in parentheses like `(tabs)` are route
 * GROUPS — they're stripped from the resolved URL. So `<Redirect href="/(tabs)" />`
 * targets a path that doesn't resolve to any real route: the (tabs) group's
 * index.tsx maps to `/`, not `/(tabs)`. This typically creates either a
 * conflict with another file mapping to `/`, or a redirect that silently
 * does nothing. Either way the screen renders blank.
 *
 * Flag any href whose segments are ALL route-group segments (no concrete
 * path beyond them). `/(tabs)/explore` is fine — it strips to `/explore`.
 * `/(tabs)` alone is the bug.
 */
export function noRedirectToRouteGroup(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    JSXOpeningElement(path) {
      const { name, attributes } = path.node;

      if (name.type !== 'JSXIdentifier' || name.name !== 'Redirect') {
        return;
      }

      for (const attr of attributes) {
        if (
          attr.type !== 'JSXAttribute' ||
          attr.name.type !== 'JSXIdentifier' ||
          attr.name.name !== 'href'
        ) {
          continue;
        }

        const hrefValue = extractStringLiteral(attr.value);
        if (hrefValue === null) {
          continue;
        }

        if (!hrefIsOnlyRouteGroups(hrefValue)) {
          continue;
        }

        const loc = attr.value?.loc ?? attr.loc;
        results.push({
          rule: RULE_NAME,
          message: `<Redirect href="${hrefValue}"> targets a route group, not a real URL. Route groups like "(tabs)" are stripped during URL resolution — there is no concrete route at "${hrefValue}". Either redirect to a concrete sub-route (e.g. href="/explore") or remove this Redirect and let the (tabs)/index.tsx file handle "/" directly.`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'error',
        });
      }
    },
  });

  return results;
}

function extractStringLiteral(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const node = value as { type: string; value?: unknown; expression?: unknown };

  if (node.type === 'StringLiteral' && typeof node.value === 'string') {
    return node.value;
  }

  if (node.type === 'JSXExpressionContainer') {
    const expr = node.expression as { type?: string; value?: unknown } | null;
    if (expr?.type === 'StringLiteral' && typeof expr.value === 'string') {
      return expr.value;
    }
  }

  return null;
}

function hrefIsOnlyRouteGroups(href: string): boolean {
  const segments = href.split('/').filter((s) => s.length > 0);
  if (segments.length === 0) return false;
  return segments.every((s) => s.startsWith('(') && s.endsWith(')'));
}
