import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-optional-props'] };

describe('no-optional-props rule', () => {
  describe('should flag optional properties', () => {
    it('should flag optional property in interface', () => {
      const code = `interface Foo { bar?: string }`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe('no-optional-props');
      expect(results[0].message).toContain('optional properties');
      expect(results[0].severity).toBe('warning');
    });

    it('should flag optional property in type alias', () => {
      const code = `type Foo = { bar?: number }`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe('no-optional-props');
    });

    it('should flag multiple optional properties', () => {
      const code = `
        interface Foo {
          bar?: string;
          baz?: number;
          qux?: boolean;
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(3);
    });
  });

  describe('should not flag', () => {
    it('should not flag required properties in interface', () => {
      const code = `interface Foo { bar: string }`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag properties with null union', () => {
      const code = `interface Foo { bar: string | null }`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag required properties', () => {
      const code = `
        interface Foo {
          bar: string;
          baz: number;
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag optional function parameters', () => {
      const code = `function foo(bar?: string) { return bar; }`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag optional class properties', () => {
      const code = `
        class Foo {
          bar?: string;
        }
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });
  });
});
