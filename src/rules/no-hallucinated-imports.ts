import * as fs from 'node:fs';
import * as path from 'node:path';
import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-hallucinated-imports';

// Built-in Node.js modules that don't need to be in package.json
const NODE_BUILTINS = new Set([
  'assert',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'https',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
]);

function getPackageName(importSource: string): string | null {
  // Skip relative imports
  if (importSource.startsWith('.') || importSource.startsWith('/')) {
    return null;
  }

  // Skip node: protocol imports
  if (importSource.startsWith('node:')) {
    return null;
  }

  // Handle scoped packages: @scope/package/sub → @scope/package
  if (importSource.startsWith('@')) {
    const parts = importSource.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return importSource;
  }

  // Handle regular packages: package/sub → package
  return importSource.split('/')[0];
}

function loadPackageJsonDeps(): Set<string> | null {
  try {
    const pkgPath = path.resolve('package.json');
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    const deps = new Set<string>();

    for (const key of Object.keys(pkg.dependencies ?? {})) {
      deps.add(key);
    }
    for (const key of Object.keys(pkg.devDependencies ?? {})) {
      deps.add(key);
    }
    for (const key of Object.keys(pkg.peerDependencies ?? {})) {
      deps.add(key);
    }
    for (const key of Object.keys(pkg.optionalDependencies ?? {})) {
      deps.add(key);
    }

    return deps;
  } catch {
    return null;
  }
}

export function noHallucinatedImports(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];
  const deps = loadPackageJsonDeps();

  // If we can't read package.json, skip the rule
  if (!deps) return results;

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      const packageName = getPackageName(source);

      if (!packageName) return;
      if (NODE_BUILTINS.has(packageName)) return;
      if (deps.has(packageName)) return;

      results.push({
        rule: RULE_NAME,
        message: `Package "${packageName}" is not listed in package.json. Verify the package name is correct and install it`,
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
        severity: 'error',
      });
    },

    CallExpression(path) {
      const { callee, arguments: args, loc } = path.node;
      // Dynamic import()
      if (callee.type === 'Import' && args.length > 0 && args[0].type === 'StringLiteral') {
        const source = args[0].value;
        const packageName = getPackageName(source);

        if (!packageName) return;
        if (NODE_BUILTINS.has(packageName)) return;
        if (deps.has(packageName)) return;

        results.push({
          rule: RULE_NAME,
          message: `Package "${packageName}" is not listed in package.json. Verify the package name is correct and install it`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'error',
        });
      }
    },
  });

  return results;
}
