import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const RULE = 'catch-must-log-to-sentry';

function lint(code: string) {
  return lintJsxCode(code, { rules: [RULE] });
}

describe(RULE, () => {
  it('flags catch with logger.error but no Sentry', () => {
    const code = `
      try {
        fetchData();
      } catch (error) {
        logger.error('Failed', error);
      }
    `;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
    expect(results[0].message).toContain('Sentry');
  });

  it('flags catch with console.error but no Sentry', () => {
    const code = `
      try {
        fetchData();
      } catch (error) {
        console.error('Failed', error);
      }
    `;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('allows catch with both logger.error and Sentry', () => {
    const code = `
      try {
        fetchData();
      } catch (error) {
        logger.error('Failed', error);
        Sentry.captureException(error);
      }
    `;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows catch with only Sentry', () => {
    const code = `
      try {
        fetchData();
      } catch (error) {
        Sentry.captureException(error);
      }
    `;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows catch without any error logging', () => {
    const code = `
      try {
        fetchData();
      } catch (error) {
        handleError(error);
      }
    `;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows empty catch block', () => {
    const code = `
      try {
        fetchData();
      } catch (error) {}
    `;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('flags multiple catch blocks independently', () => {
    const code = `
      try { a(); } catch (e) { logger.error(e); }
      try { b(); } catch (e) { logger.error(e); Sentry.captureException(e); }
    `;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });
});
