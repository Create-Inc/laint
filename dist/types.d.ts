import type { File } from '@babel/types';
export interface LintResult {
    rule: string;
    message: string;
    line: number;
    column: number;
    severity: 'error' | 'warning';
}
export interface LintConfig {
    rules: string[];
}
export type RuleFunction = (ast: File, code: string) => LintResult[];
