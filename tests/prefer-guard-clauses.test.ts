import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['prefer-guard-clauses'] };

describe('prefer-guard-clauses rule', () => {
  describe('single if wrapping entire function body', () => {
    it('should detect function body wrapped in a single if', () => {
      const code = `
        function handleClick(user) {
          if (user) {
            doSomething();
            doMore();
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe('prefer-guard-clauses');
      expect(results[0].message).toContain('Invert this condition');
      expect(results[0].severity).toBe('warning');
    });

    it('should detect arrow function body wrapped in a single if', () => {
      const code = `
        const handleClick = (user) => {
          if (user) {
            doSomething();
          }
        };
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
    });

    it('should not flag if there is an else branch', () => {
      const code = `
        function handleClick(user) {
          if (user) {
            doSomething();
          } else {
            doOther();
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag if there are multiple statements', () => {
      const code = `
        function handleClick(user) {
          const name = user.name;
          if (name) {
            doSomething();
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });
  });

  describe('nested if statements (arrow pattern)', () => {
    it('should detect nested ifs without else', () => {
      const code = `
        function process(data) {
          const x = 1;
          if (data) {
            if (data.valid) {
              handle(data);
            }
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
      expect(results[0].message).toContain('guard clauses');
    });

    it('should detect deeply nested ifs', () => {
      const code = `
        function process(a) {
          if (a) {
            if (a.b) {
              doSomething();
            }
          }
        }
      `;
      const results = lintJsxCode(code, config);
      // The outer if wrapping the body triggers case 1,
      // so we get one violation
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should not flag flat if statements', () => {
      const code = `
        function process(data) {
          if (!data) return;
          if (!data.valid) return;
          handle(data);
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag single-level if in multi-statement body', () => {
      const code = `
        function process(data) {
          setup();
          if (data) {
            handle(data);
          }
          cleanup();
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty function bodies', () => {
      const code = `function noop() {}`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should handle arrow functions without block body', () => {
      const code = `const fn = (x) => x + 1;`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });
  });
});
