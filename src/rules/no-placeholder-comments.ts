import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-placeholder-comments';

const PLACEHOLDER_PATTERNS = [
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bHACK\b/i,
  /\bXXX\b/i,
  /\badd\s+your\b/i,
  /\bimplement\s+(this|here|me)\b/i,
  /\bplaceholder\b/i,
  /\breplace\s+(this|me|with)\b/i,
  /\bfill\s+in\b/i,
  /\byour\s+(code|logic|implementation)\s+here\b/i,
  /\bchange\s+this\b/i,
  /\binsert\s+(here|your)\b/i,
];

export function noPlaceholderComments(ast: File, code: string): LintResult[] {
  const results: LintResult[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match single-line comments (//) and multi-line comment content
    const commentMatch =
      line.match(/\/\/(.*)$/) || line.match(/\/\*(.*)/) || line.match(/^\s*\*\s?(.*)/);
    if (!commentMatch) continue;

    const commentText = commentMatch[1];
    if (!commentText) continue;

    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(commentText)) {
        results.push({
          rule: RULE_NAME,
          message: `Remove placeholder comment: "${commentText.trim()}"`,
          line: i + 1,
          column: 0,
          severity: 'warning',
        });
        break;
      }
    }
  }

  return results;
}
