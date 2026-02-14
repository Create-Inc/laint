import traverse from '@babel/traverse';
import type { File } from '@babel/types';
import type { LintResult } from '../types';

const RULE_NAME = 'no-hardcoded-secrets';

// Variable/property name patterns that suggest secrets
const SECRET_NAME_PATTERNS = [
  /api[_-]?key/i,
  /api[_-]?secret/i,
  /secret[_-]?key/i,
  /access[_-]?key/i,
  /access[_-]?token/i,
  /auth[_-]?token/i,
  /private[_-]?key/i,
  /client[_-]?secret/i,
  /password/i,
  /passwd/i,
  /database[_-]?url/i,
  /connection[_-]?string/i,
  /credentials/i,
];

// Value patterns that look like actual secrets
const SECRET_VALUE_PATTERNS = [
  /^sk[-_][a-zA-Z0-9_-]{20,}/, // Stripe-style keys
  /^pk[-_][a-zA-Z0-9_-]{20,}/, // Stripe public keys
  /^ghp_[a-zA-Z0-9]{36,}/, // GitHub personal access tokens
  /^gho_[a-zA-Z0-9]{36,}/, // GitHub OAuth tokens
  /^github_pat_/, // GitHub fine-grained PATs
  /^xox[bporas]-/, // Slack tokens
  /^eyJ[a-zA-Z0-9_-]{20,}\.eyJ/, // JWTs
  /^AKIA[0-9A-Z]{16}/, // AWS access key IDs
  /^AIza[0-9A-Za-z_-]{35}/, // Google API keys
];

function isSecretName(name: string): boolean {
  return SECRET_NAME_PATTERNS.some((p) => p.test(name));
}

function isSecretValue(value: string): boolean {
  return SECRET_VALUE_PATTERNS.some((p) => p.test(value));
}

export function noHardcodedSecrets(ast: File, _code: string): LintResult[] {
  const results: LintResult[] = [];

  traverse(ast, {
    VariableDeclarator(path) {
      const { id, init, loc } = path.node;

      if (id.type !== 'Identifier' || !init) return;
      if (init.type !== 'StringLiteral' && init.type !== 'TemplateLiteral') return;

      const value =
        init.type === 'StringLiteral'
          ? init.value
          : (init.quasis?.map((q) => q.value.raw).join('') ?? '');

      // Check if variable name suggests a secret and value looks non-trivial
      if (isSecretName(id.name) && value.length > 0) {
        // Allow references to env vars like process.env.X or empty strings
        if (value === '' || value.startsWith('process.env')) return;

        results.push({
          rule: RULE_NAME,
          message: `Possible hardcoded secret in "${id.name}". Use environment variables instead`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'error',
        });
        return;
      }

      // Check if the value itself looks like a known secret format
      if (init.type === 'StringLiteral' && isSecretValue(value)) {
        results.push({
          rule: RULE_NAME,
          message: `Possible hardcoded secret (detected known token pattern). Use environment variables instead`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'error',
        });
      }
    },

    ObjectProperty(path) {
      const { key, value, loc } = path.node;

      let keyName: string | null = null;
      if (key.type === 'Identifier') keyName = key.name;
      else if (key.type === 'StringLiteral') keyName = key.value;

      if (!keyName || value.type !== 'StringLiteral') return;

      if (isSecretName(keyName) && value.value.length > 0) {
        results.push({
          rule: RULE_NAME,
          message: `Possible hardcoded secret in "${keyName}". Use environment variables instead`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'error',
        });
      }

      if (isSecretValue(value.value)) {
        results.push({
          rule: RULE_NAME,
          message: `Possible hardcoded secret (detected known token pattern). Use environment variables instead`,
          line: loc?.start.line ?? 0,
          column: loc?.start.column ?? 0,
          severity: 'error',
        });
      }
    },
  });

  return results;
}
