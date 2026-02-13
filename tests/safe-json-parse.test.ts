import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['safe-json-parse'] };

describe('safe-json-parse rule', () => {
  it('should flag bare JSON.parse(data)', () => {
    const code = `
      const data = JSON.parse(rawInput);
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('safe-json-parse');
    expect(results[0].message).toContain('try-catch');
    expect(results[0].message).toContain('fast-safe-stringify');
    expect(results[0].severity).toBe('warning');
  });

  it('should flag JSON.parse in if/else but not try-catch', () => {
    const code = `
      function process(input) {
        if (input) {
          const data = JSON.parse(input);
          return data;
        } else {
          return null;
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('safe-json-parse');
  });

  it('should flag JSON.parse inside a function with no try-catch', () => {
    const code = `
      function parseData(raw) {
        const parsed = JSON.parse(raw);
        return parsed;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('safe-json-parse');
  });

  it('should NOT flag JSON.parse inside try block', () => {
    const code = `
      function parseData(raw) {
        try {
          const parsed = JSON.parse(raw);
          return parsed;
        } catch (e) {
          return null;
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should NOT flag JSON.parse inside catch block', () => {
    const code = `
      function handle(raw) {
        try {
          doSomething();
        } catch (e) {
          const fallback = JSON.parse(raw);
          return fallback;
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should NOT flag JSON.stringify (different concern)', () => {
    const code = `
      const str = JSON.stringify({ key: 'value' });
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should NOT flag JSON.parse with a wrapper function that has try-catch around the call', () => {
    const code = `
      function safeParse(raw) {
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.error('Parse failed', e);
          return null;
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
