import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const RULE = 'no-new-error-in-err';

function lint(code: string) {
  return lintJsxCode(code, { rules: [RULE] });
}

describe(RULE, () => {
  it('flags err(new Error("message"))', () => {
    const code = `function f() { return err(new Error('Something failed')); }`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
    expect(results[0].message).toContain('plain object');
  });

  it('flags err(new Error("message", { cause }))', () => {
    const code = `function f() { return err(new Error('Failed to detect pull request', { cause: error })); }`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('flags err(new Error()) with no args', () => {
    const code = `function f() { return err(new Error()); }`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('flags err(new Error()) in expression position', () => {
    const code = `const result = err(new Error('failed'));`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('allows err("string message")', () => {
    const code = `function f() { return err('Something failed'); }`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows err({ message, cause })', () => {
    const code = `function f() { return err({ message: 'Failed', cause: error }); }`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows err(someVariable)', () => {
    const code = `function f() { return err(existingError); }`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows new Error outside err()', () => {
    const code = `throw new Error('Something failed');`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows other function calls with new Error', () => {
    const code = `logError(new Error('Something failed'));`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });
});
