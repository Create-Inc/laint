# laint

AI Agent Lint Rules SDK - a simple programmatic API for linting JSX/TSX code.

## Installation

```bash
npm install laint
```

## Usage

```typescript
import { lintJsxCode } from 'laint';

const code = `
  <Link href="./profile">Profile</Link>
  <Button onPress={() => router.navigate('../settings')} />
`;

const results = lintJsxCode(code, {
  rules: ['no-relative-paths']
});

// results:
// [
//   { rule: 'no-relative-paths', message: '...', line: 2, column: 14, severity: 'error' },
//   { rule: 'no-relative-paths', message: '...', line: 3, column: 41, severity: 'error' }
// ]
```

## Available Rules

### `no-relative-paths`

Validates that route paths in Expo Router are absolute rather than file-relative.

**Invalid patterns (errors):**
- `router.navigate('./profile')`
- `router.push('../settings')`
- `router.replace('./home')`
- `getRouter().navigate('./friends')`
- `<Link href="./profile">`
- `<Link href="../settings">`

**Valid patterns:**
- `router.navigate('/(tabs)/profile')` - absolute from app root
- `router.navigate('/about')` - absolute path
- `<Link href="/(tabs)/profile/friends">` - absolute path
- `<Tabs.Screen name="home">` - screen definitions are OK
- `<Stack.Screen name="index">` - screen definitions are OK

## Project Structure

```
/
├── src/
│   ├── index.ts              # Main entry - exports lintJsxCode
│   ├── types.ts              # LintResult, LintConfig types
│   ├── parser.ts             # JSX parsing with @babel/parser
│   └── rules/
│       ├── index.ts          # Rule registry
│       └── no-relative-paths.ts
└── tests/
    └── no-relative-paths.test.ts
```

## Adding a New Rule

1. Create a new file in `src/rules/`:

```typescript
// src/rules/my-rule.ts
import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

export function myRule(ast: File, code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    // Visit AST nodes and push violations to results
    CallExpression(path) {
      // Check for violations...
      results.push({
        rule: 'my-rule',
        message: 'Description of the issue',
        line: path.node.loc?.start.line ?? 0,
        column: path.node.loc?.start.column ?? 0,
        severity: 'error',
      });
    },
  });

  return results;
}
```

2. Register it in `src/rules/index.ts`:

```typescript
import { myRule } from './my-rule';

export const rules: Record<string, RuleFunction> = {
  'no-relative-paths': noRelativePaths,
  'my-rule': myRule,
};
```

3. Add tests in `tests/my-rule.test.ts`

4. Run tests: `npm test`

## API Reference

### `lintJsxCode(code: string, config: LintConfig): LintResult[]`

Lints JSX/TSX code and returns an array of lint violations.

**Parameters:**
- `code` - The JSX/TSX source code to lint
- `config.rules` - Array of rule names to enable

**Returns:** Array of `LintResult` objects:

```typescript
interface LintResult {
  rule: string;        // Rule name that triggered this result
  message: string;     // Human-readable description
  line: number;        // 1-indexed line number
  column: number;      // 0-indexed column number
  severity: 'error' | 'warning';
}
```

## Development

```bash
npm install     # Install dependencies
npm test        # Run tests
npm run build   # Build TypeScript
```
