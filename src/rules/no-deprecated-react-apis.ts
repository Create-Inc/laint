import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-deprecated-react-apis';

const DEPRECATED_LIFECYCLE_METHODS = new Set([
  'componentWillMount',
  'componentWillReceiveProps',
  'componentWillUpdate',
  'UNSAFE_componentWillMount',
  'UNSAFE_componentWillReceiveProps',
  'UNSAFE_componentWillUpdate',
]);

export function noDeprecatedReactApis(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    // Detect deprecated lifecycle methods in class components
    ClassMethod(path) {
      const { key, loc } = path.node;
      if (key.type !== 'Identifier') return;

      if (DEPRECATED_LIFECYCLE_METHODS.has(key.name)) {
        results.push({
          rule: RULE_NAME,
          message: `"${key.name}" is deprecated. Use function components with hooks instead`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },

    // Detect static defaultProps
    ClassProperty(path) {
      const { key, static: isStatic, loc } = path.node;
      if (key.type !== 'Identifier') return;

      if (isStatic && key.name === 'defaultProps') {
        results.push({
          rule: RULE_NAME,
          message:
            'Static "defaultProps" is deprecated. Use default parameter values in function components instead',
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }

      if (key.name === 'propTypes') {
        results.push({
          rule: RULE_NAME,
          message: '"propTypes" is deprecated. Use TypeScript types or interfaces instead',
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },

    // Detect Component.defaultProps = ... and Component.propTypes = ...
    AssignmentExpression(path) {
      const { left, loc } = path.node;

      if (left.type === 'MemberExpression' && left.property.type === 'Identifier') {
        if (left.property.name === 'defaultProps') {
          results.push({
            rule: RULE_NAME,
            message:
              '"defaultProps" is deprecated. Use default parameter values in function components instead',
            line: loc?.start.line ?? 0,
            column: loc?.start.column ?? 0,
            severity: 'warning',
          });
        }

        if (left.property.name === 'propTypes') {
          results.push({
            rule: RULE_NAME,
            message: '"propTypes" is deprecated. Use TypeScript types or interfaces instead',
            line: loc?.start.line ?? 0,
            column: loc?.start.column ?? 0,
            severity: 'warning',
          });
        }
      }
    },

    // Detect string refs: ref="myRef"
    JSXAttribute(path) {
      const { name, value, loc } = path.node;

      if (name.type === 'JSXIdentifier' && name.name === 'ref' && value?.type === 'StringLiteral') {
        results.push({
          rule: RULE_NAME,
          message: 'String refs are deprecated. Use useRef() hook or callback refs instead',
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },
  });

  return results;
}
