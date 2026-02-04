import { parseJsx } from './parser';
import { rules } from './rules';
import type { LintConfig, LintResult } from './types';

export type { LintConfig, LintResult, RuleFunction } from './types';

/**
 * Get all available rule names
 */
export function getAllRuleNames(): string[] {
  return Object.keys(rules);
}

export function lintJsxCode(code: string, config: LintConfig): LintResult[] {
  const ast = parseJsx(code);
  const results: LintResult[] = [];

  // Determine which rules to run based on exclude mode
  let rulesToRun: string[];

  if (config.exclude) {
    // Exclude mode: run all rules except those listed
    const excludeSet = new Set(config.rules);
    rulesToRun = Object.keys(rules).filter((name) => !excludeSet.has(name));
  } else {
    // Include mode (default): only run rules that are listed
    rulesToRun = config.rules;
  }

  for (const ruleName of rulesToRun) {
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
