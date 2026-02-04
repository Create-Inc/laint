import type { LintConfig, LintResult } from './types';
export type { LintConfig, LintResult, RuleFunction } from './types';
export declare function lintJsxCode(code: string, config: LintConfig): LintResult[];
