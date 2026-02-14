import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const RULE = 'no-loose-equality';

function lint(code: string) {
  return lintJsxCode(code, { rules: [RULE] });
}

describe(RULE, () => {
  it('flags == comparison', () => {
    const code = `if (a == b) {}`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
    expect(results[0].message).toContain('===');
  });

  it('flags != comparison', () => {
    const code = `if (a != b) {}`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('!==');
  });

  it('flags == with string literal', () => {
    const code = `if (x == 'hello') {}`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('flags == with number', () => {
    const code = `if (count == 0) {}`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('allows == null (idiomatic null check)', () => {
    const code = `if (value == null) {}`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows != null (idiomatic null check)', () => {
    const code = `if (value != null) {}`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows null == value (reverse null check)', () => {
    const code = `if (null == value) {}`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows === comparison', () => {
    const code = `if (a === b) {}`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows !== comparison', () => {
    const code = `if (a !== b) {}`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('flags multiple loose comparisons', () => {
    const code = `
      if (a == b) {}
      if (c != d) {}
    `;
    const results = lint(code);
    expect(results).toHaveLength(2);
  });
});
