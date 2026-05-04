import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'require-auth-initiate-call';

/**
 * The shipped V2 mobile auth `useAuth()` exposes both `isReady` (a boolean
 * gate that flips true once the persisted JWT has been loaded from
 * SecureStore) and `initiate()` (the function that does that load). The
 * gate doesn't flip on its own — `initiate()` must be invoked, typically
 * once from the root `_layout.tsx` in a `useEffect`. If a file gates
 * render on `isReady` (e.g. `if (!isReady) return null;`) without calling
 * `initiate()`, the gate stays closed forever and the app renders blank.
 *
 * This rule fires when:
 *   - `useAuth()` is destructured to pull out `isReady`, AND
 *   - `isReady` is used as a render gate (negated, returning null/falsy), AND
 *   - `initiate` is neither destructured + invoked nor called via member
 *     access on the auth return value.
 */
export function requireAuthInitiateCall(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  const useAuthDestructures: {
    isReadyName: string | null;
    initiateName: string | null;
    line: number;
    column: number;
  }[] = [];

  let initiateCalled = false;

  traverse(ast, {
    VariableDeclarator(path) {
      const { id, init } = path.node;
      if (
        init?.type !== 'CallExpression' ||
        init.callee.type !== 'Identifier' ||
        init.callee.name !== 'useAuth' ||
        id.type !== 'ObjectPattern'
      ) {
        return;
      }

      let isReadyName: string | null = null;
      let initiateName: string | null = null;
      for (const prop of id.properties) {
        if (
          prop.type !== 'ObjectProperty' ||
          prop.key.type !== 'Identifier' ||
          prop.value.type !== 'Identifier'
        ) {
          continue;
        }
        if (prop.key.name === 'isReady') {
          isReadyName = prop.value.name;
        }
        if (prop.key.name === 'initiate') {
          initiateName = prop.value.name;
        }
      }

      if (isReadyName === null) return;

      useAuthDestructures.push({
        isReadyName,
        initiateName,
        line: init.loc?.start.line ?? 0,
        column: init.loc?.start.column ?? 0,
      });
    },

    CallExpression(path) {
      const { callee } = path.node;

      // Direct invocation: `initiate()` (where local name is from destructure)
      if (callee.type === 'Identifier') {
        for (const d of useAuthDestructures) {
          if (d.initiateName !== null && callee.name === d.initiateName) {
            initiateCalled = true;
          }
        }
      }

      // Member call: `something.initiate()` — covers
      // `useAuth().initiate()`, `auth.initiate()`, etc. Conservatively
      // accept any `.initiate(` to avoid false positives.
      if (
        callee.type === 'MemberExpression' &&
        callee.property.type === 'Identifier' &&
        callee.property.name === 'initiate'
      ) {
        initiateCalled = true;
      }
    },
  });

  if (useAuthDestructures.length === 0 || initiateCalled) {
    return results;
  }

  // Need to confirm `isReady` is being used as a render gate (not just
  // shown as a spinner or read for some other purpose). Look for
  // `if (!<isReadyName>) return ...;` or similar early-return patterns.
  let usedAsRenderGate = false;
  traverse(ast, {
    IfStatement(path) {
      const { test, consequent } = path.node;
      const matchedName = matchesNegatedIdentifier(
        test,
        useAuthDestructures.map((d) => d.isReadyName).filter((n): n is string => n !== null),
      );
      if (matchedName === null) return;
      if (containsReturn(consequent)) {
        usedAsRenderGate = true;
      }
    },
  });

  if (!usedAsRenderGate) {
    return results;
  }

  for (const d of useAuthDestructures) {
    results.push({
      rule: RULE_NAME,
      message:
        d.initiateName === null
          ? `useAuth() destructures "isReady" and gates render on it, but never destructures or calls "initiate()". The persisted JWT is never loaded from SecureStore, so isReady stays false forever and the app renders blank. Pull "initiate" from useAuth() and call it in a useEffect.`
          : `useAuth() destructures "isReady" and "initiate", and gates render on isReady, but "initiate()" is never invoked. Call it in a useEffect: useEffect(() => { initiate(); }, [initiate]);`,
      line: d.line,
      column: d.column,
      severity: 'error',
    });
  }

  return results;
}

function matchesNegatedIdentifier(node: unknown, names: string[]): string | null {
  if (!node || typeof node !== 'object') return null;
  const n = node as { type?: string; operator?: string; argument?: unknown; name?: string };
  if (n.type === 'UnaryExpression' && n.operator === '!') {
    const arg = n.argument as { type?: string; name?: string } | null;
    if (arg?.type === 'Identifier' && arg.name && names.includes(arg.name)) {
      return arg.name;
    }
  }
  return null;
}

function containsReturn(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  const n = node as {
    type?: string;
    body?: unknown[];
    consequent?: unknown;
    alternate?: unknown;
  };
  if (n.type === 'ReturnStatement') return true;
  if (n.type === 'BlockStatement' && Array.isArray(n.body)) {
    return n.body.some((s) => containsReturn(s));
  }
  return false;
}
