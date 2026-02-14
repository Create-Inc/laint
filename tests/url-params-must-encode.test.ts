import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const RULE = 'url-params-must-encode';

function lint(code: string) {
  return lintJsxCode(code, { rules: [RULE] });
}

describe(RULE, () => {
  it('flags unencoded value after ?key=', () => {
    const code = 'const url = `https://api.example.com/search?q=${query}`;';
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
    expect(results[0].message).toContain('encodeURIComponent');
  });

  it('flags unencoded value after &key=', () => {
    const code = 'const url = `https://api.example.com/search?q=test&page=${page}`;';
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('flags multiple unencoded params', () => {
    const code = 'const url = `https://api.example.com?q=${query}&page=${page}`;';
    const results = lint(code);
    expect(results).toHaveLength(2);
  });

  it('allows encodeURIComponent wrapped values', () => {
    const code = 'const url = `https://api.example.com?q=${encodeURIComponent(query)}`;';
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows template literals without URL params', () => {
    const code = 'const msg = `Hello ${name}, welcome!`;';
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows path segments (no query params)', () => {
    const code = 'const url = `https://api.example.com/users/${userId}`;';
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('does not flag non-template string concatenation', () => {
    const code = 'const url = "https://api.example.com?q=" + query;';
    const results = lint(code);
    expect(results).toHaveLength(0);
  });
});
