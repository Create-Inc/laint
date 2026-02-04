import type { RuleFunction } from '../types';
import { noRelativePaths } from './no-relative-paths';

export const rules: Record<string, RuleFunction> = {
  'no-relative-paths': noRelativePaths,
};
