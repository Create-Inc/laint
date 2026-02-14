import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-floating-promises'] };

describe('no-floating-promises rule', () => {
  it('should detect floating fetch() calls', () => {
    const code = `fetch('/api/data');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-floating-promises');
    expect(results[0].message).toContain('fetch()');
  });

  it('should detect floating .json() calls', () => {
    const code = `response.json();`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('.json()');
  });

  it('should detect floating .text() calls', () => {
    const code = `response.text();`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect floating IIFE async functions', () => {
    const code = `(async () => { await doStuff(); })();`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('async function');
  });

  it('should allow awaited fetch', () => {
    const code = `const res = await fetch('/api/data');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow fetch assigned to variable', () => {
    const code = `const promise = fetch('/api/data');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow fetch with .then()', () => {
    const code = `fetch('/api/data').then(r => r.json());`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag non-async IIFE', () => {
    const code = `(() => { doStuff(); })();`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag regular function calls', () => {
    const code = `doSomething();`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
