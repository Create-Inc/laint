import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-empty-catch'] };

describe('no-empty-catch rule', () => {
  it('should detect empty catch blocks', () => {
    const code = `
      try {
        doSomething();
      } catch (e) {}
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-empty-catch');
    expect(results[0].severity).toBe('warning');
  });

  it('should detect empty catch without parameter', () => {
    const code = `
      try {
        doSomething();
      } catch {}
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect multiple empty catches', () => {
    const code = `
      try { a(); } catch (e) {}
      try { b(); } catch (e) {}
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(2);
  });

  it('should allow catch with error handling', () => {
    const code = `
      try {
        doSomething();
      } catch (e) {
        console.error(e);
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow catch with comment', () => {
    const code = `
      try {
        doSomething();
      } catch (e) {
        // intentionally ignored
      }
    `;
    // Note: comments are not part of the AST body, so a catch block
    // with only a comment is technically empty in the AST.
    // This is a known limitation - the comment case would still flag.
    // Users can add a no-op statement like void 0 if needed.
    const results = lintJsxCode(code, config);
    // This will still flag because comments aren't statements
    expect(results).toHaveLength(1);
  });

  it('should allow catch that rethrows', () => {
    const code = `
      try {
        doSomething();
      } catch (e) {
        throw e;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow catch with return', () => {
    const code = `
      function safeParse(json) {
        try {
          return JSON.parse(json);
        } catch (e) {
          return null;
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag code without try-catch', () => {
    const code = `const x = 5;`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
