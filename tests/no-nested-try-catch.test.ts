import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-nested-try-catch'] };

describe('no-nested-try-catch rule', () => {
  it('should flag try-catch inside another try block', () => {
    const code = `
      function doWork() {
        try {
          try {
            riskyOperation();
          } catch (innerError) {
            handleInner(innerError);
          }
        } catch (outerError) {
          handleOuter(outerError);
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-nested-try-catch');
    expect(results[0].severity).toBe('warning');
    expect(results[0].message).toContain('Avoid nested try-catch');
  });

  it('should flag try-catch inside a catch block', () => {
    const code = `
      function doWork() {
        try {
          riskyOperation();
        } catch (error) {
          try {
            recover();
          } catch (recoverError) {
            logError(recoverError);
          }
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-nested-try-catch');
    expect(results[0].message).toContain('Flatten');
  });

  it('should not flag sequential try-catch blocks', () => {
    const code = `
      function doWork() {
        try {
          firstOperation();
        } catch (e1) {
          handleFirst(e1);
        }
        try {
          secondOperation();
        } catch (e2) {
          handleSecond(e2);
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag a single try-catch', () => {
    const code = `
      function doWork() {
        try {
          riskyOperation();
        } catch (error) {
          handleError(error);
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag try-catch in a separate function defined inside a try block', () => {
    const code = `
      function doWork() {
        try {
          const helper = () => {
            try {
              riskyOperation();
            } catch (innerError) {
              handleInner(innerError);
            }
          };
          helper();
        } catch (outerError) {
          handleOuter(outerError);
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should flag deeply nested try-catch', () => {
    const code = `
      function doWork() {
        try {
          try {
            try {
              riskyOperation();
            } catch (e3) {
              handle3(e3);
            }
          } catch (e2) {
            handle2(e2);
          }
        } catch (e1) {
          handle1(e1);
        }
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results.length).toBeGreaterThanOrEqual(2);
    results.forEach((r) => {
      expect(r.rule).toBe('no-nested-try-catch');
    });
  });
});
