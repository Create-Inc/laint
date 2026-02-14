import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['logger-error-with-err'] };

describe('logger-error-with-err rule', () => {
  it('should flag logger.error with empty object (no err key)', () => {
    const code = `logger.error({}, "msg");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('logger-error-with-err');
    expect(results[0].severity).toBe('warning');
    expect(results[0].message).toContain('{ err: <Error> }');
  });

  it('should flag logger.error with object missing err key', () => {
    const code = `logger.error({ userId: 1 }, "msg");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('logger-error-with-err');
  });

  it('should flag logger.error with string only (no object)', () => {
    const code = `logger.error("msg");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('logger-error-with-err');
  });

  it('should flag log.error with object missing err key', () => {
    const code = `log.error({ code: 500 }, "failed");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('logger-error-with-err');
  });

  it('should not flag logger.error with err property', () => {
    const code = `logger.error({ err: error }, "msg");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag logger.error with err and other properties', () => {
    const code = `logger.error({ err: new Error("x"), userId: 1 }, "msg");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag console.error (different pattern)', () => {
    const code = `console.error("msg");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag logger.info (not error level)', () => {
    const code = `logger.info({}, "msg");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag logger.warn (not error level)', () => {
    const code = `logger.warn({}, "msg");`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
