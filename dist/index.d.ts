import type { LintConfig, LintResult } from './types';
export type { LintConfig, LintResult, RuleFunction } from './types';
/**
 * Get all available rule names
 */
export declare function getAllRuleNames(): string[];
export declare function lintJsxCode(code: string, config: LintConfig): LintResult[];
