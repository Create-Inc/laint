import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'prefer-promise-all';

export function preferPromiseAll(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    ForOfStatement(loopPath) {
      // Skip `for await...of` — already an async iterator pattern
      if (loopPath.node.await) return;

      let hasAwait = false;
      let hasOrderDependentPattern = false;

      loopPath.traverse({
        // Don't descend into nested functions — their awaits are independent
        'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(innerPath: any) {
          innerPath.skip();
        },

        // Don't descend into nested loops
        'ForStatement|ForOfStatement|ForInStatement|WhileStatement|DoWhileStatement'(
          innerPath: any,
        ) {
          innerPath.skip();
        },

        AwaitExpression(_awaitPath: any) {
          hasAwait = true;
        },

        CallExpression(callPath: any) {
          const { callee } = callPath.node;

          // Detect .push() calls — order-dependent array accumulation
          if (
            t.isMemberExpression(callee) &&
            t.isIdentifier(callee.property) &&
            callee.property.name === 'push'
          ) {
            hasOrderDependentPattern = true;
            callPath.stop();
          }

          // Detect .splice() / .unshift() — order-dependent
          if (
            t.isMemberExpression(callee) &&
            t.isIdentifier(callee.property) &&
            (callee.property.name === 'splice' || callee.property.name === 'unshift')
          ) {
            hasOrderDependentPattern = true;
            callPath.stop();
          }
        },

        // Detect break/return conditioned on await result — sequential early-exit
        BreakStatement(breakPath: any) {
          // Check this break targets the outer for...of (not a nested switch/loop)
          let parent = breakPath.parentPath;
          while (parent && parent !== loopPath) {
            const type = parent.node.type;
            if (
              type === 'ForStatement' ||
              type === 'WhileStatement' ||
              type === 'DoWhileStatement' ||
              type === 'ForOfStatement' ||
              type === 'ForInStatement' ||
              type === 'SwitchStatement'
            ) {
              return; // break belongs to nested construct
            }
            parent = parent.parentPath;
          }
          hasOrderDependentPattern = true;
        },

        ReturnStatement(returnPath: any) {
          // Check this return is in the function containing the loop, not a nested fn
          let parent = returnPath.parentPath;
          while (parent && parent !== loopPath) {
            if (
              parent.node.type === 'FunctionDeclaration' ||
              parent.node.type === 'FunctionExpression' ||
              parent.node.type === 'ArrowFunctionExpression'
            ) {
              return; // return belongs to nested function
            }
            parent = parent.parentPath;
          }
          hasOrderDependentPattern = true;
        },
      });

      if (hasOrderDependentPattern) return;

      // Check for cross-iteration data dependencies:
      // A variable declared BEFORE the loop that is both read and written inside the loop body
      if (hasCrossIterationDependency(loopPath)) return;

      if (hasAwait) {
        const { loc } = loopPath.node;
        results.push({
          rule: RULE_NAME,
          message:
            'Sequential await in for...of loop can likely be parallelized with Promise.all(items.map(async (item) => ...)) for better performance',
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },
  });

  return results;
}

function hasCrossIterationDependency(loopPath: any): boolean {
  // Collect identifiers that are ASSIGNED inside the loop body
  const assignedInLoop = new Set<string>();

  loopPath.traverse({
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(innerPath: any) {
      innerPath.skip();
    },

    AssignmentExpression(assignPath: any) {
      const left = assignPath.node.left;
      if (t.isIdentifier(left)) {
        assignedInLoop.add(left.name);
      }
    },

    UpdateExpression(updatePath: any) {
      const arg = updatePath.node.argument;
      if (t.isIdentifier(arg)) {
        assignedInLoop.add(arg.name);
      }
    },
  });

  if (assignedInLoop.size === 0) return false;

  // Check if any of those assigned variables are bound OUTSIDE the loop
  for (const name of assignedInLoop) {
    const binding = loopPath.scope.getBinding(name);
    if (!binding) continue; // global or unresolved — assume dependency

    // If the variable is declared outside the loop, it's a cross-iteration dependency
    const declPath = binding.path;
    if (!isInsidePath(declPath, loopPath)) {
      return true;
    }
  }

  return false;
}

function isInsidePath(inner: any, outer: any): boolean {
  let current = inner;
  while (current) {
    if (current === outer) return true;
    current = current.parentPath;
  }
  return false;
}
