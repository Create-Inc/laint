import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const RULE = 'no-string-coerce-error';

function lint(code: string) {
  return lintJsxCode(code, { rules: [RULE] });
}

describe(RULE, () => {
  it('flags String(error) in else branch of instanceof Error ternary', () => {
    const code = `
      const msg = error instanceof Error ? error.message : String(error);
    `;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
    expect(results[0].message).toContain('JSON.stringify');
  });

  it('flags String(err) with different variable names', () => {
    const code = `
      const msg = err instanceof Error ? err.message : String(err);
    `;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('flags nested String(error) in else branch', () => {
    const code = `
      const msg = error instanceof Error ? error.message : new Error(String(error));
    `;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('allows JSON.stringify in else branch', () => {
    const code = `
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
    `;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows String() on unrelated ternaries', () => {
    const code = `
      const x = typeof value === 'number' ? value : String(value);
    `;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('ignores String() with a different variable than the instanceof check', () => {
    const code = `
      const msg = error instanceof Error ? error.message : String(other);
    `;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });
});
