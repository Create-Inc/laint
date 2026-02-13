import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-silent-skip'] };

describe('no-silent-skip rule', () => {
  describe('should flag', () => {
    it('should detect if without else', () => {
      const code = `
        function process(user) {
          if (user) {
            sendEmail(user);
            updateDb(user);
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe('no-silent-skip');
      expect(results[0].severity).toBe('warning');
    });

    it('should detect single-statement if without else', () => {
      const code = `
        function process(data) {
          setup();
          if (data.valid) {
            handle(data);
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
    });

    it('should detect multiple ifs without else', () => {
      const code = `
        function process(a, b) {
          if (a) {
            handleA(a);
          }
          if (b) {
            handleB(b);
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(2);
    });

    it('should flag if where last statement is not an early exit', () => {
      const code = `
        function process(data) {
          if (data) {
            console.log("processing");
            handle(data);
            console.log("done");
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
    });
  });

  describe('should not flag', () => {
    it('should not flag if with else', () => {
      const code = `
        function process(user) {
          if (user) {
            sendEmail(user);
          } else {
            logger.warn("No user, skipping");
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag guard clause with return', () => {
      const code = `
        function process(data) {
          if (!data) return;
          handle(data);
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag guard clause with return in block', () => {
      const code = `
        function process(data) {
          if (!data) {
            logger.warn("no data");
            return;
          }
          handle(data);
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag guard clause with throw', () => {
      const code = `
        function process(data) {
          if (!data) {
            throw new Error("data required");
          }
          handle(data);
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag if with else-if chain', () => {
      const code = `
        function process(status) {
          if (status === 'active') {
            handleActive();
          } else if (status === 'inactive') {
            handleInactive();
          } else {
            logger.warn("Unknown status");
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag guard clause with continue in loop', () => {
      const code = `
        function processItems(items) {
          for (const item of items) {
            if (!item.valid) continue;
            handle(item);
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag guard clause with break in loop', () => {
      const code = `
        function findFirst(items) {
          for (const item of items) {
            if (item.match) {
              result = item;
              break;
            }
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag if-else-if where final else-if has no else', () => {
      // The else-if is an IfStatement as the alternate of the parent —
      // we skip it because it's part of a chain, not a standalone if
      const code = `
        function process(status) {
          if (status === 'a') {
            handleA();
          } else if (status === 'b') {
            handleB();
          }
        }
      `;
      const results = lintJsxCode(code, config);
      // Only the outer if should be considered; the else-if is part of its chain
      // The outer if has an alternate (the else-if), so it's not flagged
      // The inner else-if is skipped because it's in an alternate position
      expect(results).toHaveLength(0);
    });
  });
});
