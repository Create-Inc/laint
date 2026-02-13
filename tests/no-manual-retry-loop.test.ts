import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-manual-retry-loop'] };

describe('no-manual-retry-loop rule', () => {
  describe('should flag', () => {
    it('should detect for loop with setTimeout polling', () => {
      const code = `
        async function waitForReady(id) {
          for (let attempt = 0; attempt < 15; attempt++) {
            const result = await checkStatus(id);
            if (result.ready) return result;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          return null;
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe('no-manual-retry-loop');
      expect(results[0].severity).toBe('warning');
    });

    it('should detect while loop with setTimeout retry', () => {
      const code = `
        async function retryFetch(url) {
          let attempts = 0;
          while (attempts < 3) {
            try {
              return await fetch(url);
            } catch (e) {
              attempts++;
              await new Promise(r => setTimeout(r, 1000));
            }
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
    });

    it('should detect do-while loop with setTimeout', () => {
      const code = `
        async function poll() {
          let ready = false;
          do {
            ready = await check();
            if (!ready) await new Promise(r => setTimeout(r, 500));
          } while (!ready);
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
    });

    it('should detect bare setTimeout in loop', () => {
      const code = `
        async function waitLoop() {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => ping(), 1000);
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
    });
  });

  describe('should not flag', () => {
    it('should not flag loop without setTimeout', () => {
      const code = `
        function sum(items) {
          let total = 0;
          for (const item of items) {
            total += item.value;
          }
          return total;
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag async loop without setTimeout', () => {
      const code = `
        async function processAll(items) {
          for (const item of items) {
            await process(item);
          }
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag setTimeout outside a loop', () => {
      const code = `
        function debounce() {
          setTimeout(() => doWork(), 300);
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag setInterval (not in a loop)', () => {
      const code = `
        function startPolling() {
          setInterval(() => check(), 5000);
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag retry library usage', () => {
      const code = `
        import retry from 'async-retry';
        async function fetchWithRetry(url) {
          return await retry(async () => {
            const res = await fetch(url);
            if (!res.ok) throw new Error('failed');
            return res.json();
          }, { retries: 3 });
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });
  });
});
