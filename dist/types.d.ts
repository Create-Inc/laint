import type { File } from '@babel/types';
export interface LintResult {
    rule: string;
    message: string;
    line: number;
    column: number;
    severity: 'error' | 'warning';
}
export interface LintConfig {
    /**
     * List of rule names.
     * - When `exclude` is false/undefined: only these rules are enabled (include mode)
     * - When `exclude` is true: all rules are enabled except these (exclude mode)
     */
    rules: string[];
    /**
     * When true, enables all rules except those listed in `rules`.
     * When false/undefined, only rules listed in `rules` are enabled.
     * @default false
     */
    exclude?: boolean;
}
export type RuleFunction = (ast: File, code: string) => LintResult[];
