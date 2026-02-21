import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-emoji-icons';

// Regex covering common emoji Unicode ranges
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{3030}\u{303D}\u{3297}\u{3299}\u{2139}\u{2194}-\u{2199}\u{21A9}\u{21AA}\u{23CF}\u{24C2}\u{25AA}\u{25AB}\u{2122}\u{2328}\u{23ED}-\u{23EF}]/u;

const MESSAGE =
  "Use icons from 'lucide-react' or 'lucide-react-native' instead of emoji characters";

export function noEmojiIcons(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    StringLiteral(path) {
      if (EMOJI_REGEX.test(path.node.value)) {
        const { loc } = path.node;
        results.push({
          rule: RULE_NAME,
          message: MESSAGE,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },
    JSXText(path) {
      if (EMOJI_REGEX.test(path.node.value)) {
        const { loc } = path.node;
        results.push({
          rule: RULE_NAME,
          message: MESSAGE,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'warning',
        });
      }
    },
  });

  return results;
}
