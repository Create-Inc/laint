# CLAUDE.md

## Project

laint is an AI Agent Lint Rules SDK — a programmatic API for linting JSX/TSX code, designed to integrate with Claude Code via PostToolUse hooks.

## Commands

- `npm run build` — compile TypeScript + fix ESM imports
- `npm test` — run vitest
- `npm run lint` — eslint + prettier check
- `npm run lint:fix` — auto-fix lint + formatting
- `npm run knip` — dead code detection

## Architecture

- `src/parser.ts` — Babel parser wrapper (JSX + TypeScript)
- `src/index.ts` — main API: `lintJsxCode()`, `getAllRuleNames()`
- `src/rules/` — individual lint rules, each a `RuleFunction(ast, code) => LintResult[]`
- `src/rules/index.ts` — rule registry (maps rule names to functions)
- `src/cli.ts` — CLI entry point (`laint init`, `laint check`)
- `src/cli/check.ts` — file mode and hook mode linting
- `src/cli/init.ts` — sets up `.claude/settings.json` PostToolUse hook

## Adding a new rule

1. Create `src/rules/my-rule.ts` exporting a `RuleFunction`
2. Register it in `src/rules/index.ts`
3. Create `tests/my-rule.test.ts`
4. **Update the rule count assertion in `tests/config-modes.test.ts`** — the `getAllRuleNames` test has `expect(ruleNames.length).toBe(...)` that must match the total number of registered rules
5. Run `npm test` to verify

## Code style

- Strict TypeScript, ESM modules
- Prettier: 2 spaces, 100 char width, trailing commas, single quotes
- No unnecessary type assertions — use Babel's type system directly
