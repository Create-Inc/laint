import { parseJsx } from './parser';
import { rules } from './rules';
import type { LintConfig, LintResult } from './types';

export type { LintConfig, LintResult, RuleFunction } from './types';

export function lintJsxCode(code: string, config: LintConfig): LintResult[] {
  const ast = parseJsx(code);
  const results: LintResult[] = [];

  for (const ruleName of config.rules) {
    const ruleFunc = rules[ruleName];
    if (ruleFunc) {
      const ruleResults = ruleFunc(ast, code);
      results.push(...ruleResults);
    } else {
      console.warn(`Unknown rule: ${ruleName}`);
    }
  }

  return results;
}
