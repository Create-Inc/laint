import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-console-log'] };

describe('no-console-log rule', () => {
  it('should detect console.log calls', () => {
    const code = `console.log('hello');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-console-log');
    expect(results[0].severity).toBe('warning');
  });

  it('should detect console.log in functions', () => {
    const code = `
      function debug() {
        console.log('debugging');
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect multiple console.log calls', () => {
    const code = `
      console.log('first');
      console.log('second');
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(2);
  });

  it('should not flag console.error', () => {
    const code = `console.error('something went wrong');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag console.warn', () => {
    const code = `console.warn('deprecation warning');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag console.info', () => {
    const code = `console.info('server started');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag other function calls', () => {
    const code = `logger.log('hello');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag code without console', () => {
    const code = `const x = 5;`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
