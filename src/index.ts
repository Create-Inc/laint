import { parseJsx } from './parser';
import { rules } from './rules';
import { rulePlatforms } from './rules/meta';
import type { LintConfig, LintResult, Platform } from './types';

export type { LintConfig, LintResult, RuleFunction, Platform } from './types';

/**
 * Get all available rule names
 */
export function getAllRuleNames(): string[] {
  return Object.keys(rules);
}

/**
 * Get rule names applicable to a platform.
 * Returns platform-tagged rules + universal rules (those without a platform tag).
 */
export function getRulesForPlatform(platform: Platform): string[] {
  return Object.keys(rules).filter((name) => {
    const platforms = rulePlatforms[name];
    // No platforms = universal, always included
    if (!platforms) return true;
    return platforms.includes(platform);
  });
}

export function lintJsxCode(code: string, config: LintConfig): LintResult[] {
  const ast = parseJsx(code);
  const results: LintResult[] = [];

  // Determine which rules to run
  let rulesToRun: string[];

  if (config.platform) {
    // Platform mode: run rules tagged for this platform + universal rules
    rulesToRun = getRulesForPlatform(config.platform);
  } else if (config.exclude) {
    // Exclude mode: run all rules except those listed
    const excludeSet = new Set(config.rules ?? []);
    rulesToRun = Object.keys(rules).filter((name) => !excludeSet.has(name));
  } else {
    // Include mode (default): only run rules that are listed
    rulesToRun = config.rules ?? [];
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
