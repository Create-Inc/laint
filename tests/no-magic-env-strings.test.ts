import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const RULE = 'no-magic-env-strings';

function lint(code: string) {
  return lintJsxCode(code, { rules: [RULE] });
}

describe(RULE, () => {
  it('flags process.env.MY_VAR', () => {
    const code = `const key = process.env.API_KEY;`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
    expect(results[0].message).toContain('API_KEY');
    expect(results[0].message).toContain('enum');
  });

  it('flags process.env["MY_VAR"]', () => {
    const code = `const key = process.env['DATABASE_URL'];`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('DATABASE_URL');
  });

  it('flags multiple env accesses', () => {
    const code = `
      const a = process.env.API_KEY;
      const b = process.env['SECRET'];
    `;
    const results = lint(code);
    expect(results).toHaveLength(2);
  });

  it('allows dynamic env access with variable', () => {
    const code = `const val = process.env[envKey];`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows non-process.env member expressions', () => {
    const code = `const val = config.env.API_KEY;`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows process.env without property access', () => {
    const code = `const env = process.env;`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });
});
